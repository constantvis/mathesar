<script lang="ts">
  import { map } from 'iter-tools';
  import type { ComponentProps } from 'svelte';
  import { get } from 'svelte/store';
  import { _ } from 'svelte-i18n';

  import type { ColumnMetadata } from '@mathesar/api/rpc/_common/columnDisplayOptions';
  import { ImmutableMap, Spinner } from '@mathesar/component-library';
  import { Sheet } from '@mathesar/components/sheet';
  import { parseCellId } from '@mathesar/components/sheet/cellIds';
  import { SheetClipboardHandler } from '@mathesar/components/sheet/clipboard';
  import { contextMenuContext } from '@mathesar/contexts/contextMenuContext';
  import {
    DEFAULT_COLUMN_WIDTH_PX,
    ROW_HEADER_WIDTH_PX,
  } from '@mathesar/geometry';
  import { iconPaste } from '@mathesar/icons';
  import type { Table } from '@mathesar/models/Table';
  import { imperativeFilterControllerContext } from '@mathesar/pages/table/ImperativeFilterController';
  import { confirm } from '@mathesar/stores/confirmation';
  import { tableInspectorVisible } from '@mathesar/stores/localStorage';
  import { modal } from '@mathesar/stores/modal';
  import {
    type HiddenColumns,
    ID_ADD_NEW_COLUMN,
    ID_ROW_CONTROL_COLUMN,
    type JoinedColumn,
    type ProcessedColumn,
    getTabularDataStoreFromContext,
    isJoinedColumn,
  } from '@mathesar/stores/table-data';
  import { toast } from '@mathesar/stores/toast';
  import { modalRecordViewContext } from '@mathesar/systems/record-view-modal/modalRecordViewContext';

  import Body from './Body.svelte';
  import { openTableCellContextMenu } from './context-menu/contextMenu';
  import Header from './header/Header.svelte';
  import { importModalContext } from './import/ImportController';
  import ImportModal from './import/ImportModal.svelte';
  import StatusPane from './StatusPane.svelte';
  import WithTableInspector from './table-inspector/WithTableInspector.svelte';
  import { getCustomizedColumnWidths } from './tableViewUtils';

  type Context = 'page' | 'widget';
  type DisplayedColumnEntry = [string, ProcessedColumn | JoinedColumn];

  const COLUMN_VIRTUALIZATION_THRESHOLD = 12;
  const COLUMN_RENDER_OVERSCAN_PX = 300;
  const WIDE_TABLE_TECHNICAL_COLUMN_THRESHOLD = 80;

  const tabularData = getTabularDataStoreFromContext();
  const importModal = modal.spawnModalController();
  importModalContext.set(importModal);
  const contextMenu = contextMenuContext.get();
  const modalRecordView = modalRecordViewContext.get();
  const imperativeFilterController = imperativeFilterControllerContext.get();

  export let context: Context = 'page';
  export let table: Table;
  export let sheetElement: HTMLElement | undefined = undefined;

  let tableInspectorTab: ComponentProps<WithTableInspector>['activeTabId'] =
    'table';
  let sheetViewportWidth = 0;
  const tableOidsWithAppliedWideDefaults = new Set<number>();

  $: ({ currentRoleOwns } = table.currentAccess);
  $: usesVirtualList = context !== 'widget';
  $: sheetHasBorder = context === 'widget';
  $: ({
    processedColumns,
    display,
    isLoading,
    meta,
    selection,
    recordsData,
    allColumns,
    displayedColumns,
    columnsDataStore,
  } = $tabularData);
  $: ({ hiddenColumns } = meta);
  $: $tabularData, (tableInspectorTab = 'table');
  $: clipboardHandler = new SheetClipboardHandler({
    copyingContext: {
      getRows: () =>
        new Map(
          map(([k, r]) => [k, r.record], get(recordsData.selectableRowsMap)),
        ),
      getColumns: () => get(processedColumns),
      getRecordSummaries: () => get(recordsData.linkedRecordSummaries),
    },
    pastingContext: {
      getRecordRows: () => [
        ...get(recordsData.fetchedRecordRows),
        ...get(recordsData.newRecords),
      ],
      getSheetColumns: () => [
        ...map(({ column }) => column, get(processedColumns).values()),
      ],
      bulkDml: (args) => recordsData.bulkDml(args),
      confirm: (title) =>
        confirm({
          title,
          body: [],
          proceedButton: { label: $_('paste'), icon: iconPaste },
        }),
    },
    selection,
    showToastInfo: toast.info,
    showToastError: toast.error,
  });
  $: ({ horizontalScrollOffset, scrollOffset } = display);
  $: columnOrder = (table.metadata?.column_order ?? []).map(String);
  $: hasNewColumnButton = $currentRoleOwns;
  /**
   * These are separate variables for readability and also to keep the door open
   * to more easily displaying the Table Inspector even if DDL operations are
   * not supported.
   */
  $: supportsTableInspector = context === 'page';
  $: sheetColumns = (() => {
    const columns: Array<{ column: { id: string; name: string } }> = [
      { column: { id: ID_ROW_CONTROL_COLUMN, name: 'ROW_CONTROL' } },
      ...[...$displayedColumns].map(([columnId, columnFabric]) => {
        const name = isJoinedColumn(columnFabric)
          ? columnFabric.displayName
          : columnFabric.column.name;
        return {
          column: {
            id: columnId,
            name,
          },
        };
      }),
    ];
    if (hasNewColumnButton) {
      columns.push({ column: { id: ID_ADD_NEW_COLUMN, name: 'ADD_NEW' } });
    }
    return columns;
  })();

  $: columnWidths = new ImmutableMap([
    [ID_ROW_CONTROL_COLUMN, ROW_HEADER_WIDTH_PX],
    [ID_ADD_NEW_COLUMN, 32],
    ...getCustomizedColumnWidths($processedColumns.values()),
    ...[...$allColumns]
      .filter(([, col]) => isJoinedColumn(col))
      .map(([id]): [string, number] => [id, 300]),
  ]);
  function getDisplayedColumnEntries(
    displayedColumnsMap: Map<string, ProcessedColumn | JoinedColumn>,
  ): DisplayedColumnEntry[] {
    return [...displayedColumnsMap] as DisplayedColumnEntry[];
  }

  function getColumnWidth(columnId: string): number {
    return columnWidths.get(columnId) ?? DEFAULT_COLUMN_WIDTH_PX;
  }

  function isTechnicalColumn(column: ProcessedColumn | JoinedColumn): boolean {
    if (isJoinedColumn(column)) return false;
    const { name } = column.column;
    return name.startsWith('__');
  }

  function maybeApplyWideTableDefaultHiddenColumns({
    tableOid,
    allColumnsMap,
    currentlyHidden,
  }: {
    tableOid: number;
    allColumnsMap: Map<string, ProcessedColumn | JoinedColumn>;
    currentlyHidden: HiddenColumns;
  }): void {
    if (context !== 'page') return;
    if (tableOidsWithAppliedWideDefaults.has(tableOid)) return;
    if (allColumnsMap.size <= WIDE_TABLE_TECHNICAL_COLUMN_THRESHOLD) return;
    if (currentlyHidden.size > 0) return;

    const technicalColumnIds = [...allColumnsMap]
      .filter(([, column]) => isTechnicalColumn(column))
      .map(([columnId]) => columnId);

    tableOidsWithAppliedWideDefaults.add(tableOid);
    if (technicalColumnIds.length === 0) return;
    hiddenColumns.update((h) => h.withColumns(technicalColumnIds));
  }

  function getRenderedDisplayedColumns({
    displayedColumns: displayedColumnsMap,
    sheetColumns: allSheetColumns,
    horizontalScrollOffset: hScrollOffset,
    sheetViewportWidth: viewportWidth,
    pinnedColumnIds,
  }: {
    displayedColumns: Map<string, ProcessedColumn | JoinedColumn>;
    sheetColumns: Array<{ column: { id: string } }>;
    horizontalScrollOffset: number;
    sheetViewportWidth: number;
    pinnedColumnIds: Set<string>;
  }): DisplayedColumnEntry[] {
    const entries = getDisplayedColumnEntries(displayedColumnsMap);
    if (
      entries.length <= COLUMN_VIRTUALIZATION_THRESHOLD ||
      viewportWidth <= 0
    ) {
      return entries;
    }

    const viewportStart = Math.max(
      0,
      hScrollOffset - COLUMN_RENDER_OVERSCAN_PX,
    );
    const viewportEnd =
      hScrollOffset + viewportWidth + COLUMN_RENDER_OVERSCAN_PX;
    const renderedColumnIds = new Set<string>();
    let left = 0;

    allSheetColumns.forEach(({ column }) => {
      const width = getColumnWidth(column.id);
      const right = left + width;
      if (
        displayedColumnsMap.has(column.id) &&
        (right >= viewportStart || pinnedColumnIds.has(column.id)) &&
        (left <= viewportEnd || pinnedColumnIds.has(column.id))
      ) {
        renderedColumnIds.add(column.id);
      }
      left = right;
    });

    return entries.filter(([columnId]) => renderedColumnIds.has(columnId));
  }

  $: showTableInspector = $tableInspectorVisible && supportsTableInspector;
  $: activeColumnId = $selection.activeCellId
    ? parseCellId($selection.activeCellId).columnId
    : undefined;
  $: pinnedRenderedColumnIds = new Set(
    [...$selection.columnIds, activeColumnId].filter(
      (id): id is string => typeof id === 'string',
    ),
  );
  $: renderedDisplayedColumns = getRenderedDisplayedColumns({
    displayedColumns: $displayedColumns,
    sheetColumns,
    horizontalScrollOffset: $horizontalScrollOffset,
    sheetViewportWidth,
    pinnedColumnIds: pinnedRenderedColumnIds,
  });
  $: if (sheetViewportWidth > 0 && renderedDisplayedColumns.length > 0) {
    recordsData.setColumnProjection(
      getDisplayedColumnEntries($displayedColumns).map(([columnId]) => columnId),
    );
  }
  $: maybeApplyWideTableDefaultHiddenColumns({
    tableOid: table.oid,
    allColumnsMap: $allColumns,
    currentlyHidden: $hiddenColumns,
  });

  function persistColumnWidths(widthsMap: [string, number | null][]): void {
    function* getChanges(): Generator<[number, ColumnMetadata | null]> {
      for (const [columnId, width] of widthsMap) {
        const column = $allColumns.get(columnId);
        if (!column) continue;
        // Joined columns do not persist width to the database
        if (isJoinedColumn(column)) continue;
        yield [parseInt(column.id, 10), { display_width: width }];
      }
    }
    void columnsDataStore.setDisplayOptions(new Map(getChanges()));
  }
</script>

<div class="table-view">
  <WithTableInspector
    {context}
    {table}
    {showTableInspector}
    bind:activeTabId={tableInspectorTab}
  >
    <div class="sheet-area" bind:clientWidth={sheetViewportWidth}>
      {#if $processedColumns.size}
        <Sheet
          {clipboardHandler}
          {columnWidths}
          {selection}
          {usesVirtualList}
          {persistColumnWidths}
          onCellSelectionStart={(cell) => {
            if (cell.type === 'column-header-cell') {
              tableInspectorTab = 'column';
            }
            if (cell.type === 'row-header-cell') {
              tableInspectorTab = 'record';
            }
          }}
          onCellContextMenu={({
            targetCell,
            position,
            beginSelectingCellRange,
          }) => {
            if (!contextMenu) return 'empty';
            return openTableCellContextMenu({
              targetCell,
              position,
              contextMenu,
              modalRecordView,
              tabularData: $tabularData,
              imperativeFilterController,
              clipboardHandler,
              beginSelectingCellRange,
            });
          }}
          bind:horizontalScrollOffset={$horizontalScrollOffset}
          bind:scrollOffset={$scrollOffset}
          columns={sheetColumns}
          getColumnIdentifier={(entry) => entry.column.id}
          hasBorder={sheetHasBorder}
          hasPaddingRight
          restrictWidthToRowWidth={!usesVirtualList}
          bind:sheetElement
        >
          <Header
            {hasNewColumnButton}
            {columnOrder}
            {table}
            displayedColumns={renderedDisplayedColumns}
          />
          <Body {usesVirtualList} displayedColumns={renderedDisplayedColumns} />
        </Sheet>
      {:else if $isLoading}
        <div class="loading-sheet">
          <Spinner />
        </div>
      {/if}
    </div>
  </WithTableInspector>
  <StatusPane {context} />
</div>

<ImportModal
  controller={importModal}
  {table}
  tableColumns={$processedColumns}
  onFinish={() => {
    void recordsData.fetch();
  }}
/>

<style>
  .table-view {
    --status-bar-padding: 0;
    height: 100%;
    display: grid;
    grid-template: 1fr auto / 1fr;
    gap: var(--sm3);
    overflow: hidden;
  }
  .sheet-area {
    position: relative;
    height: 100%;
    overflow-x: auto;
  }
  .loading-sheet {
    text-align: center;
    font-size: 2rem;
    padding: 2rem;
  }
</style>
