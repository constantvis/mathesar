<script lang="ts">
  import { Select } from '@mathesar/component-library';
  import {
    setUiMode,
    uiMode,
    uiModeOverride,
    type UiMode,
  } from '@mathesar/stores/uiMode';

  interface UiModeOption {
    id: UiMode;
    value: UiMode;
    label: string;
  }

  const options: UiModeOption[] = [
    { id: 'legacy', value: 'legacy', label: 'Legacy' },
    { id: 'shadcn', value: 'shadcn', label: 'shadcn (fallback)' },
    { id: 'auto', value: 'auto', label: 'Auto' },
  ];

  $: value = options.find((option) => option.value === $uiMode);

  function handleChange(event: CustomEvent<UiModeOption | undefined>) {
    if (!event.detail) return;
    setUiMode(event.detail.value);
  }
</script>

<div class="ui-mode-select">
  <Select
    {value}
    {options}
    on:change={handleChange}
    triggerAppearance="secondary"
    ariaLabel="UI mode"
  />
  {#if uiModeOverride}
    <p class="ui-mode-note">URL override: {$uiMode}</p>
  {:else if $uiMode === 'shadcn'}
    <p class="ui-mode-note">
      shadcn is not installed yet. Adapter styling is used where available.
    </p>
  {/if}
</div>

<style lang="scss">
  .ui-mode-select {
    padding: 0.5rem;
    margin-top: -0.5rem;
  }

  .ui-mode-note {
    color: var(--color-fg-subtle);
    font-size: 0.75rem;
    line-height: 1.2;
    margin: 0.5rem 0 0;
    max-width: 12rem;
  }
</style>
