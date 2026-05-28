<script lang="ts">
  import { type Writable, get } from 'svelte/store';
  import { _ } from 'svelte-i18n';

  import ProcessedColumnName from '@mathesar/components/column/ProcessedColumnName.svelte';
  import TextInputWithPrefix from '@mathesar/component-library/text-input/TextInputWithPrefix.svelte';
  import {
    UiSwitch,
    getUiAdapterVariant,
  } from '@mathesar/components/ui-adapters';
  import { uiMode } from '@mathesar/stores/uiMode';
  import {
    HiddenColumns,
    getTabularDataStoreFromContext,
  } from '@mathesar/stores/table-data';
  import {
    Checkbox,
    LabeledInput,
    iconSearch,
  } from '@mathesar-component-library';

  const tabularData = getTabularDataStoreFromContext();

  export let hiddenColumns: Writable<HiddenColumns>;
  $: ({ processedColumns } = $tabularData);

  $: allColumns = [...$processedColumns.values()];
  $: adapterVariant = getUiAdapterVariant($uiMode);
  $: hiddenCount = $hiddenColumns.size;
  $: totalCount = allColumns.length;
  $: isShadcn = adapterVariant === 'shadcn';

  let searchQuery = '';

  $: normalizedSearchQuery = searchQuery.trim().toLowerCase();
  $: visibleColumns =
    isShadcn && normalizedSearchQuery
      ? allColumns.filter((column) =>
          [column.column.name, column.column.description ?? '']
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearchQuery),
        )
      : allColumns;

  function handleCheckboxChange(columnId: string, checked: boolean) {
    hiddenColumns.update((h) =>
      checked ? h.withColumn(columnId) : h.withoutColumn(columnId),
    );
  }

  function hideAll() {
    hiddenColumns.set(new HiddenColumns(allColumns.map((c) => c.id)));
  }

  function showAll() {
    hiddenColumns.set(new HiddenColumns());
  }
</script>

<div class="hide-columns">
  <div class="header">
    {#if isShadcn}
      <div class="title">
        <span class="title-label">{get(_)('columns')}</span>
        {#if hiddenCount > 0}
          <span class="title-count" aria-label="hidden columns count">
            {hiddenCount}/{totalCount}
          </span>
        {/if}
      </div>
    {/if}
    <div class="links">
      <button type="button" class="link" on:click={hideAll}>
        {get(_)('hide_all')}
      </button>
      <span class="separator">|</span>
      <button type="button" class="link" on:click={showAll}>
        {get(_)('show_all')}
      </button>
    </div>
  </div>
  {#if isShadcn}
    <div class="search">
      <TextInputWithPrefix
        prefixIcon={iconSearch}
        placeholder={get(_)('columns')}
        aria-label={get(_)('columns')}
        bind:value={searchQuery}
      />
    </div>
  {/if}
  <div class="column-list">
    {#each visibleColumns as column (column.id)}
      {@const checked = $hiddenColumns.has(column.id)}
      {#if adapterVariant === 'legacy'}
        <LabeledInput layout="inline-input-first">
          <span slot="label">
            <ProcessedColumnName processedColumn={column} />
          </span>
          <Checkbox
            {checked}
            on:change={(e) => handleCheckboxChange(column.id, e.detail)}
          />
        </LabeledInput>
      {:else}
        <div class="hide-column-row" class:checked>
          <button
            type="button"
            class="hide-column-label"
            on:click={() => handleCheckboxChange(column.id, !checked)}
          >
            <ProcessedColumnName processedColumn={column} />
          </button>
          <UiSwitch
            {checked}
            ariaLabel={`Toggle hidden state for ${column.column.name}`}
            on:change={(e) => handleCheckboxChange(column.id, e.detail)}
          />
        </div>
      {/if}
    {/each}
  </div>
</div>

<style lang="scss">
  .hide-columns {
    min-width: 20rem;
    padding: 0.5rem 0;

    .header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 0.5rem 1rem;

      .links {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;

        .link {
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          color: var(--color-link);
          text-decoration: underline;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;

          &:hover {
            color: var(--color-link-hover);
          }

          &:active {
            color: var(--color-link-active);
          }
        }

        .separator {
          color: var(--color-fg-subtle-2);
        }
      }
    }

    .column-list {
      padding: 0 1rem;

      :global(.labeled-input) {
        margin-bottom: 0.5rem;
      }
    }
  }

  .hide-column-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--glasklar-ui-dropdown-item-gap, 0.75rem);
    min-height: var(--glasklar-ui-dropdown-item-height, 2.25rem);
    padding: 0.25rem 0.38rem 0.25rem 0.5rem;
    border-radius: var(--glasklar-ui-radius, 7px);
    color: var(--glasklar-ui-text, var(--color-fg-base));
  }

  .hide-column-row:hover {
    background: var(--glasklar-ui-hover, var(--color-bg-control-hover));
  }

  .hide-column-row.checked {
    background: color-mix(
      in srgb,
      var(--glasklar-ui-accent-muted, var(--color-selection-subtle-1)),
      transparent 35%
    );
  }

  .hide-column-label {
    min-width: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hide-column-label:focus-visible {
    outline: 2px solid
      var(--glasklar-ui-focus-ring, var(--color-border-control-focused));
    outline-offset: 2px;
    border-radius: 5px;
  }
</style>
