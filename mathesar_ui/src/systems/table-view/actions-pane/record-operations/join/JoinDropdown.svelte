<script lang="ts">
  import { _ } from 'svelte-i18n';

  import { iconTableLink } from '@mathesar/icons';
  import { getTabularDataStoreFromContext } from '@mathesar/stores/table-data';
  import OperationDropdown from '../OperationDropdown.svelte';

  import Join from './Join.svelte';

  const tabularData = getTabularDataStoreFromContext();
  $: ({ meta } = $tabularData);
  $: joining = meta.joining;
</script>

<OperationDropdown
  label={$_('join')}
  icon={iconTableLink}
  badgeCount={$joining.simpleManyToMany.size}
  applied={true}
  autoReposition
  {...$$restProps}
>
  <div class="content">
    <Join />
  </div>
</OperationDropdown>

<style lang="scss">
  .content {
    padding: var(--sm3) var(--sm5) var(--sm1) var(--sm5);
  }
</style>
