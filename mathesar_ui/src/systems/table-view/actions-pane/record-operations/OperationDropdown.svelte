<script lang="ts">
  import type { Placement } from '@popperjs/core/lib/enums';

  import { UiBadge, UiButton } from '@mathesar/components/ui-adapters';
  import {
    type ProcessedColumn,
    getTabularDataStoreFromContext,
  } from '@mathesar/stores/table-data';
  import { AttachableDropdown, Icon } from '@mathesar-component-library';
  import { iconExpandDown } from '@mathesar-component-library-dir/common/icons';
  import type {
    Appearance,
    Size,
  } from '@mathesar-component-library-dir/commonTypes';
  import type { IconProps } from '@mathesar-component-library/types';

  import ColumnPickerMenu from './ColumnPickerMenu.svelte';

  const tabularData = getTabularDataStoreFromContext();
  $: ({ processedColumns } = $tabularData);

  export let icon: IconProps;
  export let label: string;
  export let addColumnToOperation:
    | ((pc: ProcessedColumn) => unknown)
    | undefined = undefined;

  export let badgeCount = 0;
  export let applied = false;
  export let isOpen = false;
  export let triggerClass = '';
  export let triggerAppearance: Appearance = 'secondary';
  export let contentClass = '';
  export let closeOnInnerClick = false;
  export let ariaLabel: string | undefined = undefined;
  export let ariaControls: string | undefined = undefined;
  export let placements: Placement[] = [
    'bottom-start',
    'bottom-end',
    'top-start',
    'top-end',
    'right-start',
    'left-start',
  ];
  export let preferredPlacement: Placement | undefined = undefined;
  export let placement: Placement | undefined = undefined;
  export let showArrow = false;
  export let size: Size = 'medium';
  export let disabled = false;
  export let autoReposition = false;

  let triggerElement: HTMLElement | undefined;

  $: triggerClasses = [
    'dropdown',
    'trigger',
    'operation-dropdown-trigger',
    applied ? 'applied' : '',
    showArrow ? '' : 'no-arrow',
    triggerClass,
  ]
    .filter(Boolean)
    .join(' ');
  $: resolvedPreferredPlacement = preferredPlacement ?? placement;
  $: resolvedAriaLabel = ariaLabel ?? label;

  function toggle(e: Event) {
    e.preventDefault();
    if (!disabled) {
      isOpen = !isOpen;
    }
  }

  function close() {
    isOpen = false;
  }
</script>

<UiButton
  bind:element={triggerElement}
  appearance={triggerAppearance}
  class={triggerClasses}
  variant="toolbar"
  on:click={toggle}
  aria-controls={ariaControls}
  aria-expanded={isOpen}
  aria-haspopup="menu"
  aria-label={resolvedAriaLabel}
  title={resolvedAriaLabel}
  {size}
  {disabled}
  {...$$restProps}
  on:keydown
  on:focus
  on:blur
>
  <span class="label">
    <Icon {...icon} />
    <span class="responsive-button-label with-badge">
      {label}
      {#if badgeCount > 0}
        <UiBadge>{badgeCount}</UiBadge>
      {/if}
    </span>
  </span>
  {#if showArrow}
    <span class="arrow">
      <Icon {...iconExpandDown} size="0.75em" />
    </span>
  {/if}
</UiButton>

<AttachableDropdown
  trigger={triggerElement}
  {isOpen}
  {placements}
  preferredPlacement={resolvedPreferredPlacement}
  class={contentClass}
  {closeOnInnerClick}
  {autoReposition}
  on:close={close}
  on:open
  on:close
  let:close={innerClose}
>
  {#if applied || !addColumnToOperation}
    <slot />
  {:else}
    <div class="columns">
      <ColumnPickerMenu
        columns={[...$processedColumns.values()]}
        onSelect={(column) => addColumnToOperation?.(column)}
      />
    </div>
  {/if}
</AttachableDropdown>

<style lang="scss">
  :global(.operation-dropdown-trigger > .label) {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    min-height: 1em;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global(.operation-dropdown-trigger > .arrow) {
    display: flex;
    align-items: center;
    padding: 0 0.1rem;
  }

  .with-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--sm5);
  }
  .columns {
    min-width: 10rem;
    --Menu__min-width: 100%;
  }
</style>
