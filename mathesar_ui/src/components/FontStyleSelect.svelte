<script lang="ts">
  import { Select } from '@mathesar/component-library';
  import {
    FONT_STYLE_OPTIONS,
    type FontStyle,
    type FontStyleOption,
    setFontStyle,
    fontStyle,
  } from '@mathesar/stores/fontStyle';
  import { uiMode } from '@mathesar/stores/uiMode';

  $: value = FONT_STYLE_OPTIONS.find((option) => option.id === $fontStyle);
  $: activeDescription = value?.description ?? '';
  $: isShadcn = $uiMode === 'shadcn';

  function handleChange(event: CustomEvent<FontStyleOption | undefined>) {
    if (!event.detail) return;
    setFontStyle(event.detail.id as FontStyle);
  }

  function getLabel(option: FontStyleOption | undefined): string {
    return option?.label ?? '';
  }
</script>

<div class="font-style-select">
  <Select
    {value}
    options={FONT_STYLE_OPTIONS}
    {getLabel}
    on:change={handleChange}
    triggerAppearance="secondary"
    ariaLabel="Font style"
  />
  {#if !isShadcn}
    <p class="font-style-note">
      Active only in shadcn mode.
    </p>
  {:else if activeDescription}
    <p class="font-style-note">{activeDescription}</p>
  {/if}
</div>

<style lang="scss">
  .font-style-select {
    padding: 0.5rem;
    margin-top: -0.5rem;
  }

  .font-style-note {
    color: var(--color-fg-subtle);
    font-size: 0.75rem;
    line-height: 1.2;
    margin: 0.5rem 0 0;
    max-width: 12rem;
  }
</style>
