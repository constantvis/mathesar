<script lang="ts">
  import CellBackground from '@mathesar/components/CellBackground.svelte';

  export let isSelected = false;
  export let isProcessing = false;
  export let hasErrors = false;
</script>

<CellBackground when={isSelected} color="var(--cell-bg-color-row-selected)" />
<CellBackground when={isProcessing} color="var(--cell-bg-color-processing)" />
<CellBackground when={hasErrors} color="var(--cell-bg-color-error)" />
