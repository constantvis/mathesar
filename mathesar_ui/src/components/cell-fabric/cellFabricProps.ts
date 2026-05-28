import type { DbType } from '@mathesar/AppTypes';

import type { CellColumnFabric } from './types';
import { getCellInfo } from './data-types/utils';

const componentPropNames = new Map<string, readonly string[]>([
  [
    'ArrayCell',
    [
      'disabled',
      'formatElementForDisplay',
      'isActive',
      'isIndependentOfSheet',
      'value',
    ],
  ],
  [
    'CheckboxCell',
    [
      'disabled',
      'isActive',
      'isIndependentOfSheet',
      'isProcessing',
      'searchValue',
      'setValue',
      'value',
    ],
  ],
  [
    'DateTimeCell',
    [
      'disabled',
      'formatForDisplay',
      'formatter',
      'formattingString',
      'isActive',
      'isIndependentOfSheet',
      'setValue',
      'showTruncationPopover',
      'timeEnableSeconds',
      'timeShow24Hr',
      'type',
      'value',
    ],
  ],
  [
    'FileCell',
    [
      'disabled',
      'fileManifest',
      'fileRequestParams',
      'isActive',
      'isIndependentOfSheet',
      'setFileManifest',
      'setValue',
      'value',
    ],
  ],
  [
    'FormattedInputCell',
    [
      'disabled',
      'formatForDisplay',
      'formatter',
      'isActive',
      'isIndependentOfSheet',
      'setValue',
      'showTruncationPopover',
      'useTabularNumbers',
      'value',
    ],
  ],
  [
    'LinkedRecordCell',
    [
      'columnFabric',
      'disabled',
      'isActive',
      'isIndependentOfSheet',
      'recordSummary',
      'searchValue',
      'setRecordSummary',
      'setValue',
      'tableId',
      'value',
    ],
  ],
  [
    'SimpleManyToManyJoinCell',
    [
      'disabled',
      'isActive',
      'isIndependentOfSheet',
      'joinedRecordSummariesMap',
      'joinPath',
      'value',
    ],
  ],
  [
    'MoneyCell',
    [
      'disabled',
      'formatForDisplay',
      'formatterOptions',
      'isActive',
      'isIndependentOfSheet',
      'searchValue',
      'setValue',
      'showTruncationPopover',
      'value',
    ],
  ],
  [
    'NumberCell',
    [
      'disabled',
      'formatForDisplay',
      'formatterOptions',
      'horizontalAlignment',
      'isActive',
      'isIndependentOfSheet',
      'searchValue',
      'setValue',
      'showTruncationPopover',
      'value',
    ],
  ],
  [
    'PrimaryKeyCell',
    [
      'canViewLinkedEntities',
      'disabled',
      'isActive',
      'isIndependentOfSheet',
      'tableId',
      'value',
    ],
  ],
  [
    'SingleSelectCell',
    [
      'autoSelect',
      'disabled',
      'getLabel',
      'isActive',
      'isIndependentOfSheet',
      'options',
      'setValue',
      'value',
    ],
  ],
  [
    'TextAreaCell',
    [
      'disabled',
      'isActive',
      'isIndependentOfSheet',
      'length',
      'searchValue',
      'setValue',
      'showTruncationPopover',
      'value',
    ],
  ],
  [
    'TextBoxCell',
    [
      'disabled',
      'isActive',
      'isIndependentOfSheet',
      'length',
      'searchValue',
      'setValue',
      'showTruncationPopover',
      'value',
    ],
  ],
  [
    'UriCell',
    [
      'disabled',
      'isActive',
      'isIndependentOfSheet',
      'searchValue',
      'setValue',
      'showTruncationPopover',
      'value',
    ],
  ],
  [
    'UserCell',
    [
      'disabled',
      'isActive',
      'isIndependentOfSheet',
      'recordSummary',
      'searchValue',
      'setRecordSummary',
      'setValue',
      'userDisplayField',
      'value',
    ],
  ],
]);

function getComponentName(component: unknown): string | undefined {
  if (!component || typeof component !== 'function') return undefined;
  return component.name?.replace(/\$.*/, '') || undefined;
}

function getColumnFabric(rawProps: Record<string, unknown>) {
  return rawProps.columnFabric as CellColumnFabric | undefined;
}

function getComponentNameFromProps(
  rawProps: Record<string, unknown>,
): string | undefined {
  if ('joinPath' in rawProps) return 'SimpleManyToManyJoinCell';
  if ('tableId' in rawProps) {
    return getColumnFabric(rawProps)?.linkFk
      ? 'LinkedRecordCell'
      : 'PrimaryKeyCell';
  }
  if ('formattingString' in rawProps && 'formatter' in rawProps) {
    return 'DateTimeCell';
  }
  if ('formatterOptions' in rawProps && 'formatForDisplay' in rawProps) {
    const formatterOptions = rawProps.formatterOptions as
      | Record<string, unknown>
      | undefined;
    return formatterOptions && 'currencySymbol' in formatterOptions
      ? 'MoneyCell'
      : 'NumberCell';
  }
  if ('formatElementForDisplay' in rawProps) return 'ArrayCell';
  if ('options' in rawProps && 'getLabel' in rawProps) {
    return 'SingleSelectCell';
  }
  if ('length' in rawProps) return 'TextBoxCell';

  const columnFabric = getColumnFabric(rawProps);
  if (!columnFabric) return undefined;

  const cellInfo = getCellInfo(
    columnFabric.column.type as DbType,
    columnFabric.column.metadata,
  );
  switch (cellInfo?.type) {
    case 'boolean':
      return 'CheckboxCell';
    case 'file':
      return 'FileCell';
    case 'uri':
      return 'UriCell';
    case 'duration':
      return 'FormattedInputCell';
    case 'money':
      return 'MoneyCell';
    case 'number':
      return 'NumberCell';
    case 'date':
    case 'datetime':
    case 'time':
      return 'DateTimeCell';
    case 'enum':
      return 'SingleSelectCell';
    case 'array':
      return 'ArrayCell';
    case 'string':
      return 'TextBoxCell';
    default:
      return undefined;
  }
}

export function getCellFabricComponentProps(
  component: unknown,
  rawProps: Record<string, unknown>,
): Record<string, unknown> {
  const componentNameFromConstructor = getComponentName(component);
  const componentName = componentNameFromConstructor
    && componentPropNames.has(componentNameFromConstructor)
    ? componentNameFromConstructor
    : getComponentNameFromProps(rawProps);
  const allowedPropNames = componentName
    ? componentPropNames.get(componentName)
    : undefined;
  if (!allowedPropNames) return rawProps;
  return Object.fromEntries(
    allowedPropNames
      .filter((propName) => propName in rawProps)
      .map((propName) => [propName, rawProps[propName]]),
  );
}
