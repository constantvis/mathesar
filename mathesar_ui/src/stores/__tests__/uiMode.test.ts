import { get } from 'svelte/store';

import {
  UI_MODE_LOCAL_STORAGE_KEY,
  createUiModeStores,
  parseUiMode,
} from '../uiMode';

describe('parseUiMode', () => {
  test('accepts known UI modes only', () => {
    expect(parseUiMode('legacy')).toBe('legacy');
    expect(parseUiMode('shadcn')).toBe('shadcn');
    expect(parseUiMode('auto')).toBe('auto');
    expect(parseUiMode('bad-mode')).toBeUndefined();
    expect(parseUiMode(null)).toBeUndefined();
  });
});

describe('createUiModeStores', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('defaults to legacy when no saved mode exists', () => {
    const stores = createUiModeStores('');

    expect(get(stores.storedUiMode)).toBe('legacy');
    expect(get(stores.uiMode)).toBe('legacy');
  });

  test('reads a valid saved mode from localStorage', () => {
    localStorage.setItem(UI_MODE_LOCAL_STORAGE_KEY, 'auto');

    const stores = createUiModeStores('');

    expect(get(stores.storedUiMode)).toBe('auto');
    expect(get(stores.uiMode)).toBe('auto');
  });

  test('falls back to legacy for invalid saved values', () => {
    localStorage.setItem(UI_MODE_LOCAL_STORAGE_KEY, 'bad-mode');

    const stores = createUiModeStores('');

    expect(get(stores.storedUiMode)).toBe('legacy');
    expect(get(stores.uiMode)).toBe('legacy');
  });

  test('uses valid query param value as a non-persistent override', () => {
    localStorage.setItem(UI_MODE_LOCAL_STORAGE_KEY, 'legacy');

    const stores = createUiModeStores('?ui=shadcn');

    expect(get(stores.storedUiMode)).toBe('legacy');
    expect(get(stores.uiMode)).toBe('shadcn');
    expect(localStorage.getItem(UI_MODE_LOCAL_STORAGE_KEY)).toBe('legacy');
  });

  test('persists changes to stored mode when there is no query override', () => {
    const stores = createUiModeStores('');

    stores.setUiMode('auto');

    expect(get(stores.storedUiMode)).toBe('auto');
    expect(get(stores.uiMode)).toBe('auto');
    expect(localStorage.getItem(UI_MODE_LOCAL_STORAGE_KEY)).toBe('auto');
  });
});
