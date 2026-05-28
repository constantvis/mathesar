<script lang="ts">
  import { uiMode } from '@mathesar/stores/uiMode';
  import Badge from '@mathesar-component-library-dir/badge/Badge.svelte';

  import { getUiAdapterVariant } from './uiAdapterUtils';

  let classes = '';
  export { classes as class };

  $: adapterVariant = getUiAdapterVariant($uiMode);
</script>

{#if adapterVariant === 'legacy'}
  <Badge>
    <slot />
  </Badge>
{:else}
  <span class={['ui-adapter-badge', classes].filter(Boolean).join(' ')}>
    <slot />
  </span>
{/if}

<style lang="scss">
  .ui-adapter-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.1rem;
    height: 1.1rem;
    padding: 0 0.32rem;
    border: 1px solid var(--color-border-control);
    border-radius: 999px;
    background: var(--color-bg-control);
    color: var(--color-fg-subtle);
    font-size: var(--badge-font-size, 0.72rem);
    font-weight: var(--font-weight-medium);
    line-height: 1;
  }
</style>
