<script lang="ts">
  import { get } from 'svelte/store';
  import { _ } from 'svelte-i18n';

  import ProcessedColumnName from '@mathesar/components/column/ProcessedColumnName.svelte';
  import TextInputWithPrefix from '@mathesar/component-library/text-input/TextInputWithPrefix.svelte';
  import { getUiAdapterVariant } from '@mathesar/components/ui-adapters';
  import type { ProcessedColumn } from '@mathesar/stores/table-data';
  import { uiMode } from '@mathesar/stores/uiMode';
  import {
    ButtonMenuItem,
    Menu,
    iconSearch,
  } from '@mathesar-component-library';

  export let columns: ProcessedColumn[] = [];
  export let onSelect: (column: ProcessedColumn) => unknown;
  export let wrapInMenu = true;

  let searchQuery = '';

  function getSearchText(column: ProcessedColumn): string {
    return [column.column.name, column.column.description ?? '']
      .join(' ')
      .toLowerCase();
  }

  function selectColumn(column: ProcessedColumn): void {
    onSelect(column);
    searchQuery = '';
  }

  $: normalizedSearchQuery = searchQuery.trim().toLowerCase();
  $: filteredColumns = normalizedSearchQuery
    ? columns.filter((column) =>
        getSearchText(column).includes(normalizedSearchQuery),
      )
    : columns;
  $: isShadcn = getUiAdapterVariant($uiMode) === 'shadcn';
</script>

<div class="operation-column-picker">
  {#if isShadcn}
    <div class="search">
      <TextInputWithPrefix
        prefixIcon={iconSearch}
        placeholder={get(_)('columns')}
        aria-label={get(_)('columns')}
        focusOnMount
        bind:value={searchQuery}
      />
    </div>
  {/if}

  {#if wrapInMenu}
    <Menu>
      {#each filteredColumns as column (column.id)}
        <ButtonMenuItem on:click={() => selectColumn(column)}>
          <ProcessedColumnName processedColumn={column} />
        </ButtonMenuItem>
      {:else}
        <div class="empty">{get(_)('no_matching_records')}</div>
      {/each}
    </Menu>
  {:else}
    <div class="column-picker-menu">
      {#each filteredColumns as column (column.id)}
        <ButtonMenuItem on:click={() => selectColumn(column)}>
          <ProcessedColumnName processedColumn={column} />
        </ButtonMenuItem>
      {:else}
        <div class="empty">{get(_)('no_matching_records')}</div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .operation-column-picker {
    min-width: 14rem;
  }

  .column-picker-menu {
    display: grid;
    gap: 1px;
    padding: 0;
  }

  .empty {
    padding: 0.5rem;
    color: var(--glasklar-ui-text-muted, var(--color-fg-subtle-1));
    font-size: var(--glasklar-ui-font-size-label, 0.75rem);
  }
</style>
