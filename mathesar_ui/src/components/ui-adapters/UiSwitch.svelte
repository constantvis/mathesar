<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import { uiMode } from '@mathesar/stores/uiMode';
  import Checkbox from '@mathesar-component-library-dir/checkbox/Checkbox.svelte';

  import { getUiAdapterVariant } from './uiAdapterUtils';

  const dispatch = createEventDispatcher<{ change: boolean }>();

  export let checked = false;
  export let disabled = false;
  export let ariaLabel: string | undefined = undefined;

  let classes = '';
  export { classes as class };

  $: adapterVariant = getUiAdapterVariant($uiMode);
  $: shadcnClasses = ['ui-adapter-switch', checked ? 'checked' : '', classes]
    .filter(Boolean)
    .join(' ');

  function toggle() {
    if (!disabled) {
      dispatch('change', !checked);
    }
  }
</script>

{#if adapterVariant === 'legacy'}
  <Checkbox
    {checked}
    {disabled}
    class={classes}
    on:change={(e) => dispatch('change', e.detail)}
    on:click
    on:mousedown
  />
{:else}
  <button
    type="button"
    class={shadcnClasses}
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    {disabled}
    on:click={toggle}
    on:keydown
    on:focus
    on:blur
    on:mousedown
  >
    <span class="thumb" />
  </button>
{/if}

<style lang="scss">
  .ui-adapter-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    width: var(--glasklar-ui-switch-width, 2rem);
    height: var(--glasklar-ui-switch-height, 1.125rem);
    flex: 0 0 auto;
    border: 1px solid var(--glasklar-ui-border-strong, var(--color-border-control));
    border-radius: 999px;
    background: var(--glasklar-ui-surface-input, var(--color-bg-input));
    padding: 0;
    cursor: pointer;
    outline: 2px solid transparent;
    outline-offset: 1px;
    transition:
      background-color 0.12s ease,
      border-color 0.12s ease,
      box-shadow 0.12s ease;
  }

  .ui-adapter-switch .thumb {
    position: absolute;
    left: 0.125rem;
    width: var(--glasklar-ui-switch-thumb-size, 0.8125rem);
    height: var(--glasklar-ui-switch-thumb-size, 0.8125rem);
    border-radius: 999px;
    background: var(--glasklar-ui-surface, var(--color-bg-base));
    box-shadow: 0 1px 2px
      color-mix(in srgb, var(--color-shadow), transparent 42%);
    transition:
      transform 0.12s ease,
      background-color 0.12s ease;
  }

  .ui-adapter-switch.checked {
    border-color: var(--glasklar-ui-accent, var(--color-border-control-active));
    background: var(--glasklar-ui-accent, var(--color-bg-filled-input));
  }

  .ui-adapter-switch.checked .thumb {
    transform: translateX(
      calc(
        var(--glasklar-ui-switch-width, 2rem) -
          var(--glasklar-ui-switch-thumb-size, 0.8125rem) - 0.375rem
      )
    );
  }

  .ui-adapter-switch:not(:disabled):hover {
    border-color: var(--glasklar-ui-accent, var(--color-border-control-hover));
    box-shadow: 0 0 0 2px
      color-mix(
        in srgb,
        var(--glasklar-ui-focus-ring, var(--color-border-control-focused)),
        transparent 78%
      );
  }

  .ui-adapter-switch:not(:disabled):focus-visible {
    outline-color: var(--glasklar-ui-focus-ring, var(--color-border-control-focused));
  }

  .ui-adapter-switch:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
</style>
