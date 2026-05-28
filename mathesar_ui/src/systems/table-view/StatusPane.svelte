<script lang="ts">
  import { _ } from 'svelte-i18n';

  import { States } from '@mathesar/api/rest/utils/requestUtils';
  import { MiniPagination } from '@mathesar/components/mini-pagination';
  import RefreshButton from '@mathesar/components/RefreshButton.svelte';
  import { iconAddNew } from '@mathesar/icons';
  import { getTabularDataStoreFromContext } from '@mathesar/stores/table-data';
  import { getFirstEditableColumn } from '@mathesar/stores/table-data/processedColumns';
  import type { RpcDownloadProgress } from '@mathesar/packages/json-rpc-client-builder';
  import Pagination, { UNLIMITED_PAGE_SIZE } from '@mathesar/utils/Pagination';
  import { Select, SpinnerButton } from '@mathesar-component-library';

  const tabularData = getTabularDataStoreFromContext();
  const numberFormatter = new Intl.NumberFormat();
  const byteFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  });
  const pageSizeOptions = [
    10,
    50,
    100,
    500,
    1000,
    5000,
    10000,
    UNLIMITED_PAGE_SIZE,
  ];
  const breakpoints = {
    miniPaginationDropdownIndicator: 430,
    newAndUnsavedRecordCounts: 450,
    paginationTotalPages: 510,
    pageSizeDropdown: 590,
    newRecordLabel: 690,
    refreshLabel: 720,
    leftAndRightBounds: 770,
  };

  export let context: 'page' | 'widget' = 'page';

  let width: number;

  $: ({
    recordsData,
    meta,
    isLoading,
    columnsDataStore,
    constraintsDataStore,
    canInsertRecords,
    processedColumns,
    selection,
  } = $tabularData);
  $: ({ pagination } = meta);
  $: ({ leftBound, rightBound } = $pagination);
  $: ({ totalCount, state, newRecords, persistedNewRecords, downloadProgress } =
    recordsData);
  $: recordState = $state;
  $: downloadProgressLabel = formatDownloadProgress($downloadProgress);
  $: loadingStatusLabel =
    recordState === States.Loading
      ? downloadProgressLabel ?? 'Waiting for data'
      : undefined;
  $: columnsFetchStatus = columnsDataStore.fetchStatus;
  $: max = Math.min($totalCount ?? 0, rightBound);
  $: isError =
    $columnsFetchStatus?.state === 'failure' ||
    recordState === States.Error ||
    $constraintsDataStore.state === States.Error;
  $: hasNewRecordButton = context !== 'widget' && $canInsertRecords;
  $: refreshButtonState = (() => {
    let buttonState: 'loading' | 'error' | undefined = undefined;
    if ($isLoading) {
      buttonState = 'loading';
    }
    if (isError) {
      buttonState = 'error';
    }
    return buttonState;
  })();

  function refresh() {
    void $tabularData.refresh();
  }

  function getPageSizeLabel(option: number | undefined): string {
    if (option === UNLIMITED_PAGE_SIZE) return $_('unlimited');
    return numberFormatter.format(option ?? 0);
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return `${byteFormatter.format(bytes / 1024)}KB`;
    }
    return `${byteFormatter.format(bytes / 1024 / 1024)}MB`;
  }

  function formatDownloadProgress(
    progress: RpcDownloadProgress | undefined,
  ): string | undefined {
    if (!progress || progress.loadedBytes <= 0) return undefined;
    const loaded = formatBytes(progress.loadedBytes);
    return progress.totalBytes
      ? `${loaded} / ${formatBytes(progress.totalBytes)}`
      : loaded;
  }

  async function addRecord() {
    await $tabularData.addNewRecord();

    // Select and focus the first editable cell in the new record row so that
    // the user can start editing immediately.
    selection.update((s) =>
      s.ofNewRecordDataEntryCell(
        getFirstEditableColumn($processedColumns.values())?.id.toString(),
      ),
    );
  }
</script>

<div
  class="status-pane"
  class:context-widget={context === 'widget'}
  class:context-page={context === 'page'}
  bind:clientWidth={width}
>
  <div class="status-pane-items-section">
    {#if hasNewRecordButton}
      <SpinnerButton
        disabled={$isLoading}
        size="medium"
        appearance="primary"
        onClick={addRecord}
        icon={iconAddNew}
        label={width > breakpoints.newRecordLabel
          ? $_('new_record')
          : undefined}
      />
    {/if}
    <div class="record-count">
      {#if $totalCount}
        <span>
          {#if width > breakpoints.leftAndRightBounds}
            {$_('showing_n_to_m_of_total', {
              values: {
                leftBound: numberFormatter.format(leftBound),
                rightBound: numberFormatter.format(max),
                totalCount: numberFormatter.format($totalCount),
              },
            })}
          {:else}
            {$_('count_records', {
              values: { count: numberFormatter.format($totalCount) },
            })}
          {/if}
        </span>
      {:else if recordState !== States.Loading}
        {$_('no_records_found')}
      {/if}

      {#if loadingStatusLabel}
        <span class="download-progress">{loadingStatusLabel}</span>
      {/if}

      {#if width > breakpoints.newAndUnsavedRecordCounts}
        {#if $persistedNewRecords.length > 0}
          <span class="pill">
            +{$_('count_new_records', {
              values: {
                count: $persistedNewRecords.length,
              },
            })}
          </span>
        {/if}

        {#if $newRecords.length - $persistedNewRecords.length > 0}
          <span class="pill">
            +{$_('count_unsaved_records', {
              values: {
                count: $newRecords.length - $persistedNewRecords.length,
              },
            })}
          </span>
        {/if}
      {/if}
    </div>
  </div>

  <div class="status-pane-items-section">
    {#if $totalCount !== undefined}
      <MiniPagination
        bind:pagination={$pagination}
        recordCount={$totalCount ?? 0}
        pageSizeOptions={width <= breakpoints.pageSizeDropdown
          ? pageSizeOptions
          : undefined}
        showTotalPages={width > breakpoints.paginationTotalPages}
        hasDropdownIndicator={width >
          breakpoints.miniPaginationDropdownIndicator}
      />
      {#if width > breakpoints.pageSizeDropdown}
        <div class="page-size-dropdown">
          <Select
            triggerAppearance="secondary"
            options={pageSizeOptions}
            value={$pagination.size}
            getLabel={getPageSizeLabel}
            on:change={(e) => {
              $pagination = new Pagination({
                page: 1,
                size: e.detail,
              });
            }}
          />
        </div>
      {/if}
    {/if}
    <RefreshButton
      on:click={refresh}
      state={refreshButtonState}
      showLabel={width > breakpoints.refreshLabel}
    />
  </div>
</div>

<style lang="scss">
  .status-pane {
    padding: var(--status-bar-padding);
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    flex-shrink: 0;
    flex-basis: 32px;

    &.context-widget {
      font-size: 80%;
    }

    .record-count {
      display: inline-flex;
      align-items: center;
      gap: var(--sm5);
    }

    .pill {
      font-size: var(--sm2);
      display: inline-block;
      border: 1px solid var(--color-border-control);
      border-radius: var(--border-radius-m);
      padding: var(--sm6);
    }

    .download-progress {
      color: var(--color-fg-subtle-1);
      font-size: var(--sm2);
      white-space: nowrap;
    }
    .page-size-dropdown {
      width: min-content;
      & > :global(*) {
        background: var(--color-bg-control);
        border-color: var(--color-border-control);
      }
    }
  }

  .status-pane-items-section {
    display: flex;
    flex-direction: row;
    align-items: center;

    > :global(* + *) {
      margin-left: 1rem;
    }
  }
</style>
