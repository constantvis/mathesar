import type { UiMode } from '@mathesar/stores/uiMode';

export type UiAdapterVariant = 'legacy' | 'shadcn';

export function getUiAdapterVariant(uiMode: UiMode): UiAdapterVariant {
  if (uiMode === 'shadcn') return 'shadcn';
  return 'legacy';
}

export function getUiAdapterModeAttribute(uiMode: UiMode): UiAdapterVariant {
  return getUiAdapterVariant(uiMode);
}
