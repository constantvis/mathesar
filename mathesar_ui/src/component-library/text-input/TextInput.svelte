<script lang="ts">
  import BaseInput from '@mathesar-component-library-dir/common/base-components/BaseInput.svelte';
  import {
    makeStyleStringFromCssVariables,
    mergeStyleStrings,
  } from '@mathesar-component-library-dir/common/utils/styleUtils';

  import type { TextInputProps } from './TextInputTypes';

  type $$Props = TextInputProps;

  /**
   * Value of the input. Use bind tag for two-way binding.
   * Refer Svelte docs for more info on binding form input values.
   */
  export let value: $$Props['value'] = undefined;

  // Additional classes
  let classes: $$Props['class'] = '';
  export { classes as class };

  // Underlying DOM element for direct access
  export let element: $$Props['element'] = undefined;

  export let hasError: $$Props['hasError'] = false;

  // Id for the input
  export let id: $$Props['id'] = undefined;
  export let disabled: $$Props['disabled'] = false;
  export let focusOnMount: $$Props['focusOnMount'] = false;
  export let labelController: $$Props['labelController'] = undefined;

  export let cssVariables: $$Props['cssVariables'] = undefined;
  $: styleStringFromCssVariables = cssVariables
    ? makeStyleStringFromCssVariables(cssVariables)
    : '';
  $: style = mergeStyleStrings(styleStringFromCssVariables, $$restProps.style);

  export let onValueChange: $$Props['onValueChange'] = undefined;

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    onValueChange?.(target.value);
  }
</script>

<BaseInput bind:id {disabled} {focusOnMount} {labelController} />

<input
  bind:this={element}
  {...$$restProps}
  {style}
  type="text"
  class={['input-element', 'text-input', classes].join(' ')}
  class:has-error={hasError}
  class:read-only={$$restProps.readonly}
  bind:value
  {id}
  {disabled}
  on:input
  on:input={handleInput}
  on:focus
  on:blur
  on:keydown
  on:beforeinput
  on:change
/>
