<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';
  import { _ } from 'svelte-i18n';

  import type { ConstraintType } from '@mathesar/api/rpc/constraints';
  import ColumnName from '@mathesar/components/column/ColumnName.svelte';
  import TextInputWithPrefix from '@mathesar/component-library/text-input/TextInputWithPrefix.svelte';
  import { getUiAdapterVariant } from '@mathesar/components/ui-adapters';
  import { iconAddFilter, iconFilterGroup } from '@mathesar/icons';
  import { uiMode } from '@mathesar/stores/uiMode';
  import type { ReadableMapLike } from '@mathesar/typeUtils';
  import {
    Button,
    ButtonMenuItem,
    DropdownMenu,
    Icon,
    iconSearch,
  } from '@mathesar-component-library';

  import {
    type FilterEntryColumn,
    FilterGroup,
    makeIndividualFilter,
  } from './utils';

  interface $$Events {
    update: void;
  }

  const dispatch = createEventDispatcher<$$Events>();

  export let level = 0;
  export let columns: ReadableMapLike<
    FilterEntryColumn['id'],
    FilterEntryColumn
  >;
  export let getColumnLabel: (column: FilterEntryColumn) => string;
  export let getColumnConstraintType: (
    column: FilterEntryColumn,
  ) => ConstraintType[] | undefined;

  export let filterGroup: FilterGroup;

  function addFilter(columnInfo: FilterEntryColumn) {
    const filter = makeIndividualFilter(
      columns,
      getColumnConstraintType,
      columnInfo.id,
    );
    if (filter) {
      filterGroup.addArgument(filter);
      searchQuery = '';
      dispatch('update');
    }
  }

  function addFilterGroup() {
    filterGroup.addArgument(
      new FilterGroup({
        type: 'group',
        operator: get(filterGroup.operator) === 'and' ? 'or' : 'and',
        args: [],
      }),
    );
    dispatch('update');
  }

  let searchQuery = '';

  $: isShadcn = getUiAdapterVariant($uiMode) === 'shadcn';
  $: normalizedSearchQuery = searchQuery.trim().toLowerCase();
  $: columnOptions = [...columns.values()];
  $: visibleColumnOptions =
    isShadcn && normalizedSearchQuery
      ? columnOptions.filter((columnInfo) =>
          [getColumnLabel(columnInfo), columnInfo.column.type ?? '']
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearchQuery),
        )
      : columnOptions;
</script>

<div class="filter-group-actions">
  {#if level > 0 && $$slots.text}
    <div class="text">
      <slot name="text" />
    </div>
  {/if}
  <div class="actions">
    <DropdownMenu
      icon={{ ...iconAddFilter, size: '0.9rem' }}
      label={$_('add_filter')}
      triggerAppearance="secondary"
    >
      {#if isShadcn}
        <div class="search">
          <TextInputWithPrefix
            prefixIcon={iconSearch}
            placeholder={$_('columns')}
            aria-label={$_('columns')}
            focusOnMount
            bind:value={searchQuery}
          />
        </div>
      {/if}
      <div class="filter-column-picker">
        {#each visibleColumnOptions as columnInfo (columnInfo.id)}
          <ButtonMenuItem on:click={() => addFilter(columnInfo)}>
            <ColumnName
              column={{
                name: getColumnLabel(columnInfo),
                type: columnInfo?.column.type ?? 'unknown',
                type_options: columnInfo?.column.type_options ?? null,
                constraintsType: getColumnConstraintType(columnInfo),
                metadata: columnInfo?.column.metadata ?? null,
              }}
            />
          </ButtonMenuItem>
        {:else}
          <div class="empty">{$_('no_matching_records')}</div>
        {/each}
      </div>
    </DropdownMenu>

    {#if level < 2}
      <Button appearance="secondary" on:click={addFilterGroup}>
        <Icon {...iconFilterGroup} />
        {$_('add_filter_group')}
      </Button>
    {/if}

    <slot />
  </div>
</div>

<style lang="scss">
  .filter-group-actions {
    display: flex;
    margin-left: 1.4rem;

    .text {
      flex-grow: 1;
    }

    .actions {
      display: flex;
      gap: var(--sm5);
    }
  }

  .filter-column-picker {
    display: grid;
    gap: 1px;
  }

  .empty {
    padding: 0.5rem;
    color: var(--glasklar-ui-text-muted, var(--color-fg-subtle-1));
    font-size: var(--glasklar-ui-font-size-label, 0.75rem);
  }
</style>
