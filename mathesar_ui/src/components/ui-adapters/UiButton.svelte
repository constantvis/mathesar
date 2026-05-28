<script lang="ts">
  import { uiMode } from '@mathesar/stores/uiMode';
  import Button from '@mathesar-component-library-dir/button/Button.svelte';
  import type {
    Appearance,
    Size,
  } from '@mathesar-component-library-dir/commonTypes';

  import { getUiAdapterVariant } from './uiAdapterUtils';

  export let appearance: Appearance = 'default';
  export let size: Size = 'medium';
  export let active = false;
  export let disabled = false;
  export let type: 'button' | 'submit' = 'button';
  export let element: HTMLElement | undefined = undefined;
  export let tooltip: string | undefined = undefined;
  export let variant: 'default' | 'toolbar' = 'default';

  let classes = '';
  export { classes as class };

  $: adapterVariant = getUiAdapterVariant($uiMode);
  $: shadcnClasses = [
    'ui-adapter-button',
    `ui-adapter-button-${variant}`,
    `size-${size}`,
    active ? 'active' : '',
    classes,
  ]
    .filter(Boolean)
    .join(' ');
</script>

{#if adapterVariant === 'legacy'}
  <Button
    bind:element
    {appearance}
    {size}
    {active}
    {disabled}
    {type}
    {tooltip}
    class={classes}
    {...$$restProps}
    on:click
    on:keydown
    on:focus
    on:blur
    on:mouseenter
    on:mouseleave
    on:mousedown
  >
    <slot />
  </Button>
{:else}
  <button
    bind:this={element}
    {type}
    {disabled}
    class={shadcnClasses}
    class:active
    {...$$restProps}
    on:click
    on:keydown
    on:focus
    on:blur
    on:mouseenter
    on:mouseleave
    on:mousedown
  >
    <slot />
  </button>
{/if}

<style lang="scss">
  .ui-adapter-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    gap: var(--button-gap, 0.4rem);
    min-width: 0;
    border: 1px solid var(--glasklar-ui-border, var(--color-border-control));
    border-radius: var(--button-border-radius, 7px);
    background: var(--glasklar-ui-surface, var(--color-bg-base));
    color: var(--glasklar-ui-text, var(--color-fg-control));
    font-family: inherit;
    font-size: var(--glasklar-ui-font-size-button, 0.875rem);
    font-weight: var(--glasklar-ui-font-weight-control, var(--font-weight-medium));
    line-height: var(--glasklar-ui-line-height-control, var(--input-line-height));
    white-space: nowrap;
    cursor: pointer;
    outline: 2px solid transparent;
    outline-offset: 1px;
    transition:
      background-color 0.12s ease,
      border-color 0.12s ease,
      box-shadow 0.12s ease,
      color 0.12s ease;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    &:not(:disabled):hover {
      background: var(--glasklar-ui-hover, var(--color-bg-control-hover));
      border-color: var(
        --glasklar-ui-border-strong,
        var(--color-border-control-hover)
      );
      color: var(--glasklar-ui-text, var(--color-fg-base));
    }

    &:not(:disabled):focus {
      border-color: var(
        --glasklar-ui-border-strong,
        var(--color-border-control-focused)
      );
      box-shadow: 0 0 0 2px
        color-mix(
          in srgb,
          var(--glasklar-ui-focus-ring, var(--color-border-control-focused)),
          transparent 76%
        );
    }

    &:not(:disabled):focus-visible {
      outline-color: var(--glasklar-ui-focus-ring, var(--color-border-control-focused));
    }

    &:not(:disabled):active,
    &:not(:disabled).active {
      background: var(--glasklar-ui-active, var(--color-bg-control-active));
      border-color: var(
        --glasklar-ui-border-strong,
        var(--color-border-control-active)
      );
    }
  }

  .ui-adapter-button-toolbar {
    min-height: var(--glasklar-ui-button-height, 2rem);
    padding: 0.26rem var(--glasklar-ui-button-padding-x, 0.62rem);
    box-shadow: none;

    :global(svg) {
      width: 1em;
      height: 1em;
      flex: 0 0 auto;
      font-size: var(--glasklar-ui-icon-size, 1rem);
    }
  }

  .size-small.ui-adapter-button-toolbar {
    min-height: 1.75rem;
    padding: 0.18rem 0.5rem;
    font-size: 0.8125rem;
  }

  .size-large.ui-adapter-button-toolbar {
    min-height: 2.35rem;
    padding: 0.36rem 0.78rem;
  }
</style>
