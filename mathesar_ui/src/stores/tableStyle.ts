import LocalStorageStore from './LocalStorageStore';
import { LOCAL_STORAGE_KEYS } from './localStorage';

/**
 * Table grid styling variants for shadcn mode. These map to scoped CSS
 * selectors `:root[data-table-style='<id>'] ...` defined in `App.svelte`.
 * Only `shadcn` UI mode reads this — legacy mode keeps Mathesar's stock
 * grid look regardless of the saved value.
 *
 * Variants are ordered from least visual chrome (borderless) to most
 * (grid + zebra). Keep these CSS-only. The table body is virtualized and row
 * heights are calculated in JS, so density/card variants cannot be safely
 * implemented by global CSS alone.
 */
export const TABLE_STYLES = [
  'default',
  'borderless',
  'horizontal',
  'vertical',
  'grid',
  'zebra',
  'zebra-h',
  'zebra-grid',
] as const;

export type TableStyle = (typeof TABLE_STYLES)[number];

export interface TableStyleOption {
  id: TableStyle;
  label: string;
  description: string;
}

export const TABLE_STYLE_OPTIONS: TableStyleOption[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Subtle full grid, light header.',
  },
  {
    id: 'borderless',
    label: 'Borderless',
    description: 'No grid lines, row hover only.',
  },
  {
    id: 'horizontal',
    label: 'Horizontal rules',
    description: 'Only rows have bottom borders.',
  },
  {
    id: 'vertical',
    label: 'Vertical rules',
    description: 'Only columns have side borders.',
  },
  {
    id: 'grid',
    label: 'Grid',
    description: 'Strong grid in both axes.',
  },
  {
    id: 'zebra',
    label: 'Zebra',
    description: 'Alternating row backgrounds, no borders.',
  },
  {
    id: 'zebra-h',
    label: 'Zebra + rules',
    description: 'Alternating rows with horizontal rules.',
  },
  {
    id: 'zebra-grid',
    label: 'Zebra + grid',
    description: 'Alternating rows with full grid.',
  },
];

export const TABLE_STYLE_LOCAL_STORAGE_KEY = LOCAL_STORAGE_KEYS.tableStyle;

export function parseTableStyle(value: string | null): TableStyle | undefined {
  if (!value) return undefined;
  return TABLE_STYLES.find((s) => s === value);
}

function deserializeTableStyle(value: string): TableStyle {
  const style = parseTableStyle(value);
  if (!style) {
    throw new Error(`Invalid table style: ${value}`);
  }
  return style;
}

export function createTableStyleStores() {
  const storedTableStyle = new LocalStorageStore<TableStyle>({
    key: TABLE_STYLE_LOCAL_STORAGE_KEY,
    defaultValue: 'default',
    serialize: (value) => value,
    deserialize: deserializeTableStyle,
  });

  return {
    storedTableStyle,
    tableStyle: storedTableStyle,
    setTableStyle: (style: TableStyle) => storedTableStyle.set(style),
  };
}

export const {
  storedTableStyle,
  tableStyle,
  setTableStyle,
} = createTableStyleStores();
