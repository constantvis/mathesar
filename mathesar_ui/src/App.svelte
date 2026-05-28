<script lang="ts">
  import { isLoading as isTranslationLoading, locale } from 'svelte-i18n';

  import { preloadCommonData } from '@mathesar/utils/preloadData';
  import '@mathesar/utils/polyfills';
  import { Spinner } from '@mathesar-component-library';

  import AppContext from './AppContext.svelte';
  import { initI18n } from './i18n';
  import RootRoute from './routes/RootRoute.svelte';
  import { initUiTheme } from './utils/uiThemePreference';

  initUiTheme();

  const commonData = preloadCommonData();
  const userDisplayLanguage =
    commonData.routing_context !== 'anonymous'
      ? commonData.user.display_language
      : null;
  void initI18n(userDisplayLanguage ?? 'en');
</script>

{#if $isTranslationLoading}
  <div class="app-loader">
    <Spinner size="2rem" />
  </div>
{:else}
  <AppContext {commonData}>
    {#key $locale}
      <RootRoute {commonData} />
    {/key}
  </AppContext>
{/if}

<!--
  Supporting aliases in scss within the preprocessor is a bit of work.
  I looked around to try to get it done but it didn't seem important to
  spend time figuring this out.

  The component-library style import would only ever be from App.svelte
  and when the library is moved to a separate package, we wouldn't have to
  worry about aliases.
-->
<style global lang="scss">
  @import 'component-library/styles.scss';
  @import 'packages/new-item-highlighter/highlightNewItems.scss';
  @import 'components/drag-and-drop/dnd.css';

  $product-utility-colors: (
    'schema': $salmon,
    'database': $amethyst,
    'table': $pumpkin,
    'view': hsl(220, 65%, 55%),
    'column': hsl(hue($salmon), 40%, 60%),
    'record': hsl(296, 35%, 45%),
    'record-fk': hsl(296, 70%, 45%),
    'exploration': $fjord,
    'data-form': $teal,
  );

  body {
    @each $name, $color in $product-utility-colors {
      @include generate-utility-color-tokens($name, $color);
    }

    background-color: var(--color-bg-base);

    --modal-record-selector-z-index: 50;

    /** Component theming */
    --Match__highlight-color: var(--color-bg-highlight);

    /* Typography variables */
    --font-family-base: 'Inter', system-ui, -apple-system, BlinkMacSystemFont,
      'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
      'Helvetica Neue', sans-serif;
    --font-family-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
    --line-height-base: 1.5;
    --letter-spacing-base: -0.011em;

    /**
   * This sets the `mix-blend-mode` property for cell backgrounds.
   *
   * Why use color blending instead of opacity? Because I thought it would give
   * us an easier time keeping all our UI colors in sync. With blending, we
   * supply the exact same color value as we'd use for another places in the UI
   * where we expect the color to be opaque.
   */
    --cell-bg-mix-blend-mode: var(--mix-blend-mode);

    /**
   * This establishes a base background color for the cell when no additional
   * background colors are applied. We need this in case there is a background
   * color applied underneath the cell, e.g. on the table or page.
   */

    --cell-border-horizontal: 1px solid var(--color-border-grid);
    --cell-border-vertical: 1px solid var(--color-border-grid);

    --cell-bg-color-base: var(--color-bg-input);
    --cell-bg-color-error: var(--color-bg-danger);
    --cell-bg-color-header: var(--color-bg-header);
    --cell-bg-color-processing: var(--color-bg-warning);
    --cell-bg-color-disabled: var(--color-bg-input-disabled);
    --cell-bg-color-row-hover: var(--color-bg-input-hover);
    --cell-bg-color-row-selected: var(--color-selection-subtle-1);
    --cell-bg-color-joined-cell: color-mix(
      in srgb,
      var(--color-record-fk),
      transparent 98%
    );
    --cell-bg-color-joined-header: color-mix(
      in srgb,
      var(--color-record-fk),
      transparent 90%
    );

    --cell-text-color-processing: var(--color-fg-base-muted);

    --page-padding-x: var(--lg1);
    --page-padding-y: var(--lg1);
    --page-padding: var(--page-padding-x) var(--page-padding-y);

    --outer-page-padding-for-inset-page: 0;
    --inset-page-padding: var(--lg3) var(--sm1);

    --max-layout-width: 54rem;
    // For database page, schema page, and admin pages
    --max-layout-width-console-pages: 80rem;
    // For import upload, import preview pages
    --max-layout-width-data-pages: 67.357rem;

    // Setting the header height here
    // since when the header is fixed
    // we can use this variable to add margin-top
    // to the below header content container
    --header-height: 3rem;

    --table-title-header-height: 4.6428rem;
    --status-bar-padding: 0.5rem;

    color: var(--color-fg-base);

    --modal-z-index: 2;
    --dropdown-z-index: 2;
    --cell-errors-z-index: 1;
    --new-item-highlighter-z-index: 1;
    --toast-z-index: 3;
    --app-header-z-index: 1;

    overflow: hidden;
    height: 100svh;

    /* Apply typography base styles */
    font-family: var(--font-family-base);
    line-height: var(--line-height-base);
    letter-spacing: var(--letter-spacing-base);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: neutralscale;
    text-rendering: optimizeLegibility;

    /** Panel theming */
    --WithPanel__gap: var(--sm3);
    --WithPanel__resizer-color: color-mix(
      in srgb,
      var(--color-bg-help-strong),
      transparent 30%
    );
    --WithPanel__resizer-size: var(--sm4);
  }

  /**
   * Shadcn migration preview layer.
   *
   * Keep this scoped to the adapter mode. It is intentionally token-first so
   * future real shadcn/Tailwind tokens can replace these aliases with less churn.
   *
   * Sections below:
   *   1. tokens
   *   2. app header + breadcrumbs
   *   3. table page header (entity title row)
   *   4. toolbar (Filter/Sort/Group/Hide/Extend/Inspector triggers)
   *   5. dropdown surface + menu items
   *   6. Hide dropdown switch list
   *   7. table grid (sheet, cells, header row, selection)
   *   8. table inspector
   *   9. footer / status pane / pagination
   *  10. schema / database overview
   *
   * The root selector uses :root[data-ui-adapter-mode='shadcn'] (specificity
   * 0,2,0) rather than the bare attribute selector. This is intentional: it
   * must outweigh Mathesar's body.theme-dark rule (0,1,1) so that turning on
   * shadcn mode reliably forces the light shadcn palette even when the user
   * has the dark theme preference selected.
   *
   * The token block ALSO targets `:root[...] body` (specificity 0,2,1) so it
   * defeats Mathesar's compile-time `body { --color-action-primary: green }`
   * rule (specificity 0,0,1). Without this, the body element keeps its
   * legacy action-primary green token even when html has our dark override —
   * a difference you only notice on buttons (.btn-primary) that walk the
   * cascade from body downward.
   */
  :root[data-ui-adapter-mode='shadcn'],
  :root[data-ui-adapter-mode='shadcn'] body {
    /* === 1a. PALETTE OVERRIDE ==========================================
       Mathesar's stock light theme uses a warm beige canvas (--color-bg-base
       is cream). Shadcn's "new-york" palette is a cool near-white. We need
       to override the upstream tokens themselves — overriding only the
       glasklar-* aliases isn't enough because hundreds of legacy components
       paint with --color-bg-base / --color-fg-base / --card-background /
       --color-border-* directly.

       We map the shadcn/ui v4 "new-york" token oklch values onto the
       upstream Mathesar variable names so every legacy component picks up
       the cool palette automatically when shadcn mode is active. */

    /* surfaces */
    --color-bg-base: hsl(0 0% 100%); /* shadcn background */
    --color-bg-raised-1: hsl(240 5% 96%); /* shadcn muted */
    --color-bg-raised-2: hsl(240 5% 96%);
    --color-bg-input: hsl(0 0% 100%);
    --color-bg-control: hsl(0 0% 100%);
    --color-bg-control-hover: hsl(240 5% 96%);
    --color-bg-control-active: hsl(240 5% 90%);
    --card-background: hsl(0 0% 100%);
    --card-border-color: hsl(240 6% 90%);

    /* text */
    --color-fg-base: hsl(240 10% 12%); /* shadcn foreground */
    --color-fg-subtle-1: hsl(240 4% 46%); /* muted-foreground */
    --color-fg-subtle-2: hsl(240 4% 56%);
    --color-fg-faint: hsl(240 4% 56%);
    --color-fg-light: hsl(0 0% 100%);
    --color-fg-control: hsl(240 10% 12%);
    --color-fg-inverted: hsl(0 0% 100%);

    /* borders */
    --color-border-base: hsl(240 6% 90%);
    --color-border-control: hsl(240 6% 88%);
    --color-border-control-hover: hsl(240 5% 78%);
    --color-border-control-active: hsl(240 5% 70%);
    --color-border-control-focused: hsl(240 5% 50%);
    --color-border-grid: hsl(240 6% 92%);
    --color-border-header: hsl(240 6% 86%);

    /* accent (shadcn primary is near-black, kept as a separate alias to
       preserve the user's accent color in selection / link contexts) */
    --color-selection-strong-1: hsl(240 10% 18%);
    --color-selection-strong-2: hsl(240 10% 24%);
    --color-selection-subtle-1: hsl(240 5% 92%);

    /* icon fills used by EntityPageHeader / SchemaRow circle icons —
       neutralized so every entity-icon reads as a square chip. */
    --icon-fill-color: hsl(240 5% 94%);
    --icon-stroke-color: hsl(240 10% 24%);

    /* product utility colors used by schema/table/view/record indicators.
       Mathesar generates --color-<name>-* tokens from utility-colors via
       SCSS at compile time. Override the resulting CSS vars to neutral
       greys so headings, hero gradients and circle-icons stop shouting
       in shadcn mode. */
    --color-schema: hsl(240 10% 24%);
    --color-schema-80: hsl(240 5% 92%);
    --color-schema-60: hsl(240 5% 86%);
    --color-schema-40: hsl(240 6% 80%);
    --color-schema-20: hsl(240 5% 96%);
    --color-schema-15: hsl(240 6% 86%);
    --color-schema-10: hsl(0 0% 100%);
    --color-schema-5: hsl(240 5% 98%);
    --color-schema-5-active: hsl(240 5% 96%);
    --color-schema-10-active: hsl(240 5% 94%);

    --color-table: hsl(240 10% 24%);
    --color-table-80: hsl(240 5% 92%);
    --color-table-60: hsl(240 5% 86%);
    --color-table-40: hsl(240 6% 80%);
    --color-table-20: hsl(240 5% 96%);
    --color-table-10: hsl(0 0% 100%);
    --color-table-5: hsl(240 5% 98%);

    --color-database: hsl(240 10% 18%);
    --color-database-80: hsl(240 5% 92%);
    --color-database-60: hsl(240 5% 86%);
    --color-database-40: hsl(240 6% 80%);
    --color-database-20: hsl(240 5% 96%);
    --color-database-10: hsl(0 0% 100%);
    --color-database-5: hsl(240 5% 98%);

    --color-view: hsl(240 10% 24%);
    --color-view-80: hsl(240 5% 92%);
    --color-view-40: hsl(240 6% 80%);
    --color-view-20: hsl(240 5% 96%);

    --color-column: hsl(240 10% 24%);
    --color-column-80: hsl(240 5% 92%);
    --color-column-40: hsl(240 6% 80%);

    --color-record: hsl(240 10% 24%);
    --color-record-80: hsl(240 5% 92%);
    --color-record-fk: hsl(240 10% 24%);

    --color-exploration: hsl(240 10% 24%);
    --color-exploration-80: hsl(240 5% 92%);
    --color-data-form: hsl(240 10% 24%);
    --color-data-form-80: hsl(240 5% 92%);

    --color-fg-icon: hsl(240 4% 46%);

    /* supporting */
    --color-bg-supporting: hsl(240 5% 97%);
    --color-fg-help: hsl(240 4% 56%);

    /* links — keep the neutral foreground so link buttons (Hide all,
       Show all, in-cell PK/URI links) don't show as blue. */
    --color-link: var(--color-fg-base);
    --color-link-hover: var(--color-fg-base);
    --color-link-active: var(--color-fg-base);
    --color-fg-link: var(--color-fg-base);
    --color-fg-link-hover: var(--color-fg-base);
    --color-fg-link-active: var(--color-fg-base);
    --color-fg-navigation: var(--color-fg-base);

    /* action-primary — Mathesar's CTA token defaults to asparagus green.
       Override the full intensity ladder + state variants to shadcn-primary
       near-black so "New Table", "New Record", "Create Schema" etc all
       become the same calm shadcn-style filled-primary button. */
    --color-action-primary: hsl(240 10% 12%);
    --color-action-primary-5: hsl(240 5% 98%);
    --color-action-primary-10: hsl(240 5% 96%);
    --color-action-primary-15: hsl(240 5% 92%);
    --color-action-primary-20: hsl(240 5% 88%);
    --color-action-primary-25: hsl(240 5% 80%);
    --color-action-primary-40: hsl(240 6% 60%);
    --color-action-primary-60: hsl(240 8% 35%);
    --color-action-primary-80: hsl(240 10% 18%);
    --color-action-primary-hover: hsl(240 10% 22%);
    --color-action-primary-active: hsl(240 10% 8%);
    --color-action-primary-focused: hsl(240 10% 18%);
    --color-action-primary-80-hover: hsl(240 10% 28%);
    --color-action-primary-80-active: hsl(240 10% 14%);
    --color-action-primary-80-focused: hsl(240 10% 24%);
    --color-action-primary-40-active: hsl(240 6% 50%);

    /* action-secondary — Mathesar's wisteria-grey. Lift to a true shadcn
       secondary: very light grey filled, near-black text. */
    --color-action-secondary: hsl(240 5% 96%);
    --color-action-secondary-5: hsl(0 0% 100%);
    --color-action-secondary-10: hsl(240 5% 98%);
    --color-action-secondary-20: hsl(240 5% 96%);
    --color-action-secondary-25: hsl(240 5% 92%);
    --color-action-secondary-40: hsl(240 6% 84%);
    --color-action-secondary-60: hsl(240 6% 72%);
    --color-action-secondary-80: hsl(240 6% 50%);
    --color-action-secondary-20-hover: hsl(240 5% 92%);
    --color-action-secondary-25-active: hsl(240 5% 88%);
    --color-action-secondary-40-active: hsl(240 5% 78%);

    /* brand — used for the Mathesar wordmark logo + brand accents. Keep it
       neutral too; the tomato red feels out of place in shadcn. */
    --color-brand: hsl(240 10% 12%);
    --color-brand-subtle: hsl(240 4% 46%);

    /* === 1c. force light variant ======================================
       Even when the user's theme preference is "dark" (body.theme-dark),
       shadcn mode should always read as light. We re-declare the light-
       theme tokens here so the dark-theme rules cannot win the cascade
       inside this scope. */

    /* base + modal */
    --color-modal-overlay: rgba(0, 0, 0, 0.42);
    --color-loading-overlay: rgba(255, 255, 255, 0.6);
    --color-bg-deep: hsl(0 0% 100%);
    --color-bg-sunken-1: hsl(240 5% 95%);
    --color-bg-raised-3: hsl(0 0% 100%);
    --color-bg-token: hsl(240 5% 96%);
    --color-bg-group: hsl(0 0% 100%);
    --color-bg-filled-input: hsl(240 5% 97%);
    --color-bg-header: hsl(240 5% 97%);
    --color-bg-highlight: hsl(54 100% 80%);
    --color-bg-highlight-subtle: hsl(54 84% 92%);

    /* contextual surfaces (used by tooltip/alert/Tutorial backgrounds) */
    --color-bg-help: hsl(240 5% 97%);
    --color-bg-info: hsl(212 70% 95%);
    --color-bg-success: hsl(142 40% 92%);
    --color-bg-warning: hsl(38 70% 92%);
    --color-bg-danger: hsl(0 80% 95%);
    --color-bg-tip: hsl(240 5% 96%);
    --color-bg-tip-hover: hsl(240 5% 92%);
    --color-bg-tip-active: hsl(240 5% 88%);
    --color-bg-outcome: hsl(240 5% 96%);
    --color-bg-outcome-hover: hsl(240 5% 92%);
    --color-bg-outcome-active: hsl(240 5% 88%);

    /* contextual borders/foregrounds — keep neutral so tutorials, tip
       buttons, and tooltips don't bleed green/blue */
    --color-border-tip: hsl(240 6% 88%);
    --color-border-tip-hover: hsl(240 6% 78%);
    --color-border-tip-active: hsl(240 6% 70%);
    --color-fg-tip: hsl(240 10% 18%);
    --color-fg-tip-hover: hsl(240 10% 8%);
    --color-fg-tip-active: hsl(240 10% 4%);
    --color-fg-outcome: hsl(240 10% 18%);
    --color-fg-outcome-hover: hsl(240 10% 8%);
    --color-fg-outcome-active: hsl(240 10% 4%);
    --color-border-outcome: hsl(240 6% 88%);
    --color-border-outcome-active: hsl(240 6% 70%);
    --color-border-outcome-focused: hsl(240 6% 60%);

    /* shadow — keep cool grey so dark theme doesn't leak warm shadow */
    --color-shadow: hsl(240 10% 20% / 0.12);

    /* === 1b. glasklar aliases ========================================== */

    /* surfaces */
    --glasklar-ui-surface: var(--color-bg-base);
    --glasklar-ui-surface-muted: var(--color-bg-raised-1);
    --glasklar-ui-surface-raised: var(--color-bg-raised-2);
    --glasklar-ui-surface-input: var(--color-bg-input);
    --glasklar-ui-surface-popover: color-mix(
      in srgb,
      var(--glasklar-ui-surface),
      var(--glasklar-ui-surface-raised) 60%
    );
    --glasklar-ui-control-surface: color-mix(
      in srgb,
      var(--glasklar-ui-surface),
      var(--glasklar-ui-surface-muted) 18%
    );
    --glasklar-ui-control-surface-ghost: transparent;

    /* borders */
    --glasklar-ui-border: color-mix(
      in srgb,
      var(--color-border-control),
      var(--glasklar-ui-surface) 28%
    );
    --glasklar-ui-border-strong: color-mix(
      in srgb,
      var(--color-border-control-active),
      var(--glasklar-ui-surface) 18%
    );
    --glasklar-ui-grid-border: color-mix(
      in srgb,
      var(--color-border-grid),
      var(--glasklar-ui-surface) 12%
    );

    /* text */
    --glasklar-ui-text: var(--color-fg-base);
    --glasklar-ui-text-muted: var(--color-fg-subtle-1);
    --glasklar-ui-text-faint: var(--color-fg-subtle-2);
    --glasklar-ui-text-on-accent: var(--color-fg-inverted);

    /* accent */
    --glasklar-ui-accent: var(--color-selection-strong-2);
    --glasklar-ui-accent-strong: var(--color-selection-strong-1);
    --glasklar-ui-accent-muted: color-mix(
      in srgb,
      var(--color-selection-subtle-1),
      var(--glasklar-ui-surface) 50%
    );
    --glasklar-ui-accent-tint: color-mix(
      in srgb,
      var(--color-selection-subtle-1),
      var(--glasklar-ui-surface) 70%
    );
    --glasklar-ui-accent-border: color-mix(
      in srgb,
      var(--glasklar-ui-accent),
      var(--glasklar-ui-surface) 35%
    );

    /* status */
    --glasklar-ui-danger: var(--color-bg-danger);
    --glasklar-ui-warning: var(--color-bg-warning);
    --glasklar-ui-success: var(--color-bg-success);

    /* interaction */
    --glasklar-ui-focus-ring: color-mix(
      in srgb,
      var(--color-border-control-focused),
      transparent 35%
    );
    --glasklar-ui-hover: color-mix(
      in srgb,
      var(--color-bg-control-hover),
      var(--glasklar-ui-surface) 50%
    );
    --glasklar-ui-hover-strong: color-mix(
      in srgb,
      var(--color-bg-control-hover),
      var(--glasklar-ui-surface) 30%
    );
    --glasklar-ui-selected: var(--glasklar-ui-accent-muted);
    --glasklar-ui-active: color-mix(
      in srgb,
      var(--color-bg-control-active),
      var(--glasklar-ui-surface) 45%
    );

    /* grid surfaces */
    --glasklar-ui-header-surface: color-mix(
      in srgb,
      var(--glasklar-ui-surface-muted),
      var(--glasklar-ui-surface) 26%
    );
    --glasklar-ui-header-glass: color-mix(
      in srgb,
      var(--glasklar-ui-header-surface),
      transparent 22%
    );
    --glasklar-ui-row-header-surface: var(--glasklar-ui-header-surface);
    --glasklar-ui-row-header-glass: color-mix(
      in srgb,
      var(--glasklar-ui-row-header-surface),
      transparent 38%
    );
    --glasklar-ui-header-divider: color-mix(
      in srgb,
      var(--glasklar-ui-border-strong),
      transparent 72%
    );
    --glasklar-ui-header-glass-shadow: 0 8px 18px
      color-mix(in srgb, var(--color-shadow), transparent 72%);
    --glasklar-ui-app-header-bg: color-mix(
      in srgb,
      var(--glasklar-ui-surface),
      transparent 14%
    );
    --glasklar-ui-app-header-border: color-mix(
      in srgb,
      var(--glasklar-ui-border-strong),
      transparent 18%
    );
    --glasklar-ui-cell-active-bg: color-mix(
      in srgb,
      var(--glasklar-ui-accent-tint),
      var(--glasklar-ui-surface) 28%
    );
    --glasklar-ui-cell-selected-bg: color-mix(
      in srgb,
      var(--glasklar-ui-accent-tint),
      var(--glasklar-ui-surface) 55%
    );
    --glasklar-ui-footer-border: color-mix(
      in srgb,
      var(--glasklar-ui-border-strong),
      var(--glasklar-ui-surface) 18%
    );

    /* elevation */
    --glasklar-ui-shadow-sm: 0 1px 2px
      color-mix(in srgb, var(--color-shadow), transparent 60%);
    --glasklar-ui-shadow-popover: 0 10px 22px
        color-mix(in srgb, var(--color-shadow), transparent 18%),
      0 2px 6px color-mix(in srgb, var(--color-shadow), transparent 40%);
    --glasklar-ui-card-shadow: 0 1px 1px
        color-mix(in srgb, var(--color-shadow), transparent 70%),
      0 0 0 1px color-mix(in srgb, var(--glasklar-ui-border), transparent 25%);

    /* typography */
    --glasklar-ui-font-size-table: 0.8125rem;
    --glasklar-ui-font-size-label: 0.75rem;
    --glasklar-ui-font-size-button: 0.8125rem;
    --glasklar-ui-font-size-badge: 0.6875rem;
    --glasklar-ui-font-size-cell: 0.8125rem;
    --glasklar-ui-line-height-tight: 1.15;
    --glasklar-ui-line-height-control: 1.3;
    --glasklar-ui-font-weight-control: 500;
    --glasklar-ui-font-weight-header: 600;
    --glasklar-ui-header-letter-spacing: 0.01em;

    /* spacing */
    --glasklar-ui-radius: 6px;
    --glasklar-ui-radius-lg: 8px;
    --glasklar-ui-toolbar-gap: 0.25rem;
    --glasklar-ui-button-height: 1.875rem;
    --glasklar-ui-button-padding-x: 0.55rem;
    --glasklar-ui-icon-gap: 0.4rem;
    --glasklar-ui-icon-size: 0.8125rem;
    --glasklar-ui-dropdown-padding: 0.3125rem;
    --glasklar-ui-dropdown-item-gap: 0.625rem;
    --glasklar-ui-dropdown-item-height: 1.75rem;
    --glasklar-ui-switch-width: 2rem;
    --glasklar-ui-switch-height: 1.125rem;
    --glasklar-ui-switch-thumb-size: 0.8125rem;
    --glasklar-ui-table-gap: 0.375rem;
    --glasklar-ui-cell-padding: 0.28rem;
    --glasklar-ui-row-height: 1.625rem;
    --glasklar-ui-header-height: 30px;
    --glasklar-ui-footer-height: 2rem;
    --glasklar-ui-footer-padding: 0.18rem 0.5rem;
    --glasklar-ui-inspector-padding: 0.75rem;
    --glasklar-ui-zebra-tint: hsl(240 5% 97%);

    /* legacy alias bridge — these vars are consumed by adapter components */
    --button-border-radius: var(--glasklar-ui-radius);
    --button-gap: var(--glasklar-ui-icon-gap);

    color: var(--glasklar-ui-text);
    letter-spacing: 0;
  }

  /* === 2. app header + breadcrumbs ==================================== */

  :root[data-ui-adapter-mode='shadcn'] .app-layout-header {
    background: var(--glasklar-ui-app-header-bg);
    backdrop-filter: blur(14px) saturate(1.08);
    -webkit-backdrop-filter: blur(14px) saturate(1.08);
  }

  :root[data-ui-adapter-mode='shadcn'] .app-header {
    background: var(--glasklar-ui-app-header-bg);
    backdrop-filter: blur(14px) saturate(1.08);
    -webkit-backdrop-filter: blur(14px) saturate(1.08);
    border-bottom: 0;
    box-shadow: none;
    padding: 0 0.75rem;
  }

  :root[data-ui-adapter-mode='shadcn'] .app-header .right {
    gap: 0.45rem;
  }

  :root[data-ui-adapter-mode='shadcn'] .app-header .right .btn {
    --button-padding: 0 0.65rem;
    --button-border-radius: var(--glasklar-ui-radius);
    --button-background: var(--glasklar-ui-control-surface);
    --button-border-color: var(--glasklar-ui-border);
    --button-color: var(--glasklar-ui-text-muted);
    --button-hover-background: var(--glasklar-ui-hover);
    --button-hover-border-color: var(--glasklar-ui-border-strong);
    --button-hover-color: var(--glasklar-ui-text);
    --button-focus-background: var(--glasklar-ui-control-surface);
    --button-focus-border-color: var(--glasklar-ui-accent-border);
    --button-focus-color: var(--glasklar-ui-text);
    --button-active-background: var(--glasklar-ui-active);
    --button-active-border-color: var(--glasklar-ui-border-strong);
    --button-active-color: var(--glasklar-ui-text);

    min-height: 2rem;
    justify-content: center;
    font-size: var(--glasklar-ui-font-size-button);
    line-height: var(--glasklar-ui-line-height-control);
    box-shadow: var(--glasklar-ui-shadow-xs);
  }

  :root[data-ui-adapter-mode='shadcn'] .app-header .right .btn:hover {
    box-shadow: var(--glasklar-ui-shadow-sm);
  }

  :root[data-ui-adapter-mode='shadcn'] .app-header .right .btn:focus-visible {
    box-shadow: 0 0 0 3px var(--glasklar-ui-focus-ring);
  }

  :root[data-ui-adapter-mode='shadcn'] .app-header .right .feedback-button,
  :root[data-ui-adapter-mode='shadcn'] .app-header .right .btn.padding-compact {
    min-width: 2rem;
    padding: 0 0.65rem;
  }

  :root[data-ui-adapter-mode='shadcn'] .app-header .right .feedback-button {
    --button-font-weight: var(--glasklar-ui-font-weight-control);
  }

  :root[data-ui-adapter-mode='shadcn']
    .app-header
    .right
    .feedback-button
    .trigger {
    gap: 0.45rem;
  }

  :root[data-ui-adapter-mode='shadcn'] .breadcrumb {
    --breadcrumb-spacing: 0.25rem;
    font-size: var(--glasklar-ui-font-size-table);
    line-height: var(--glasklar-ui-line-height-control);
    color: var(--glasklar-ui-text-muted);
    gap: 0.125rem;
  }

  :root[data-ui-adapter-mode='shadcn'] .breadcrumb .home-link {
    margin-right: 0.25rem;
  }

  :root[data-ui-adapter-mode='shadcn'] .breadcrumb .breadcrumb-link {
    padding: 0.2rem 0.25rem;
    border-radius: var(--glasklar-ui-radius);
  }

  :root[data-ui-adapter-mode='shadcn'] .breadcrumb a,
  :root[data-ui-adapter-mode='shadcn'] .breadcrumb button {
    color: var(--glasklar-ui-text-muted);
    font-weight: var(--glasklar-ui-font-weight-control);
  }

  :root[data-ui-adapter-mode='shadcn'] .breadcrumb a:hover,
  :root[data-ui-adapter-mode='shadcn'] .breadcrumb button:hover {
    color: var(--glasklar-ui-text);
  }

  :root[data-ui-adapter-mode='shadcn'] .breadcrumb .name-with-icon .icon {
    color: var(--icon-color, var(--glasklar-ui-text-muted));
    font-size: 0.92rem;
    opacity: 0.95;
    vertical-align: -0.08em;
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb
    .name-with-icon
    .icon
    .fa-icon {
    width: 0.92rem;
    min-width: 0.92rem;
    height: 0.92rem;
  }

  :root[data-ui-adapter-mode='shadcn'] .breadcrumb .entity-switcher {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    margin: 0;
  }

  :root[data-ui-adapter-mode='shadcn'] .breadcrumb .entity-switcher .btn {
    --button-padding: 0;
    --button-border-radius: 4px;
    --button-background: transparent;
    --button-border-color: transparent;
    --button-hover-background: var(--glasklar-ui-hover);
    --button-hover-border-color: transparent;
    --button-focus-background: var(--glasklar-ui-hover);
    --button-focus-border-color: transparent;
    --button-active-background: var(--glasklar-ui-active);
    --button-active-border-color: transparent;

    width: 1.2rem;
    min-width: 1.2rem;
    min-height: 1.45rem;
    height: 1.45rem;
    justify-content: center;
    box-shadow: none;
  }

  :root[data-ui-adapter-mode='shadcn'] .breadcrumb .entity-switcher .trigger {
    width: 1.2rem;
    height: 1.45rem;
    padding: 0;
    justify-content: center;
    border-radius: 4px;
    color: var(--glasklar-ui-text-faint);
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb
    .entity-switcher
    .trigger
    .fa-icon {
    width: 0.62rem;
    min-width: 0.62rem;
    height: 0.62rem;
    font-size: 0.62rem;
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb
    .entity-switcher
    .trigger
    .icon
    .fa-icon {
    width: 0.8rem;
    min-width: 0.8rem;
    height: 0.8rem;
    font-size: 0.8rem;
  }

  :root[data-ui-adapter-mode='shadcn'] .breadcrumb .item-separator,
  :root[data-ui-adapter-mode='shadcn'] .breadcrumb .separator {
    color: var(--glasklar-ui-text-faint);
    opacity: 0.7;
  }

  /* === 3. shared search inputs ======================================== */

  :root[data-ui-adapter-mode='shadcn'] .prefix-wrapper {
    --icon-width: 1.9rem;
    font-size: var(--glasklar-ui-font-size-button);
    line-height: var(--glasklar-ui-line-height-control);
  }

  :root[data-ui-adapter-mode='shadcn']
    .prefix-wrapper
    .input-prefix-icon-container {
    color: var(--glasklar-ui-text-muted);
    font-size: var(--glasklar-ui-icon-size);
  }

  :root[data-ui-adapter-mode='shadcn']
    .prefix-wrapper
    .input-element.prefixed-input {
    min-height: 2rem;
    border-color: var(--glasklar-ui-border);
    border-radius: var(--glasklar-ui-radius);
    background: var(--glasklar-ui-surface-input);
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-button);
    line-height: var(--glasklar-ui-line-height-control);
    box-shadow: var(--glasklar-ui-shadow-xs);
  }

  :root[data-ui-adapter-mode='shadcn']
    .prefix-wrapper
    .input-element.prefixed-input::placeholder {
    color: var(--glasklar-ui-text-muted);
  }

  :root[data-ui-adapter-mode='shadcn']
    .prefix-wrapper
    .input-element.prefixed-input:not(:disabled):focus,
  :root[data-ui-adapter-mode='shadcn']
    .prefix-wrapper
    .input-element.prefixed-input:not(:disabled):active {
    border-color: var(--glasklar-ui-accent-border);
    outline: 0;
    box-shadow: 0 0 0 3px var(--glasklar-ui-focus-ring);
  }

  /* === 4. table page header =========================================== */

  :root[data-ui-adapter-mode='shadcn'] .table-page {
    background: var(--glasklar-ui-surface);
  }

  :root[data-ui-adapter-mode='shadcn'] .table-page .entity-page-header {
    min-height: 3rem;
    padding: 0 var(--sm3);
    border-bottom: 1px solid var(--glasklar-ui-header-divider);
    background: var(--glasklar-ui-surface);
    box-sizing: border-box;
  }

  :root[data-ui-adapter-mode='shadcn']
    .table-page
    .entity-page-header
    .heading {
    min-width: 8rem;
    max-width: 42%;
    padding: 0.35rem 0.5rem 0.35rem 0.35rem;
  }

  :root[data-ui-adapter-mode='shadcn']
    .table-page
    .entity-page-header
    .heading
    .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.85rem;
    height: 1.85rem;
    margin-right: 0.5rem;
    padding: 0;
    border: 1px solid var(--glasklar-ui-border);
    border-radius: var(--glasklar-ui-radius);
    background: var(--glasklar-ui-surface-muted);
    color: var(--glasklar-ui-text-muted);
    font-size: 0.95rem;
  }

  :root[data-ui-adapter-mode='shadcn']
    .table-page
    .entity-page-header
    .heading
    .name {
    color: var(--glasklar-ui-text);
    font-size: 0.95rem;
    font-weight: var(--glasklar-ui-font-weight-header);
    letter-spacing: 0;
    line-height: 1.25;
  }

  :root[data-ui-adapter-mode='shadcn']
    .table-page
    .entity-page-header
    .heading
    .description {
    font-size: var(--glasklar-ui-font-size-label);
    color: var(--glasklar-ui-text-muted);
  }

  :root[data-ui-adapter-mode='shadcn']
    .table-page
    .entity-page-header
    .actions {
    min-width: 0;
    margin-left: 0.25rem;
    padding: 0.35rem 0.5rem;
  }

  :root[data-ui-adapter-mode='shadcn']
    .table-page
    .entity-page-header
    .actions.has-right-actions
    .actions-left {
    margin-right: 0.75rem;
  }

  /* === 5. toolbar ===================================================== */

  :root[data-ui-adapter-mode='shadcn'] .quick-access {
    --badge-font-size: var(--glasklar-ui-font-size-badge);
    display: flex;
    align-items: center;
    gap: var(--glasklar-ui-toolbar-gap);
    min-width: 0;
  }

  :root[data-ui-adapter-mode='shadcn'] .quick-access > * + *,
  :root[data-ui-adapter-mode='shadcn'] .aux-actions > * + * {
    margin-left: 0 !important;
  }

  :root[data-ui-adapter-mode='shadcn'] .aux-actions {
    gap: var(--glasklar-ui-toolbar-gap);
  }

  /* Default trigger = shadcn "outline" variant: thin border, transparent
     surface, soft shadow-xs. Avoid the heavy outlined-form-input look but
     keep enough visual weight to read against the canvas. */
  :root[data-ui-adapter-mode='shadcn']
    .operation-dropdown-trigger.ui-adapter-button,
  :root[data-ui-adapter-mode='shadcn'] .inspector-button .ui-adapter-button {
    min-height: var(--glasklar-ui-button-height);
    height: var(--glasklar-ui-button-height);
    padding: 0 var(--glasklar-ui-button-padding-x);
    border: 1px solid var(--glasklar-ui-border);
    background: var(--glasklar-ui-surface);
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-button);
    font-weight: var(--glasklar-ui-font-weight-control);
    line-height: var(--glasklar-ui-line-height-control);
    box-shadow: var(--glasklar-ui-shadow-sm);
  }

  /* Inspector sits in the right group — keep it visually identical to the
     toolbar triggers so the row reads as one continuous control band. */
  :root[data-ui-adapter-mode='shadcn'] .inspector-button .ui-adapter-button {
    background: var(--glasklar-ui-surface);
  }

  :root[data-ui-adapter-mode='shadcn']
    .operation-dropdown-trigger.ui-adapter-button
    .fa-icon,
  :root[data-ui-adapter-mode='shadcn']
    .inspector-button
    .ui-adapter-button
    .fa-icon {
    width: 1em;
    height: 1em;
    color: var(--glasklar-ui-text-muted);
    font-size: var(--glasklar-ui-icon-size) !important;
    line-height: 1;
    vertical-align: -0.08em;
  }

  :root[data-ui-adapter-mode='shadcn'] .operation-dropdown-trigger > .label {
    gap: var(--glasklar-ui-icon-gap);
  }

  :root[data-ui-adapter-mode='shadcn']
    .operation-dropdown-trigger.ui-adapter-button:hover,
  :root[data-ui-adapter-mode='shadcn']
    .inspector-button
    .ui-adapter-button:hover {
    border-color: var(--glasklar-ui-border-strong);
    background: var(--glasklar-ui-hover);
    color: var(--glasklar-ui-text);
  }

  :root[data-ui-adapter-mode='shadcn']
    .operation-dropdown-trigger.ui-adapter-button:focus-visible,
  :root[data-ui-adapter-mode='shadcn']
    .inspector-button
    .ui-adapter-button:focus-visible {
    outline: 0;
    border-color: var(--glasklar-ui-accent);
    box-shadow: 0 0 0 3px var(--glasklar-ui-focus-ring);
  }

  /* aria-expanded = visually open. Keep tinted bg but stronger than
     the soft applied state so the open trigger reads as the "anchor". */
  :root[data-ui-adapter-mode='shadcn']
    .operation-dropdown-trigger.ui-adapter-button[aria-expanded='true'],
  :root[data-ui-adapter-mode='shadcn']
    .inspector-button
    .ui-adapter-button.active {
    border-color: var(--glasklar-ui-border-strong);
    background: var(--glasklar-ui-hover-strong);
    color: var(--glasklar-ui-text);
  }

  /* "applied" (filter/sort/group has values) — outline + accent ring
     on the badge, NOT a full button fill (shadcn convention). */
  :root[data-ui-adapter-mode='shadcn']
    .operation-dropdown-trigger.ui-adapter-button.applied {
    border-color: var(--glasklar-ui-border);
    background: var(--glasklar-ui-control-surface);
    color: var(--glasklar-ui-text);
  }

  :root[data-ui-adapter-mode='shadcn']
    .operation-dropdown-trigger.ui-adapter-button.applied:hover {
    background: var(--glasklar-ui-hover);
  }

  :root[data-ui-adapter-mode='shadcn']
    .operation-dropdown-trigger.ui-adapter-button.applied
    .ui-adapter-badge {
    border-color: var(--glasklar-ui-accent-border);
    background: var(--glasklar-ui-accent-tint);
    color: var(--glasklar-ui-accent);
    font-weight: var(--glasklar-ui-font-weight-control);
  }

  :root[data-ui-adapter-mode='shadcn']
    .operation-dropdown-trigger.ui-adapter-button.applied
    .fa-icon {
    color: var(--glasklar-ui-accent);
  }

  :root[data-ui-adapter-mode='shadcn']
    .operation-dropdown-trigger.ui-adapter-button[aria-expanded='true']
    .fa-icon {
    color: var(--glasklar-ui-text);
  }

  :root[data-ui-adapter-mode='shadcn'] .ui-adapter-badge {
    min-width: 1.05rem;
    height: 1.05rem;
    padding: 0 0.32rem;
    border-color: var(--glasklar-ui-border);
    border-radius: 4px;
    background: var(--glasklar-ui-surface-muted);
    color: var(--glasklar-ui-text-muted);
    font-size: var(--glasklar-ui-font-size-badge);
    font-weight: var(--glasklar-ui-font-weight-control);
    line-height: 1;
  }

  /* === 6. dropdown surface + menu items =============================== */

  :root[data-ui-adapter-mode='shadcn'] .dropdown.content {
    border: 1px solid var(--glasklar-ui-border);
    border-radius: var(--glasklar-ui-radius-lg);
    background: var(--glasklar-ui-surface-popover);
    box-shadow: var(--glasklar-ui-shadow-popover);
    padding: var(--glasklar-ui-dropdown-padding);
    color: var(--glasklar-ui-text);
  }

  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .menu,
  :root[data-ui-adapter-mode='shadcn'] .dropdown.content [role='menu'] {
    padding: 0;
    gap: 1px;
  }

  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .button-menu-item,
  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .menu-item-button,
  :root[data-ui-adapter-mode='shadcn'] .dropdown.content [role='menuitem'],
  :root[data-ui-adapter-mode='shadcn'] .dropdown.content [role='option'] {
    min-height: var(--glasklar-ui-dropdown-item-height);
    padding: 0 0.5rem;
    border-radius: 5px;
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-label);
    font-weight: 400;
    gap: var(--glasklar-ui-dropdown-item-gap);
  }

  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    .button-menu-item
    .fa-icon,
  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    .menu-item-button
    .fa-icon,
  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    [role='menuitem']
    .fa-icon,
  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    [role='option']
    .fa-icon {
    color: var(--glasklar-ui-text-muted);
    width: 1em;
    height: 1em;
    font-size: var(--glasklar-ui-icon-size) !important;
  }

  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    .button-menu-item:hover:not([disabled]),
  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    .menu-item-button:hover:not(.disabled),
  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    [role='menuitem']:hover:not([disabled]),
  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    [role='option']:hover:not(.disabled) {
    background: var(--glasklar-ui-hover);
    color: var(--glasklar-ui-text);
  }

  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    .button-menu-item:focus-visible,
  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    .menu-item-button:focus-visible,
  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    .menu-item-button:focus:not(.disabled),
  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    [role='menuitem']:focus-visible,
  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    [role='option'].in-focus {
    outline: 0;
    background: var(--glasklar-ui-hover);
  }

  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .list-box-options {
    display: grid;
    gap: 1px;
    max-height: min(20rem, calc(100svh - 12rem));
    overflow: auto;
    padding: 0;
  }

  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content.select
    .list-box-options
    [role='option'] {
    display: flex;
    align-items: center;
    min-height: var(--glasklar-ui-dropdown-item-height);
    padding: 0 0.55rem;
    border-radius: 5px;
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-label);
    font-weight: 400;
    line-height: var(--glasklar-ui-line-height-control);
  }

  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content.select
    .list-box-options
    [role='option']
    .name-with-icon {
    display: inline-flex;
    align-items: center;
    gap: var(--glasklar-ui-dropdown-item-gap);
    min-width: 0;
  }

  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content.select
    .list-box-options
    [role='option']
    .name-with-icon
    .icon {
    display: inline-flex;
    align-items: center;
    width: var(--glasklar-ui-icon-size);
    min-width: var(--glasklar-ui-icon-size);
    color: var(--glasklar-ui-text-muted);
    opacity: 1;
  }

  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content.select
    .list-box-options
    [role='option']
    .name-with-icon
    .icon
    .fa-icon {
    width: var(--glasklar-ui-icon-size);
    height: var(--glasklar-ui-icon-size);
    font-size: var(--glasklar-ui-icon-size) !important;
  }

  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content.select
    .list-box-options
    [role='option']
    .name-with-icon
    .icon
    + .name {
    margin-left: 0;
  }

  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .menu-heading {
    padding: 0.25rem 0.5rem 0.25rem;
    color: var(--glasklar-ui-text-muted);
    font-size: 0.6875rem;
    font-weight: var(--glasklar-ui-font-weight-control);
    letter-spacing: var(--glasklar-ui-header-letter-spacing);
    text-transform: none;
  }

  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .menu-divider,
  :root[data-ui-adapter-mode='shadcn'] .dropdown.content hr {
    margin: 0.25rem -0.125rem;
    border: 0;
    border-top: 1px solid var(--glasklar-ui-border);
  }

  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .search {
    position: sticky;
    top: 0;
    z-index: 1;
    margin: 0 0 0.25rem;
    padding: 0.1rem 0 0.45rem;
    border-bottom: 1px solid var(--glasklar-ui-border);
    background: var(--glasklar-ui-surface-popover);
  }

  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    .search
    .prefix-wrapper {
    --icon-width: 1.55rem;
    font-size: var(--glasklar-ui-font-size-button);
  }

  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    .search
    .input-prefix-icon-container {
    color: var(--glasklar-ui-text-muted);
    font-size: var(--glasklar-ui-icon-size);
  }

  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    .search
    .input-element.prefixed-input {
    min-height: 1.75rem;
    border-color: transparent;
    border-radius: 5px;
    background: transparent;
    padding: 0.22rem 0.35rem 0.22rem var(--icon-width);
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-button);
    line-height: var(--glasklar-ui-line-height-control);
    box-shadow: none;
  }

  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    .search
    .input-element.prefixed-input:not(:disabled):focus,
  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    .search
    .input-element.prefixed-input:not(:disabled):active {
    border-color: transparent;
    outline: 0;
    background: var(--glasklar-ui-surface-muted);
    box-shadow: none;
  }

  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    .operation-column-picker
    .menu,
  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    .operation-column-picker
    .column-picker-menu,
  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .filter-column-picker {
    max-height: min(20rem, calc(100svh - 12rem));
    overflow: auto;
  }

  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content.breadcrumb-selector-dropdown {
    padding: 0.35rem;
    font-size: var(--glasklar-ui-font-size-button);
    line-height: var(--glasklar-ui-line-height-control);
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb-selector-dropdown
    .entity-switcher-content {
    gap: 0.35rem;
    padding: 0;
    min-width: min(30rem, calc(100vw - 1rem));
    color: var(--glasklar-ui-text);
  }

  :root[data-ui-adapter-mode='shadcn'] .breadcrumb-selector-dropdown .search {
    margin-bottom: 0.25rem;
  }

  :root[data-ui-adapter-mode='shadcn'] .breadcrumb-selector-dropdown .sections {
    gap: 0.25rem;
    padding: 0.1rem 0;
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb-selector-dropdown
    .breadcrumb-selector-section {
    gap: 0.25rem;
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb-selector-dropdown
    .breadcrumb-selector-section
    .content {
    gap: 0.2rem;
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb-selector-dropdown
    .breadcrumb-selector-section
    .label {
    padding: 0.25rem 0.45rem 0.15rem;
    color: var(--glasklar-ui-text-muted);
    font-size: 0.75rem;
    font-weight: var(--glasklar-ui-font-weight-control);
    line-height: 1rem;
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb-selector-dropdown
    .breadcrumb-selector-section
    .detail {
    padding: 0 0.45rem;
    color: var(--glasklar-ui-text-muted);
    font-size: 0.75rem;
    line-height: 1rem;
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb-selector-dropdown
    .breadcrumb-selector-row {
    min-height: 1.875rem;
    border-radius: var(--glasklar-ui-radius);
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb-selector-dropdown
    .breadcrumb-selector-row.active {
    background: var(--glasklar-ui-selected);
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb-selector-dropdown
    .breadcrumb-selector-row
    a {
    display: flex;
    align-items: center;
    padding: 0.28rem 0.45rem;
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-button);
    line-height: var(--glasklar-ui-line-height-control);
    --name-color: var(--glasklar-ui-text);
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb-selector-dropdown
    .breadcrumb-selector-row
    .hover-indicator {
    background: var(--glasklar-ui-hover);
    transition: opacity 0.12s ease;
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb-selector-dropdown
    .breadcrumb-selector-row:has(a:focus-visible)
    .hover-indicator {
    opacity: 1;
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb-selector-dropdown
    .name-with-icon {
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-button);
    font-weight: var(--glasklar-ui-font-weight-control);
    line-height: var(--glasklar-ui-line-height-control);
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb-selector-dropdown
    .name-with-icon
    .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--glasklar-ui-text-muted);
    opacity: 1;
    width: 1rem;
    vertical-align: -0.12em;
  }

  :root[data-ui-adapter-mode='shadcn']
    .breadcrumb-selector-dropdown
    .name-with-icon
    .name {
    color: var(--glasklar-ui-text);
    vertical-align: baseline;
  }

  :root[data-ui-adapter-mode='shadcn'] .breadcrumb-selector-dropdown .actions {
    margin-top: 0.25rem;
    padding-top: 0.35rem;
    border-top-color: var(--glasklar-ui-border);
  }

  /* === 6. Hide dropdown switch list =================================== */

  :root[data-ui-adapter-mode='shadcn'] .hide-columns {
    min-width: min(22rem, calc(100svw - 1rem));
    padding: 0;
  }

  :root[data-ui-adapter-mode='shadcn'] .hide-columns .header {
    justify-content: space-between;
    padding: 0.5rem 0.5rem 0.5rem 0.625rem;
    border-bottom: 1px solid var(--glasklar-ui-border);
    margin-bottom: 0.375rem;
    gap: 0.5rem;
  }

  :root[data-ui-adapter-mode='shadcn'] .hide-columns .header .title {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-right: auto;
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-label);
    font-weight: var(--glasklar-ui-font-weight-header);
  }

  :root[data-ui-adapter-mode='shadcn'] .hide-columns .header .title-count {
    display: inline-flex;
    align-items: center;
    height: 1.05rem;
    padding: 0 0.32rem;
    border: 1px solid var(--glasklar-ui-accent-border);
    border-radius: 4px;
    background: var(--glasklar-ui-accent-tint);
    color: var(--glasklar-ui-accent);
    font-size: var(--glasklar-ui-font-size-badge);
    font-weight: var(--glasklar-ui-font-weight-control);
    line-height: 1;
  }

  :root[data-ui-adapter-mode='shadcn'] .hide-columns .links {
    gap: 0.25rem;
  }

  /* HideColumns.svelte's deeply nested scoped SCSS resolves to ~8-class
     specificity for the underline. !important is the only way to defeat
     that without forking the component. */
  :root[data-ui-adapter-mode='shadcn'] .hide-columns .link {
    min-height: 1.625rem;
    padding: 0 0.5rem;
    border: 0;
    border-radius: 5px;
    color: var(--glasklar-ui-text-muted) !important;
    text-decoration: none !important;
    font-size: var(--glasklar-ui-font-size-label);
    font-weight: var(--glasklar-ui-font-weight-control);
  }

  :root[data-ui-adapter-mode='shadcn'] .hide-columns .link:hover {
    background: var(--glasklar-ui-hover);
    color: var(--glasklar-ui-text);
  }

  :root[data-ui-adapter-mode='shadcn'] .hide-columns .separator {
    display: none;
  }

  :root[data-ui-adapter-mode='shadcn'] .hide-columns .column-list {
    max-height: min(28rem, calc(100svh - 9rem));
    overflow: auto;
    padding: 0;
  }

  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .filters,
  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .sorters,
  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .groups {
    padding: 0.5rem;
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-button);
  }

  :root[data-ui-adapter-mode='shadcn']
    .dropdown.content
    .operation-column-picker {
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-button);
    line-height: var(--glasklar-ui-line-height-control);
  }

  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .filters .header,
  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .sorters .header,
  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .groups header {
    margin: -0.1rem -0.1rem 0.45rem;
    padding: 0.1rem 0.1rem 0.45rem;
    border-bottom: 1px solid var(--glasklar-ui-border);
    color: var(--glasklar-ui-text-muted);
    font-size: var(--glasklar-ui-font-size-label);
    font-weight: var(--glasklar-ui-font-weight-control);
    line-height: var(--glasklar-ui-line-height-control);
  }

  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .filters .content,
  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .sorters .content,
  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .groups .content {
    margin-top: 0;
  }

  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .sorters .footer,
  :root[data-ui-adapter-mode='shadcn'] .dropdown.content .groups footer {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--glasklar-ui-border);
  }

  /* === 7. table grid ================================================== */

  :root[data-ui-adapter-mode='shadcn'] .table-view {
    --WithPanel__gap: var(--glasklar-ui-table-gap);
    --WithPanel__resizer-size: 0.25rem;
    --WithPanel__resizer-color: var(--glasklar-ui-accent);
    --status-bar-padding: var(--glasklar-ui-footer-padding);
    --canvas-background: var(--glasklar-ui-surface);
    --canvas-border-color: var(--glasklar-ui-border);
    --cell-border-horizontal: 1px solid var(--glasklar-ui-grid-border);
    --cell-border-vertical: 1px solid var(--glasklar-ui-grid-border);
    --cell-bg-color-base: var(--glasklar-ui-surface);
    --cell-bg-color-row-hover: var(--glasklar-ui-hover);
    --cell-bg-color-row-selected: var(--glasklar-ui-selected);
    --sheet-header-height: var(--glasklar-ui-header-height);

    gap: var(--glasklar-ui-table-gap);
    font-size: var(--glasklar-ui-font-size-table);
  }

  :root[data-ui-adapter-mode='shadcn'] .sheet {
    border-color: var(--glasklar-ui-border);
    border-top-color: transparent;
    border-radius: var(--glasklar-ui-radius-lg);
    box-shadow: var(--glasklar-ui-shadow-sm);
  }

  :root[data-ui-adapter-mode='shadcn']
    .sheet.uses-virtual-list
    [data-sheet-body-element='list'] {
    --virtual-list-padding-top: var(--sheet-header-height, 32px);
  }

  /* shadcn convention: header text uses *foreground*, not muted. */
  :root[data-ui-adapter-mode='shadcn'] [data-sheet-element='header-row'] {
    position: absolute;
    inset: 0 0 auto 0;
    z-index: var(--z-index__sheet__origin-cell);
    height: var(--sheet-header-height, 32px);
    background-color: var(--glasklar-ui-header-glass);
    backdrop-filter: blur(6px) saturate(1.08);
    -webkit-backdrop-filter: blur(6px) saturate(1.08);
    border-bottom: 1px solid var(--glasklar-ui-header-divider);
    box-shadow: var(--glasklar-ui-header-glass-shadow);
  }

  :root[data-ui-adapter-mode='shadcn']
    [data-sheet-element='column-header-cell'] {
    border-right-color: var(--glasklar-ui-grid-border);
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-label);
    font-weight: var(--glasklar-ui-font-weight-control);
    line-height: var(--glasklar-ui-line-height-tight);
    text-transform: none;
    letter-spacing: 0;
  }

  :root[data-ui-adapter-mode='shadcn'] .header-cell-btn {
    padding: 0 0.55rem;
    border-radius: 0;
    color: inherit;
    font-size: inherit;
    line-height: inherit;
    font-weight: inherit;
  }

  :root[data-ui-adapter-mode='shadcn'] .header-cell-root .processed-column-name,
  :root[data-ui-adapter-mode='shadcn'] .header-cell-root .joined-column-name {
    gap: 0.4rem;
  }

  :root[data-ui-adapter-mode='shadcn'] .header-cell-root .indicator-icons {
    gap: 0.35rem;
    color: var(--glasklar-ui-text-faint);
  }

  :root[data-ui-adapter-mode='shadcn']
    .header-cell-root
    .indicator-icons
    > *
    + * {
    margin-left: 0;
  }

  :root[data-ui-adapter-mode='shadcn'] .header-cell-root .fa-icon {
    font-size: 0.8125rem !important;
    vertical-align: -0.1em;
  }

  :root[data-ui-adapter-mode='shadcn'] [data-sheet-element='origin-cell'] {
    background: var(--glasklar-ui-header-glass);
    backdrop-filter: blur(6px) saturate(1.08);
    -webkit-backdrop-filter: blur(6px) saturate(1.08);
    border-right-color: var(--glasklar-ui-grid-border);
  }

  :root[data-ui-adapter-mode='shadcn'] [data-sheet-element='row-header-cell'] {
    --cell-bg-color-header: transparent;
    background: var(--glasklar-ui-row-header-glass);
    backdrop-filter: blur(12px) saturate(1.08);
    -webkit-backdrop-filter: blur(12px) saturate(1.08);
    border-right-color: var(--glasklar-ui-grid-border);
    border-bottom-color: var(--glasklar-ui-grid-border);
    color: var(--glasklar-ui-text-muted);
    font-size: var(--glasklar-ui-font-size-label);
    line-height: var(--glasklar-ui-line-height-tight);
  }

  :root[data-ui-adapter-mode='shadcn'] .header-cell-btn:focus-visible {
    outline: 0;
    box-shadow: inset 0 0 0 2px var(--glasklar-ui-focus-ring);
  }

  /* No background-color transition on data cells — the legacy 80ms fade
     caused noticeable flicker on virtual-list scroll and row hover thrash
     under heavy data sets. Snap to state instead. */
  :root[data-ui-adapter-mode='shadcn'] [data-sheet-element='data-cell'] {
    --cell-padding: var(--glasklar-ui-cell-padding);
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-cell);
    line-height: var(--glasklar-ui-line-height-tight);
    transition: none;
  }

  :root[data-ui-adapter-mode='shadcn'] .cell-fabric:not(.is-independent) {
    --cell-padding: var(--glasklar-ui-cell-padding);
  }

  :root[data-ui-adapter-mode='shadcn']
    [data-sheet-element='data-cell']
    .cell-wrapper:not(.is-edit-mode) {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  :root[data-ui-adapter-mode='shadcn']
    [data-sheet-element='data-cell']
    .postgres-keyword,
  :root[data-ui-adapter-mode='shadcn']
    [data-sheet-element='row-header-cell']
    .postgres-keyword {
    background: transparent;
    color: var(--glasklar-ui-text-faint);
    font-weight: 400;
  }

  :root[data-ui-adapter-mode='shadcn'] [data-cell-active] .active-indicator {
    --size: 2px;
    --color: var(--glasklar-ui-cell-active-ring, var(--glasklar-ui-accent));
    border-radius: 4px;
  }

  :root[data-ui-adapter-mode='shadcn'] [data-cell-active] {
    background: var(--glasklar-ui-cell-active-bg);
  }

  :root[data-ui-adapter-mode='shadcn'] [data-cell-selected] {
    background: var(--glasklar-ui-cell-selected-bg);
    color: var(--glasklar-ui-text);
  }

  :root[data-ui-adapter-mode='shadcn'] .cell-fabric.show-as-skeleton .loader {
    background: var(--glasklar-ui-surface);
  }

  :root[data-ui-adapter-mode='shadcn'] .cell-fabric.show-as-skeleton .bg {
    border-radius: 5px;
    background: color-mix(
      in srgb,
      var(--glasklar-ui-surface-input),
      var(--glasklar-ui-surface) 34%
    );
  }

  /* === 7b. modal + portaled popovers ================================== */

  /* Modal overlay should be a subtle scrim, not pitch black. */
  :root[data-ui-adapter-mode='shadcn'] .modal .overlay {
    background: var(--color-modal-overlay);
  }

  :root[data-ui-adapter-mode='shadcn'] .modal .window {
    border: 1px solid var(--glasklar-ui-border);
    border-radius: 12px;
    background: var(--glasklar-ui-surface);
    color: var(--glasklar-ui-text);
    box-shadow:
      0 25px 50px -12px color-mix(in srgb, var(--color-shadow), transparent 0%),
      0 0 0 1px color-mix(in srgb, var(--color-shadow), transparent 80%);
    overflow: hidden;
  }

  :root[data-ui-adapter-mode='shadcn']
    .modal
    .window
    [data-window-area='title-bar'] {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid var(--glasklar-ui-border);
    background: var(--glasklar-ui-surface);
    color: var(--glasklar-ui-text);
    font-weight: var(--glasklar-ui-font-weight-header);
  }

  :root[data-ui-adapter-mode='shadcn']
    .modal
    .window
    [data-window-area='title'] {
    color: var(--glasklar-ui-text);
    font-size: 0.95rem;
    font-weight: var(--glasklar-ui-font-weight-header);
  }

  :root[data-ui-adapter-mode='shadcn']
    .modal
    .window
    [data-window-area='body'] {
    background: var(--glasklar-ui-surface);
    color: var(--glasklar-ui-text);
  }

  :root[data-ui-adapter-mode='shadcn']
    .modal
    .window
    [data-window-area='footer'] {
    background: var(--glasklar-ui-surface);
    border-top: 1px solid var(--glasklar-ui-border);
    padding: 0.75rem 1rem;
  }

  /* Record-selector grid inside modal: normalize cell sizes so the
     gigantic-row look from the user's bug report goes away. */
  :root[data-ui-adapter-mode='shadcn'] .record-selector-content {
    background: var(--glasklar-ui-surface);
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-table);
  }

  :root[data-ui-adapter-mode='shadcn']
    .record-selector-content
    [data-sheet-element='header-row'] {
    background: var(--glasklar-ui-header-glass);
    border-bottom: 1px solid var(--glasklar-ui-header-divider);
  }

  :root[data-ui-adapter-mode='shadcn']
    .record-selector-content
    [data-sheet-element='column-header-cell'] {
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-label);
    font-weight: var(--glasklar-ui-font-weight-control);
    padding: 0.4rem 0.55rem;
  }

  :root[data-ui-adapter-mode='shadcn']
    .record-selector-content
    [data-sheet-element='data-cell'] {
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-cell);
    line-height: var(--glasklar-ui-line-height-tight);
  }

  :root[data-ui-adapter-mode='shadcn']
    .record-selector-content
    .cell-fabric:not(.is-independent) {
    --cell-padding: var(--glasklar-ui-cell-padding);
  }

  :root[data-ui-adapter-mode='shadcn']
    .record-selector-content
    [data-cell-active],
  :root[data-ui-adapter-mode='shadcn']
    .record-selector-content
    [data-cell-selected] {
    background: var(--glasklar-ui-cell-selected-bg);
  }

  :root[data-ui-adapter-mode='shadcn'] .record-selector-content .sheet {
    border-color: var(--glasklar-ui-border);
    border-radius: var(--glasklar-ui-radius);
  }

  /* === 8. table inspector ============================================= */

  :root[data-ui-adapter-mode='shadcn'] .table-inspector {
    border-color: var(--glasklar-ui-border);
    border-radius: var(--glasklar-ui-radius-lg);
    background-color: var(--glasklar-ui-surface);
    box-shadow: var(--glasklar-ui-shadow-sm);
  }

  /* === 9. footer / status pane / pagination =========================== */

  :root[data-ui-adapter-mode='shadcn'] .status-pane {
    box-sizing: border-box;
    min-height: var(--glasklar-ui-footer-height);
    flex-basis: var(--glasklar-ui-footer-height);
    border-top: 0;
    background: var(--glasklar-ui-surface);
    color: var(--glasklar-ui-text-muted);
    font-size: var(--glasklar-ui-font-size-table);
    line-height: var(--glasklar-ui-line-height-control);
    box-shadow: none;
  }

  :root[data-ui-adapter-mode='shadcn'] .status-pane-items-section {
    gap: 0.5rem;
  }

  :root[data-ui-adapter-mode='shadcn'] .status-pane-items-section > * + * {
    margin-left: 0 !important;
  }

  :root[data-ui-adapter-mode='shadcn'] .status-pane .record-count {
    gap: var(--glasklar-ui-icon-gap);
    color: var(--glasklar-ui-text-muted);
  }

  :root[data-ui-adapter-mode='shadcn'] .status-pane .pill {
    padding: 0.1rem 0.45rem;
    border-color: var(--glasklar-ui-border);
    border-radius: 999px;
    background: var(--glasklar-ui-surface-muted);
    color: var(--glasklar-ui-text-muted);
    font-size: var(--glasklar-ui-font-size-badge);
    font-weight: var(--glasklar-ui-font-weight-control);
  }

  /* Generic ghost-style footer button */
  :root[data-ui-adapter-mode='shadcn'] .status-pane button.btn,
  :root[data-ui-adapter-mode='shadcn'] .status-pane .input-element.select {
    min-height: 1.75rem;
    height: 1.75rem;
    padding: 0 0.55rem;
    border-color: transparent;
    border-radius: var(--glasklar-ui-radius);
    background: transparent;
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-button);
    line-height: var(--glasklar-ui-line-height-control);
    box-shadow: none;
  }

  :root[data-ui-adapter-mode='shadcn'] .status-pane button.btn:hover,
  :root[data-ui-adapter-mode='shadcn']
    .status-pane
    .input-element.select:hover {
    border-color: transparent;
    background: var(--glasklar-ui-hover);
    color: var(--glasklar-ui-text);
  }

  :root[data-ui-adapter-mode='shadcn'] .status-pane .input-element.select {
    border: 1px solid var(--glasklar-ui-border);
    background: var(--glasklar-ui-surface);
  }

  :root[data-ui-adapter-mode='shadcn']
    .status-pane
    .input-element.select:hover {
    border-color: var(--glasklar-ui-border-strong);
    background: var(--glasklar-ui-hover);
  }

  /* "New record" — the primary CTA on the left should be a filled
     accent, the shadcn primary-button look. */
  :root[data-ui-adapter-mode='shadcn']
    .status-pane
    .status-pane-items-section:first-child
    button.btn {
    border-color: var(--glasklar-ui-accent-strong);
    background: var(--glasklar-ui-accent);
    color: var(--glasklar-ui-text-on-accent);
    font-weight: var(--glasklar-ui-font-weight-control);
  }

  :root[data-ui-adapter-mode='shadcn']
    .status-pane
    .status-pane-items-section:first-child
    button.btn:hover {
    border-color: var(--glasklar-ui-accent-strong);
    background: var(--glasklar-ui-accent-strong);
    color: var(--glasklar-ui-text-on-accent);
  }

  :root[data-ui-adapter-mode='shadcn']
    .status-pane
    .status-pane-items-section:first-child
    button.btn
    .fa-icon {
    color: var(--glasklar-ui-text-on-accent);
  }

  :root[data-ui-adapter-mode='shadcn'] .status-pane button.btn:focus-visible,
  :root[data-ui-adapter-mode='shadcn']
    .status-pane
    .input-element.select:focus-within {
    outline: 0;
    box-shadow: 0 0 0 3px var(--glasklar-ui-focus-ring);
  }

  /* Mini-pagination — segmented ghost group: same neutral surface,
     thin shared borders, current page label sits between two arrow
     icon buttons. Drop the legacy outer border ring. */
  :root[data-ui-adapter-mode='shadcn'] .mini-pagination {
    border: 1px solid var(--glasklar-ui-border);
    border-radius: var(--glasklar-ui-radius);
    background: var(--glasklar-ui-surface);
    overflow: hidden;
  }

  :root[data-ui-adapter-mode='shadcn'] .mini-pagination > * {
    min-height: 1.625rem;
    height: 1.625rem;
    border-radius: 0 !important;
    border: 0 !important;
    border-right: 1px solid var(--glasklar-ui-border) !important;
    background: transparent;
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-button);
    font-weight: var(--glasklar-ui-font-weight-control);
    padding: 0 0.5rem;
  }

  :root[data-ui-adapter-mode='shadcn'] .mini-pagination > :last-child {
    border-right: 0 !important;
  }

  :root[data-ui-adapter-mode='shadcn'] .mini-pagination > *:hover {
    background: var(--glasklar-ui-hover);
    color: var(--glasklar-ui-text);
  }

  :root[data-ui-adapter-mode='shadcn'] .mini-pagination > *:focus-visible {
    outline: 0;
    box-shadow: inset 0 0 0 2px var(--glasklar-ui-focus-ring);
  }

  /* === 10. schema / database overview ================================ */

  :root[data-ui-adapter-mode='shadcn'] .schema-list-wrapper {
    max-width: var(--max-layout-width-console-pages);
  }

  :root[data-ui-adapter-mode='shadcn'] .schema-list-wrapper .container {
    gap: 1.25rem;
  }

  /* Filter bar as a clean card, but lighter than the legacy heavy
     panel — borrow Card shadow-sm, no inner background tint. */
  :root[data-ui-adapter-mode='shadcn'] .schema-list-wrapper .actions-container {
    gap: 0.75rem;
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--glasklar-ui-border);
    border-radius: var(--glasklar-ui-radius-lg);
    background: var(--glasklar-ui-surface);
    box-shadow: var(--glasklar-ui-shadow-sm);
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-list-wrapper
    .actions-container
    > *
    + * {
    margin-left: 0;
  }

  :root[data-ui-adapter-mode='shadcn'] .schema-list-wrapper .search-container {
    min-width: 14rem;
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-list-wrapper
    .search-container
    .input-element,
  :root[data-ui-adapter-mode='shadcn']
    .schema-list-wrapper
    .search-container
    input {
    min-height: 2rem;
    border-color: var(--glasklar-ui-border);
    border-radius: var(--glasklar-ui-radius);
    background: var(--glasklar-ui-surface-input);
    color: var(--glasklar-ui-text);
    font-size: var(--glasklar-ui-font-size-table);
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-list-wrapper
    .search-container
    .input-element:focus-within {
    border-color: var(--glasklar-ui-accent);
    box-shadow: 0 0 0 3px var(--glasklar-ui-focus-ring);
  }

  /* SchemasSection.svelte's scoped CSS sets .schema-list to flex column
     at higher specificity. Bump our selector via .app-layout + ul tag so
     the grid layout wins without resorting to !important. */
  .app-layout[data-ui-adapter-mode='shadcn']
    .schema-list-wrapper
    ul.schema-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
    gap: 0.75rem;
    margin-top: 0;
  }

  :root[data-ui-adapter-mode='shadcn'] .schema-list-wrapper .schema-list-item {
    min-width: 0;
  }

  :root[data-ui-adapter-mode='shadcn'] .schema-row {
    min-height: 6.5rem;
    padding: 0.875rem 1rem;
    border-color: var(--glasklar-ui-border);
    border-radius: var(--glasklar-ui-radius-lg);
    background: var(--glasklar-ui-surface);
    box-shadow: var(--glasklar-ui-shadow-sm);
  }

  :root[data-ui-adapter-mode='shadcn'] .schema-row.hover {
    border-color: var(--glasklar-ui-border-strong);
    background: var(--glasklar-ui-hover);
    box-shadow: var(--glasklar-ui-shadow-sm);
  }

  :root[data-ui-adapter-mode='shadcn'] .schema-row.focus,
  :root[data-ui-adapter-mode='shadcn'] .schema-row:active {
    outline: 0;
    border-color: var(--glasklar-ui-accent);
    background: var(--glasklar-ui-surface);
    box-shadow: 0 0 0 3px var(--glasklar-ui-focus-ring);
  }

  :root[data-ui-adapter-mode='shadcn'] .schema-row .content-header {
    gap: 0.625rem;
  }

  :root[data-ui-adapter-mode='shadcn'] .schema-row .icon-container {
    width: 2rem;
    height: 2rem;
    border: 1px solid var(--glasklar-ui-border);
    border-radius: var(--glasklar-ui-radius);
    background: var(--glasklar-ui-surface-muted);
    color: var(--glasklar-ui-text-muted);
  }

  :root[data-ui-adapter-mode='shadcn'] .schema-row .name {
    color: var(--glasklar-ui-text);
    font-size: 0.95rem;
    font-weight: var(--glasklar-ui-font-weight-header);
    line-height: 1.25;
  }

  :root[data-ui-adapter-mode='shadcn'] .schema-row .table-count {
    gap: 0.3rem;
    margin-right: 0.25rem;
    color: var(--glasklar-ui-text-muted);
    font-size: var(--glasklar-ui-font-size-label);
  }

  :root[data-ui-adapter-mode='shadcn'] .schema-row .description {
    margin-top: 0.625rem;
    color: var(--glasklar-ui-text-muted);
    font-size: var(--glasklar-ui-font-size-label);
    line-height: 1.4;
  }

  :root[data-ui-adapter-mode='shadcn'] .schema-row .description-placeholder {
    min-height: 1.25rem;
  }

  :root[data-ui-adapter-mode='shadcn'] .schema-row .menu-trigger .btn {
    border-radius: var(--glasklar-ui-radius);
    font-size: var(--glasklar-ui-font-size-button);
    background: transparent;
    border-color: transparent;
    color: var(--glasklar-ui-text-muted);
  }

  :root[data-ui-adapter-mode='shadcn'] .schema-row .menu-trigger .btn:hover {
    background: var(--glasklar-ui-hover);
    color: var(--glasklar-ui-text);
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-list-wrapper
    .actions-container
    .btn[appearance='primary'],
  :root[data-ui-adapter-mode='shadcn']
    .schema-list-wrapper
    .actions-container
    .btn.btn-primary {
    border-color: var(--glasklar-ui-accent-strong);
    background: var(--glasklar-ui-accent);
    color: var(--glasklar-ui-text-on-accent);
    border-radius: var(--glasklar-ui-radius);
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-list-wrapper
    .actions-container
    .btn[appearance='primary']:hover,
  :root[data-ui-adapter-mode='shadcn']
    .schema-list-wrapper
    .actions-container
    .btn.btn-primary:hover {
    background: var(--glasklar-ui-accent-strong);
  }

  @media (max-width: 44rem) {
    :root[data-ui-adapter-mode='shadcn']
      .schema-list-wrapper
      .actions-container {
      align-items: stretch;
      flex-direction: column;
    }

    :root[data-ui-adapter-mode='shadcn']
      .schema-list-wrapper
      .search-container {
      width: 100%;
    }
  }

  /* === 11. SchemaOverview tables list ================================ */

  /* The single-schema overview uses EntityListItem, whose primary rows are
     intentionally large in legacy mode. In shadcn mode this should read as a
     compact data list. */
  :root[data-ui-adapter-mode='shadcn'] .schema-overview .tables-list {
    border: 1px solid var(--glasklar-ui-border);
    border-radius: var(--glasklar-ui-radius-lg);
    background: var(--glasklar-ui-surface);
    overflow: hidden;
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-overview
    .tables-list
    .entity-list-item.primary {
    min-height: 2.75rem;
    border: 0;
    border-bottom: 1px solid var(--glasklar-ui-border);
    border-radius: 0;
    background: var(--glasklar-ui-surface);
    font-size: var(--glasklar-ui-font-size-table);
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-overview
    .tables-list
    .entity-list-item.primary:last-child {
    border-bottom: 0;
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-overview
    .tables-list
    .entity-list-item:has(.link:hover) {
    background: var(--glasklar-ui-hover);
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-overview
    .tables-list
    .entity-list-item:has(.link:hover)::before {
    border-left-color: var(--glasklar-ui-accent-border);
    border-left-width: 2px;
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-overview
    .tables-list
    .entity-list-item.primary
    .link {
    min-height: 2.75rem;
    padding: 0.35rem 0.75rem;
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-overview
    .tables-list
    .entity-list-item
    .top {
    gap: 0.45rem;
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-overview
    .tables-list
    .entity-list-item.primary
    .name {
    align-items: center;
    color: var(--glasklar-ui-text);
    font-size: 1rem;
    font-weight: var(--glasklar-ui-font-weight-control);
    line-height: 1.35;
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-overview
    .tables-list
    .entity-list-item
    .name
    .icon {
    color: var(--glasklar-ui-text-muted);
    opacity: 0.55;
    font-size: 0.95rem;
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-overview
    .tables-list
    .entity-list-item
    .actions {
    gap: 0.45rem;
    padding: 0.35rem 0.5rem;
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-overview
    .tables-list
    .entity-list-item
    .action-button {
    min-height: 1.85rem;
    padding: 0 0.55rem;
    border-radius: var(--glasklar-ui-radius);
    font-size: var(--glasklar-ui-font-size-button);
    font-weight: var(--glasklar-ui-font-weight-control);
    line-height: var(--glasklar-ui-line-height-control);
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-overview
    .tables-list
    .entity-list-item
    .menu-container
    .dropdown-menu-button {
    min-width: 1.85rem;
    min-height: 1.85rem;
    border-radius: var(--glasklar-ui-radius);
  }

  :root[data-ui-adapter-mode='shadcn']
    .schema-overview
    .sidebar
    :global(.title),
  :root[data-ui-adapter-mode='shadcn'] .schema-overview .tables :global(h2) {
    font-size: 0.95rem;
    font-weight: var(--glasklar-ui-font-weight-header);
    margin: 0;
  }

  :root[data-ui-adapter-mode='shadcn'] .tutorial {
    border-color: var(--glasklar-ui-border);
    background: var(--glasklar-ui-surface) !important;
    box-shadow: var(--glasklar-ui-shadow-sm);
  }

  :root[data-ui-adapter-mode='shadcn'] .tutorial .title {
    color: var(--glasklar-ui-text);
    font-size: 0.95rem;
    font-weight: var(--glasklar-ui-font-weight-header);
    letter-spacing: 0;
  }

  :root[data-ui-adapter-mode='shadcn'] .tutorial .body {
    color: var(--glasklar-ui-text-muted);
    font-size: var(--glasklar-ui-font-size-label);
  }

  /* === 12. Table style variants =======================================
     Each variant rewires the sheet's grid/zebra/density tokens. They are
     scoped under shadcn mode so legacy is untouched. Selector targets
     :root because data-table-style mirrors to <html> in LayoutWithHeader. */

  /* default — already styled above (subtle full grid). */

  /* borderless: no grid lines, neutral cells, hover only */
  :root[data-ui-adapter-mode='shadcn'][data-table-style='borderless']
    .table-view {
    --cell-border-horizontal: 1px solid transparent;
    --cell-border-vertical: 1px solid transparent;
  }
  :root[data-ui-adapter-mode='shadcn'][data-table-style='borderless'] .sheet {
    border-color: transparent;
    box-shadow: none;
  }
  :root[data-ui-adapter-mode='shadcn'][data-table-style='borderless']
    [data-sheet-element='header-row'] {
    border-bottom: 0;
    background: var(--glasklar-ui-header-glass);
  }
  :root[data-ui-adapter-mode='shadcn'][data-table-style='borderless']
    [data-sheet-element='column-header-cell'] {
    border-right-color: transparent;
  }

  /* horizontal: rows have bottom borders, columns don't */
  :root[data-ui-adapter-mode='shadcn'][data-table-style='horizontal']
    .table-view {
    --cell-border-horizontal: 1px solid var(--glasklar-ui-grid-border);
    --cell-border-vertical: 1px solid transparent;
  }
  :root[data-ui-adapter-mode='shadcn'][data-table-style='horizontal']
    [data-sheet-element='column-header-cell'] {
    border-right-color: transparent;
  }

  /* vertical: columns have side borders, rows don't */
  :root[data-ui-adapter-mode='shadcn'][data-table-style='vertical']
    .table-view {
    --cell-border-horizontal: 1px solid transparent;
    --cell-border-vertical: 1px solid var(--glasklar-ui-grid-border);
  }

  /* grid: strong full grid */
  :root[data-ui-adapter-mode='shadcn'][data-table-style='grid'] .table-view {
    --cell-border-horizontal: 1px solid var(--glasklar-ui-border);
    --cell-border-vertical: 1px solid var(--glasklar-ui-border);
  }

  /* zebra (no borders, alternating rows)
     Use data-row-parity, not nth-child. The table body is virtualized, so
     nth-child would stripe the currently rendered DOM window, not stable
     record rows, and the stripe state would visibly jump during scroll. */
  :root[data-ui-adapter-mode='shadcn'][data-table-style='zebra'] .table-view,
  :root[data-ui-adapter-mode='shadcn'][data-table-style='zebra-h'] .table-view,
  :root[data-ui-adapter-mode='shadcn'][data-table-style='zebra-grid']
    .table-view {
    --cell-bg-color-row-even: var(--glasklar-ui-zebra-tint);
  }
  :root[data-ui-adapter-mode='shadcn'][data-table-style='zebra']
    [data-sheet-element='data-row'][data-row-parity='even']
    [data-sheet-element='data-cell']:not([data-cell-active]):not(
      [data-cell-selected]
    ),
  :root[data-ui-adapter-mode='shadcn'][data-table-style='zebra-h']
    [data-sheet-element='data-row'][data-row-parity='even']
    [data-sheet-element='data-cell']:not([data-cell-active]):not(
      [data-cell-selected]
    ),
  :root[data-ui-adapter-mode='shadcn'][data-table-style='zebra-grid']
    [data-sheet-element='data-row'][data-row-parity='even']
    [data-sheet-element='data-cell']:not([data-cell-active]):not(
      [data-cell-selected]
    ) {
    background: var(--glasklar-ui-zebra-tint);
  }
  :root[data-ui-adapter-mode='shadcn'][data-table-style='zebra'] .table-view {
    --cell-border-horizontal: 1px solid transparent;
    --cell-border-vertical: 1px solid transparent;
  }
  :root[data-ui-adapter-mode='shadcn'][data-table-style='zebra-h'] .table-view {
    --cell-border-horizontal: 1px solid var(--glasklar-ui-grid-border);
    --cell-border-vertical: 1px solid transparent;
  }
  :root[data-ui-adapter-mode='shadcn'][data-table-style='zebra-grid']
    .table-view {
    --cell-border-horizontal: 1px solid var(--glasklar-ui-grid-border);
    --cell-border-vertical: 1px solid var(--glasklar-ui-grid-border);
  }

  /* === 13. DARK MODE shadcn ============================================
     User flips theme via Mathesar's body.theme-dark class. Inside shadcn
     mode we want a real shadcn dark palette (cool near-black canvas,
     near-white foreground, the same neutral interaction states) rather
     than letting Mathesar's warm-grey dark theme leak through.

     Specificity: :root[data-ui-adapter-mode='shadcn'] body.theme-dark
     = (0,3,1), so it beats the light-tokens block (0,2,1). */

  :root[data-ui-adapter-mode='shadcn'] body.theme-dark {
    /* surfaces */
    --color-bg-base: hsl(240 10% 4%);
    --color-bg-raised-1: hsl(240 6% 8%);
    --color-bg-raised-2: hsl(240 6% 10%);
    --color-bg-raised-3: hsl(240 6% 11%);
    --color-bg-sunken-1: hsl(240 6% 6%);
    --color-bg-input: hsl(240 6% 10%);
    --color-bg-control: hsl(240 6% 10%);
    --color-bg-control-hover: hsl(240 6% 14%);
    --color-bg-control-active: hsl(240 6% 18%);
    --color-bg-deep: hsl(240 10% 4%);
    --color-bg-token: hsl(240 6% 14%);
    --color-bg-group: hsl(240 6% 8%);
    --color-bg-filled-input: hsl(240 6% 10%);
    --color-bg-header: hsl(240 6% 10%);
    --color-bg-supporting: hsl(240 6% 11%);
    --color-bg-highlight: hsl(54 80% 60%);
    --color-bg-highlight-subtle: hsl(54 30% 20%);
    --card-background: hsl(240 6% 10%);
    --card-border-color: hsl(240 5% 18%);
    --color-modal-overlay: rgba(0, 0, 0, 0.6);
    --color-loading-overlay: rgba(0, 0, 0, 0.5);

    /* text */
    --color-fg-base: hsl(0 0% 98%);
    --color-fg-subtle-1: hsl(240 5% 65%);
    --color-fg-subtle-2: hsl(240 5% 50%);
    --color-fg-faint: hsl(240 5% 58%);
    --color-fg-light: hsl(0 0% 98%);
    --color-fg-control: hsl(0 0% 98%);
    --color-fg-inverted: hsl(240 10% 6%);
    --color-fg-help: hsl(240 5% 65%);
    --color-fg-icon: hsl(240 5% 65%);
    --color-fg-navigation: hsl(0 0% 98%);

    /* borders */
    --color-border-base: hsl(240 5% 18%);
    --color-border-control: hsl(240 5% 20%);
    --color-border-control-hover: hsl(240 5% 30%);
    --color-border-control-active: hsl(240 5% 38%);
    --color-border-control-focused: hsl(240 5% 58%);
    --color-border-grid: hsl(240 5% 14%);
    --color-border-header: hsl(240 5% 18%);

    /* action-primary in dark: white-on-black inverted */
    --color-action-primary: hsl(0 0% 98%);
    --color-action-primary-5: hsl(240 6% 12%);
    --color-action-primary-10: hsl(240 6% 14%);
    --color-action-primary-15: hsl(240 6% 18%);
    --color-action-primary-20: hsl(240 6% 22%);
    --color-action-primary-25: hsl(240 6% 28%);
    --color-action-primary-40: hsl(240 6% 40%);
    --color-action-primary-60: hsl(240 5% 70%);
    --color-action-primary-80: hsl(0 0% 92%);
    --color-action-primary-hover: hsl(0 0% 92%);
    --color-action-primary-active: hsl(0 0% 85%);
    --color-action-primary-focused: hsl(0 0% 92%);
    --color-action-primary-80-hover: hsl(0 0% 88%);
    --color-action-primary-80-active: hsl(0 0% 80%);
    --color-action-primary-80-focused: hsl(0 0% 88%);
    --color-action-primary-40-active: hsl(240 5% 50%);

    --color-action-secondary: hsl(240 6% 14%);
    --color-action-secondary-5: hsl(240 6% 10%);
    --color-action-secondary-10: hsl(240 6% 12%);
    --color-action-secondary-20: hsl(240 6% 16%);
    --color-action-secondary-25: hsl(240 6% 22%);
    --color-action-secondary-40: hsl(240 6% 32%);
    --color-action-secondary-60: hsl(240 6% 50%);
    --color-action-secondary-80: hsl(240 5% 72%);
    --color-action-secondary-20-hover: hsl(240 6% 22%);
    --color-action-secondary-25-active: hsl(240 6% 28%);
    --color-action-secondary-40-active: hsl(240 6% 38%);

    /* selection */
    --color-selection-strong-1: hsl(0 0% 92%);
    --color-selection-strong-2: hsl(0 0% 88%);
    --color-selection-subtle-1: hsl(240 6% 22%);

    /* contextual surfaces neutralized */
    --color-bg-tip: hsl(240 6% 14%);
    --color-bg-tip-hover: hsl(240 6% 18%);
    --color-bg-tip-active: hsl(240 6% 22%);
    --color-bg-outcome: hsl(240 6% 14%);
    --color-bg-outcome-hover: hsl(240 6% 18%);
    --color-bg-outcome-active: hsl(240 6% 22%);
    --color-border-tip: hsl(240 5% 22%);
    --color-border-tip-hover: hsl(240 5% 30%);
    --color-border-tip-active: hsl(240 5% 38%);
    --color-fg-tip: hsl(0 0% 96%);
    --color-fg-tip-hover: hsl(0 0% 100%);
    --color-fg-tip-active: hsl(0 0% 100%);
    --color-fg-outcome: hsl(0 0% 96%);
    --color-fg-outcome-hover: hsl(0 0% 100%);
    --color-fg-outcome-active: hsl(0 0% 100%);
    --color-border-outcome: hsl(240 5% 22%);
    --color-border-outcome-active: hsl(240 5% 38%);
    --color-border-outcome-focused: hsl(240 5% 60%);

    /* utility-color neutralization (schema/table/database/etc) */
    --color-schema: hsl(0 0% 92%);
    --color-schema-80: hsl(240 6% 18%);
    --color-schema-60: hsl(240 6% 24%);
    --color-schema-40: hsl(240 6% 32%);
    --color-schema-20: hsl(240 6% 14%);
    --color-schema-10: hsl(240 6% 10%);
    --color-schema-5: hsl(240 6% 8%);
    --color-schema-5-active: hsl(240 6% 12%);
    --color-schema-10-active: hsl(240 6% 14%);
    --color-table: hsl(0 0% 92%);
    --color-table-80: hsl(240 6% 18%);
    --color-table-60: hsl(240 6% 24%);
    --color-table-40: hsl(240 6% 32%);
    --color-table-20: hsl(240 6% 14%);
    --color-table-10: hsl(240 6% 10%);
    --color-table-5: hsl(240 6% 8%);
    --color-database: hsl(0 0% 96%);
    --color-database-80: hsl(240 6% 18%);
    --color-database-60: hsl(240 6% 24%);
    --color-database-40: hsl(240 6% 32%);
    --color-database-20: hsl(240 6% 14%);
    --color-database-10: hsl(240 6% 10%);
    --color-database-5: hsl(240 6% 8%);
    --color-view: hsl(0 0% 92%);
    --color-view-80: hsl(240 6% 18%);
    --color-view-40: hsl(240 6% 32%);
    --color-view-20: hsl(240 6% 14%);
    --color-column: hsl(0 0% 92%);
    --color-column-80: hsl(240 6% 18%);
    --color-column-40: hsl(240 6% 32%);
    --color-record: hsl(0 0% 92%);
    --color-record-80: hsl(240 6% 18%);
    --color-record-fk: hsl(0 0% 92%);
    --color-exploration: hsl(0 0% 92%);
    --color-exploration-80: hsl(240 6% 18%);
    --color-data-form: hsl(0 0% 92%);
    --color-data-form-80: hsl(240 6% 18%);

    /* brand */
    --color-brand: hsl(0 0% 92%);
    --color-brand-subtle: hsl(240 5% 65%);

    /* links neutral */
    --color-link: var(--color-fg-base);
    --color-link-hover: var(--color-fg-base);
    --color-link-active: var(--color-fg-base);
    --color-fg-link: var(--color-fg-base);
    --color-fg-link-hover: var(--color-fg-base);
    --color-fg-link-active: var(--color-fg-base);

    /* shadow + icon */
    --color-shadow: hsl(0 0% 0% / 0.7);
    --icon-fill-color: hsl(240 6% 18%);
    --icon-stroke-color: hsl(0 0% 96%);

    /* glasklar aliases recomputed against dark surface */
    --glasklar-ui-zebra-tint: hsl(240 6% 7%);
    --glasklar-ui-text-on-accent: var(--color-fg-inverted);
  }

  h1 {
    margin: 0 0 1.5rem 0;
    font-size: var(--lg4);
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  h2 {
    font-size: var(--lg3);
    font-weight: 600;
    margin: 0 0 1rem 0;
    line-height: 1.3;
    letter-spacing: -0.015em;
  }

  h3 {
    font-size: var(--lg2);
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    line-height: 1.4;
  }

  h4 {
    font-size: var(--size-medium);
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
  }

  p {
    margin: 0 0 1rem 0;
  }

  hr {
    margin: 0;
    border: 0;
    border-top: 1px solid var(--color-border-section);
    display: block;
  }

  a {
    color: var(--color-fg-link);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.1em;
  }

  code {
    font-family: var(--font-family-mono);
    font-size: 85%;
    background: var(--color-bg-input);
    padding: 0.2em 0.3em;
    border-radius: 0.2em;
    color: var(--color-fg-base);
  }

  ul {
    margin: 0;
  }

  .block {
    display: block;
  }

  /**
   * Used to turn elements like `<button>` and `<a>` into plain elements that
   * don't have any browser styling but still have functionality.
   */
  .passthrough {
    background: none;
    border-radius: 0;
    border: none;
    color: inherit;
    cursor: inherit;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    text-align: inherit;
    text-decoration: inherit;
    margin: 0;
    padding: 0;
  }

  .postgres-keyword {
    font-size: 80%;
    padding: 0.02em 0.3em;
    background: var(--color-bg-base);
    border-radius: 3px;
    color: var(--color-fg-subtle-2);
    font-weight: bold;
  }

  // TODO: remove this block when implementing
  // https://github.com/mathesar-foundation/mathesar/issues/4558
  .input:not(:has(.token)) .null .postgres-keyword,
  .cell-wrapper:not(:has(.token)) .postgres-keyword {
    color: var(--color-fg-faint);
    font-weight: 300;
    background: transparent;
  }

  .bold-header {
    font-weight: 500;
  }

  .app-loader {
    width: 100svw;
    height: 100svh;
    align-items: center;
    justify-content: center;
    display: flex;
    background-color: var(--color-bg-base);
  }
</style>
