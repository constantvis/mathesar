import { derived } from 'svelte/store';

import LocalStorageStore from './LocalStorageStore';
import { LOCAL_STORAGE_KEYS } from './localStorage';

export const UI_MODES = ['legacy', 'shadcn', 'auto'] as const;

export type UiMode = (typeof UI_MODES)[number];

export const UI_MODE_LOCAL_STORAGE_KEY = LOCAL_STORAGE_KEYS.uiMode;

function hasWindowLocation(): boolean {
  return typeof window !== 'undefined' && typeof window.location !== 'undefined';
}

export function parseUiMode(value: string | null): UiMode | undefined {
  if (!value) return undefined;
  return UI_MODES.find((mode) => mode === value);
}

function deserializeUiMode(value: string): UiMode {
  const mode = parseUiMode(value);
  if (!mode) {
    throw new Error(`Invalid UI mode: ${value}`);
  }
  return mode;
}

function getUiModeOverride(search: string): UiMode | undefined {
  return parseUiMode(new URLSearchParams(search).get('ui'));
}

export function createUiModeStores(search = hasWindowLocation() ? window.location.search : '') {
  const storedUiMode = new LocalStorageStore<UiMode>({
    key: UI_MODE_LOCAL_STORAGE_KEY,
    defaultValue: 'legacy',
    serialize: (value) => value,
    deserialize: deserializeUiMode,
  });
  const uiModeOverride = getUiModeOverride(search);
  const uiMode = derived(storedUiMode, (storedValue) => uiModeOverride ?? storedValue);

  return {
    storedUiMode,
    uiMode,
    uiModeOverride,
    setUiMode: (mode: UiMode) => storedUiMode.set(mode),
  };
}

export const {
  storedUiMode,
  uiMode,
  uiModeOverride,
  setUiMode,
} = createUiModeStores();
