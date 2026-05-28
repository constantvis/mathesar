<script lang="ts">
  import { Select } from '@mathesar/component-library';
  import {
    TABLE_STYLE_OPTIONS,
    type TableStyle,
    type TableStyleOption,
    setTableStyle,
    tableStyle,
  } from '@mathesar/stores/tableStyle';
  import { uiMode } from '@mathesar/stores/uiMode';

  $: value = TABLE_STYLE_OPTIONS.find(
    (option) => option.id === $tableStyle,
  );
  $: activeDescription = value?.description ?? '';
  $: isShadcn = $uiMode === 'shadcn';

  function handleChange(event: CustomEvent<TableStyleOption | undefined>) {
    if (!event.detail) return;
    setTableStyle(event.detail.id as TableStyle);
  }

  function getLabel(option: TableStyleOption | undefined): string {
    return option?.label ?? '';
  }
</script>

<div class="table-style-select">
  <Select
    {value}
    options={TABLE_STYLE_OPTIONS}
    {getLabel}
    on:change={handleChange}
    triggerAppearance="secondary"
    ariaLabel="Table style"
  />
  {#if !isShadcn}
    <p class="table-style-note">
      Active only in shadcn mode.
    </p>
  {:else if activeDescription}
    <p class="table-style-note">{activeDescription}</p>
  {/if}
</div>

<style lang="scss">
  .table-style-select {
    padding: 0.5rem;
    margin-top: -0.5rem;
  }

  .table-style-note {
    color: var(--color-fg-subtle);
    font-size: 0.75rem;
    line-height: 1.2;
    margin: 0.5rem 0 0;
    max-width: 12rem;
  }
</style>
