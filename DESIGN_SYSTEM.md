# Helpjuice Editor Design System

## Scope

This is a small editor-specific design system for the challenge UI. It is not a general component library.

The source of truth is the implementation:

- Tokens live in `src/app/globals.css`.
- Light/dark theme state is provided by `src/components/theme-provider.tsx`.
- Editor-specific reusable classes live in `src/app/(editor)/_components/editor-style-utils.ts`.
- The shared slash command row lives in `src/app/(editor)/_components/command-menu-item.tsx`.

## Screenshot-Derived Assumptions

The values come from the supplied desktop screenshots and focused crops, not from inspectable Figma tokens. The UI is desktop-first because the acceptance screenshots and Playwright viewport are desktop captures.

Measured layout values that are specific to this one screen, such as header height, toolbar height, editor vertical gaps, and individual icon offsets, remain inline in the components. They are not documented as reusable spacing tokens.

## Theme Support

The app defaults to light mode to preserve the supplied reference screenshots. A header icon button toggles an opt-in dark mode with a Notion-like dark canvas.

Theme switching uses `next-themes` with a `class` attribute on the root element. Editor colors are not duplicated in components; `.dark` overrides the same `--editor-*` tokens in `src/app/globals.css`.

## Tokens

The editor token layer is defined in `:root` in `src/app/globals.css`, with dark overrides under `.dark`.

### Surfaces

- `--editor-bg`: page background.
- `--editor-surface`: toolbar, popover, and menu surface.
- `--editor-surface-hover`: hover and drag-over background.
- `--editor-surface-selected`: selected command rows and the help button background.

### Text And Icons

- `--editor-text-primary`: page title and primary menu text.
- `--editor-text-heading`: editable heading blocks and command labels.
- `--editor-text-secondary`: body copy and paragraph blocks.
- `--editor-text-muted`: breadcrumbs, metadata text, and shortcuts.
- `--editor-text-subtle`: secondary labels and low-emphasis controls.
- `--editor-text-placeholder`: empty editor block placeholders and disclosure glyphs.
- `--editor-icon-muted`: add and command icons.
- `--editor-icon-faint`: drag affordances.
- `--editor-icon-strong`: high-emphasis metadata icon.
- `--editor-action-text`: publish/action text.
- `--editor-status-success`: success/status icon color.
- `--editor-badge-bg`: metadata badge background.
- `--editor-badge-text`: metadata badge text.
- `--editor-filter-bg`: slash-menu filter chip background.
- `--editor-filter-text`: slash-menu filter chip text.

### Structure

- `--editor-border`: popover and toolbar borders.
- `--editor-divider`: title and metadata dividers.
- `--editor-focus-ring`: shared keyboard focus ring color.
- `--editor-radius-sm`: side controls and small row affordances.
- `--editor-radius-md`: toolbar and menu rows.
- `--editor-radius-lg`: help button and block action menu.
- `--editor-shadow-toolbar`: metadata toolbar shadow.
- `--editor-shadow-menu`: slash command menu shadow.
- `--editor-shadow-action-menu`: block action menu shadow.
- `--editor-content-width`: centered editor column width.
- `--editor-command-menu-width`: desktop slash menu width.

Every editor token above is used in code.

## Reusable Editor Pieces

`editor-style-utils.ts` exposes only two route-level utilities:

- `editorFocusRingClass`: the shared `focus-visible` ring used by header buttons, metadata toolbar, editor side controls, menu rows, and the help button.
- `editorIconSize`: named Lucide icon size classes for `inline`, `metadata`, `control`, `drag`, `command`, and `help` icons.

`command-menu-item.tsx` renders each slash command row. `Heading 1` and `Expandable Heading 1` use the same component, state styling, icon treatment, and accessibility attributes.

`theme-toggle.tsx` is a route-local icon button that switches between light and dark editor themes.

No global editor component library was added.

## Component States

Interactive editor UI uses consistent states:

- Default: tokenized text, surface, border, and icon colors.
- Hover: subtle `--editor-surface-hover` or low-opacity color change.
- Selected: `--editor-surface-selected` plus `data-selected="true"` where selection matters to tests and accessibility.
- Focus-visible: `editorFocusRingClass`.

There are no disabled editor controls in the current UI, so no disabled token or variant is documented.

## Icon Approach

The editor uses `lucide-react` for UI icons. Decorative icons are marked with `aria-hidden="true"`. There are no Unicode icon substitutes.

Icon sizing is centralized in `editorIconSize`:

- `inline`: small inline metadata glyphs.
- `metadata`: toolbar status glyphs.
- `control`: chevrons, lock, plus, and compact controls.
- `drag`: drag/menu affordances.
- `command`: slash command glyphs.
- `help`: fixed help control.

## Accessibility

The editor keeps the existing accessibility behavior:

- Editable blocks use `role="textbox"` and descriptive `aria-label` values.
- Slash and block menus use `role="menu"` and `role="menuitem"`.
- Command selection is exposed with `data-selected`.
- Visual-only chrome controls keep accessible labels and show prototype toasts.
- The help button, disclosure button, drag handles, and add controls have accessible labels.
- The theme toggle exposes `aria-pressed`, a descriptive label, and a native title tooltip.
- Keyboard focus is visible through the shared focus ring, while contentEditable focus keeps the native caret.

## Trade-Offs

This system intentionally avoids a large token catalog. Typography sizes and most spacing remain inline because they are screenshot measurements for this one editor screen rather than reusable design decisions.

Dark mode is intentionally theme-only: it does not add a Notion sidebar, persistence beyond the browser theme setting, system-theme auto switching, or a broader application theme platform. If another screen is added, promote repeated values into tokens only after they are reused.
