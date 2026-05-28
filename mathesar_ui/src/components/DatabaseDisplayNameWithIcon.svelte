<script lang="ts">
  import { iconDatabase, iconDatabaseShadcn } from '@mathesar/icons';
  import type { Database } from '@mathesar/models/Database';
  import { uiMode } from '@mathesar/stores/uiMode';

  import { getUiAdapterVariant } from './ui-adapters/uiAdapterUtils';
  import NameWithIcon from './NameWithIcon.svelte';

  export let database: Database;
  export let iconHasBox = false;

  $: icon =
    getUiAdapterVariant($uiMode) === 'shadcn'
      ? iconDatabaseShadcn
      : iconDatabase;
</script>

<NameWithIcon
  {icon}
  {iconHasBox}
  cssVariables={{ '--icon-color': 'var(--color-database)' }}
>
  <slot databaseDisplayName={database.displayName}>
    {database.displayName}
  </slot>
</NameWithIcon>
