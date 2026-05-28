<script lang="ts">
  import type { Writable } from 'svelte/store';

  import {
    type RequestStatus,
    States,
  } from '@mathesar/api/rest/utils/requestUtils';
  import CellValue from '@mathesar/components/CellValue.svelte';
  import CellFabric from '@mathesar/components/cell-fabric/CellFabric.svelte';
  import CellBackground from '@mathesar/components/CellBackground.svelte';
  import { parseFileReference } from '@mathesar/components/file-attachments/fileUtils';
  import RowCellBackgrounds from '@mathesar/components/RowCellBackgrounds.svelte';
  import { SheetDataCell } from '@mathesar/components/sheet';
  import { makeCellId } from '@mathesar/components/sheet/cellIds';
  import type SheetSelection from '@mathesar/components/sheet/selection/SheetSelection';
  import { handleKeyboardEventOnCell } from '@mathesar/components/sheet/sheetKeyboardUtils';
  import type { RpcError } from '@mathesar/packages/json-rpc-client-builder';
  import {
    type CellKey,
    type ClientSideCellError,
    type JoinedColumn,
    type ProcessedColumn,
    type RecordRow,
    type RecordsData,
    getRowSelectionId,
    isJoinedColumn,
    isPlaceholderRecordRow,
    isProvisionalRecordRow,
  } from '@mathesar/stores/table-data';
  import type { NewCellValueRecipe } from '@mathesar/stores/table-data/records';
  import type { WritableMap } from '@mathesar-component-library';

  import CellErrors from './CellErrors.svelte';

  export let recordsData: RecordsData;
  export let selection: Writable<SheetSelection>;
  export let row: RecordRow;
  export let rowHasErrors = false;
  export let key: CellKey;
  export let modificationStatusMap: WritableMap<
    CellKey,
    RequestStatus<RpcError[]>
  >;
  export let columnFabric: ProcessedColumn | JoinedColumn;
  export let clientSideErrorMap: WritableMap<CellKey, ClientSideCellError[]>;
  export let value: unknown = undefined;
  export let canUpdateRecords: boolean;
  export let isScrolling = false;

  $: effectiveColumnFabric =
    isProvisionalRecordRow(row) && !isJoinedColumn(columnFabric)
      ? columnFabric.withoutEnhancedPkCell()
      : columnFabric;
  $: cellId = makeCellId(getRowSelectionId(row), effectiveColumnFabric.id);

  // To be used in case of publicly shared links where user should not be able
  // to view linked tables & explorations
  const canViewLinkedEntities = true;

  $: recordsDataState = recordsData.state;
  $: ({
    linkedRecordSummaries,
    joinedRecordSummaries,
    fileManifests,
    fetchedRecordRows,
    newRecords,
  } = recordsData);
  $: ({ column } = effectiveColumnFabric);
  $: columnId = effectiveColumnFabric.id;
  $: isWithinPlaceholderRow = isPlaceholderRecordRow(row);
  $: isActiveCell = $selection.activeCellId === cellId;
  $: useScrollPreview = isScrolling && !isActiveCell;
  $: scrollPreviewValue = getScrollPreviewValue(value);
  $: isRightAlignedScrollPreview =
    !isPrimaryKey &&
    !isJoinedColumn(effectiveColumnFabric) &&
    ['money', 'number'].includes(effectiveColumnFabric.abstractType.identifier);
  $: usesTabularScrollPreview =
    !isJoinedColumn(effectiveColumnFabric) &&
    ['date', 'datetime', 'duration', 'money', 'number', 'time'].includes(
      effectiveColumnFabric.abstractType.identifier,
    );
  $: modificationStatus = useScrollPreview ? undefined : $modificationStatusMap.get(key);
  $: serverErrors =
    modificationStatus?.state === 'failure' ? modificationStatus?.errors : [];
  $: clientErrors = useScrollPreview ? [] : ($clientSideErrorMap.get(key) ?? []);
  $: errors = [...serverErrors, ...clientErrors];
  $: hasServerError = !!serverErrors.length;
  $: hasClientError = !!clientErrors.length;
  $: hasError = hasClientError || hasServerError;
  $: isProcessing = modificationStatus?.state === 'processing';
  // TODO: Handle case where INSERT is allowed, but UPDATE isn't
  // i.e. row is a placeholder row and record isn't saved yet
  $: isEditable = canUpdateRecords && effectiveColumnFabric.isEditable;
  $: recordSummary = useScrollPreview
    ? undefined
    : $linkedRecordSummaries.get(columnId)?.get(String(value));
  $: joinedRecordSummariesMap = !useScrollPreview && isJoinedColumn(effectiveColumnFabric)
    ? $joinedRecordSummaries.get(columnId)
    : undefined;
  $: fileManifest = (() => {
    if (useScrollPreview) return undefined;
    if (!column.metadata?.file_backend) return undefined;
    const fileReference = parseFileReference(value);
    if (!fileReference) return undefined;
    return $fileManifests.get(columnId)?.get(fileReference.mash);
  })();
  $: isPrimaryKey = 'primary_key' in column && column.primary_key;

  async function setValue(newValue: unknown) {
    if (newValue === value) return;
    const cells: NewCellValueRecipe[] = [{ columnId, value: newValue }];
    await recordsData.bulkDml(
      isWithinPlaceholderRow
        ? { modificationRecipes: [], additionRecipes: [{ cells }] }
        : { modificationRecipes: [{ row, cells }], additionRecipes: [] },
    );
    if (isWithinPlaceholderRow) {
      // Re-focus the cell just edited. The placeholder row requires this extra
      // logic because it gets a new id value after it's saved, and that ends up
      // wiping out the fact that a cell in that row was selected.
      const newRowId = $newRecords[$newRecords.length - 1].identifier;
      selection.update((s) =>
        s.ofRowColumnIntersection([newRowId], [columnId]),
      );
    }
  }

  function getScrollPreviewValue(cellValue: unknown): string | null {
    if (cellValue === null) return null;
    if (cellValue === undefined) return '';
    if (!isJoinedColumn(effectiveColumnFabric)) {
      return (
        effectiveColumnFabric.formatCellValue(cellValue) ??
        getRawScrollPreviewValue(cellValue)
      );
    }
    return getRawScrollPreviewValue(cellValue);
  }

  function getRawScrollPreviewValue(cellValue: unknown): string {
    if (typeof cellValue === 'string') return cellValue;
    if (typeof cellValue === 'number' || typeof cellValue === 'boolean') {
      return String(cellValue);
    }
    return '';
  }
</script>

<SheetDataCell
  columnIdentifierKey={columnId}
  cellSelectionId={cellId}
  selection={$selection}
  {isWithinPlaceholderRow}
  isRangeRestricted={isJoinedColumn(columnFabric)}
  let:isActive
>
  {#if useScrollPreview}
    <div
      class="scroll-cell-preview"
      class:h-align-right={isRightAlignedScrollPreview}
      class:is-tabular-number={usesTabularScrollPreview}
    >
      <div class="scroll-cell-preview-content">
        <CellValue value={scrollPreviewValue} />
      </div>
    </div>
  {:else}
    <CellBackground
      when={isJoinedColumn(columnFabric)}
      color="var(--cell-bg-color-joined-cell)"
    />
    <CellBackground
      when={hasServerError || (!isActive && hasClientError)}
      color="var(--cell-bg-color-error)"
    />
    <CellBackground when={!isEditable} color="var(--cell-bg-color-disabled)" />
    {#if !(isEditable && isActive)}
      <!--
      We hide these backgrounds when the cell is editable and active because a
      white background better communicates that the user can edit the active
      cell.
    -->
      <RowCellBackgrounds hasErrors={rowHasErrors} />
    {/if}

    <CellFabric
      columnFabric={effectiveColumnFabric}
      {isActive}
      {value}
      {setValue}
      {isProcessing}
      {canViewLinkedEntities}
      {fileManifest}
      setFileManifest={(mash, manifest) => {
        recordsData.fileManifests.addBespokeValue({
          columnId: String(columnId),
          key: mash,
          value: manifest,
        });
      }}
      {recordSummary}
      setRecordSummary={(recordId, rs) =>
        linkedRecordSummaries.addBespokeValue({
          columnId: String(columnId),
          key: recordId,
          value: rs,
        })}
      {joinedRecordSummariesMap}
      showAsSkeleton={$recordsDataState === States.Loading &&
        $fetchedRecordRows.length === 0}
      disabled={!isEditable}
      on:movementKeyDown={({ detail }) =>
        handleKeyboardEventOnCell(detail.originalEvent, selection)}
      horizontalAlignment={isPrimaryKey ? 'left' : undefined}
      lightText={hasError || isProcessing}
    />

    {#if errors.length}
      <CellErrors {serverErrors} {clientErrors} forceShowErrors={isActive} />
    {/if}
  {/if}
</SheetDataCell>

<style>
  .scroll-cell-preview {
    box-sizing: border-box;
    border-radius: 2px;
    display: block;
    font: inherit;
    font-variant-numeric: inherit;
    height: var(--cell-height, var(--default-cell-height));
    min-height: var(--cell-height, var(--default-cell-height));
    line-height: inherit;
    overflow: hidden;
    position: relative;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    padding: var(--cell-padding, var(--sm4));
    color: inherit;
  }

  .scroll-cell-preview.is-tabular-number {
    display: flex;
    flex-direction: column;
    font-variant-numeric: tabular-nums;
    text-overflow: clip;
    white-space: normal;
  }

  .scroll-cell-preview-content {
    overflow: hidden;
    position: relative;
    max-width: 100%;
    text-align: inherit;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .scroll-cell-preview.h-align-right {
    text-align: right;
  }

  .scroll-cell-preview :global(.postgres-keyword) {
    color: var(--color-fg-faint);
    font-weight: 300;
    background: transparent;
  }
</style>
