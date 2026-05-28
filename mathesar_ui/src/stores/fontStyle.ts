import LocalStorageStore from './LocalStorageStore';
import { LOCAL_STORAGE_KEYS } from './localStorage';

/**
 * Font-family pairings for shadcn mode. They map to scoped CSS
 * selectors `:root[data-font-style='<id>'] ...` defined in `App.svelte`.
 * Only `shadcn` UI mode reads this — legacy mode keeps Mathesar's
 * stock Inter pairing regardless of the saved value.
 */
export const FONT_STYLES = [
  'inter',
  'system',
  'mono',
  'hybrid',
  'serif-display',
] as const;

export type FontStyle = (typeof FONT_STYLES)[number];

export interface FontStyleOption {
  id: FontStyle;
  label: string;
  description: string;
}

export const FONT_STYLE_OPTIONS: FontStyleOption[] = [
  {
    id: 'inter',
    label: 'Inter (default)',
    description: 'Inter sans for UI, system mono for code.',
  },
  {
    id: 'system',
    label: 'System',
    description: 'Native OS font stack (San Francisco, Segoe UI, Roboto).',
  },
  {
    id: 'mono',
    label: 'Monospace',
    description: 'Full monospace UI for a code-editor feel.',
  },
  {
    id: 'hybrid',
    label: 'Hybrid (Sans + Mono Data)',
    description:
      'Sans-serif UI chrome, monospace for cells, column names, IDs.',
  },
  {
    id: 'serif-display',
    label: 'Serif Display',
    description: 'Serif for headings, sans for body, mono for code.',
  },
];

export const FONT_STYLE_LOCAL_STORAGE_KEY = LOCAL_STORAGE_KEYS.fontStyle;

export function parseFontStyle(value: string | null): FontStyle | undefined {
  if (!value) return undefined;
  return FONT_STYLES.find((s) => s === value);
}

function deserializeFontStyle(value: string): FontStyle {
  const style = parseFontStyle(value);
  if (!style) {
    throw new Error(`Invalid font style: ${value}`);
  }
  return style;
}

export function createFontStyleStores() {
  const storedFontStyle = new LocalStorageStore<FontStyle>({
    key: FONT_STYLE_LOCAL_STORAGE_KEY,
    defaultValue: 'inter',
    serialize: (value) => value,
    deserialize: deserializeFontStyle,
  });

  return {
    storedFontStyle,
    fontStyle: storedFontStyle,
    setFontStyle: (style: FontStyle) => storedFontStyle.set(style),
  };
}

export const {
  storedFontStyle,
  fontStyle,
  setFontStyle,
} = createFontStyleStores();
