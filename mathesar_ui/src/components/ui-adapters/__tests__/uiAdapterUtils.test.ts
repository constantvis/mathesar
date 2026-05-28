import {
  getUiAdapterModeAttribute,
  getUiAdapterVariant,
} from '../uiAdapterUtils';

describe('getUiAdapterVariant', () => {
  test('uses legacy styling for legacy mode', () => {
    expect(getUiAdapterVariant('legacy')).toBe('legacy');
  });

  test('uses shadcn-like styling only for explicit shadcn mode', () => {
    expect(getUiAdapterVariant('shadcn')).toBe('shadcn');
  });

  test('keeps auto mode on legacy styling until shadcn is available', () => {
    expect(getUiAdapterVariant('auto')).toBe('legacy');
  });
});

describe('getUiAdapterModeAttribute', () => {
  test('returns the layout scope attribute for the active adapter variant', () => {
    expect(getUiAdapterModeAttribute('legacy')).toBe('legacy');
    expect(getUiAdapterModeAttribute('shadcn')).toBe('shadcn');
    expect(getUiAdapterModeAttribute('auto')).toBe('legacy');
  });
});
