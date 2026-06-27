# Helpjuice H1 Editor Challenge

A focused Helpjuice frontend challenge prototype built with Next.js. The app recreates the six-screen Figma flow for turning an empty paragraph into an H1 through a Notion-style `/1` command.

## Product Behavior

- The editor starts with visual Helpjuice-like page chrome, a metadata toolbar, a title, description, and an empty paragraph placeholder.
- Typing `/` opens the Add blocks menu.
- Typing `1` keeps the menu open, shows `/1` in the block, and displays `Filtering keyword 1`.
- `Heading 1` is selected by default.
- Clicking `Heading 1` or pressing Enter converts the current paragraph into an H1, removes `/1`, and keeps focus in the heading.
- Pressing Enter after typing the heading creates and focuses a normal paragraph below.
- Pressing Enter in a normal paragraph creates and focuses a new paragraph below, so the `/1` flow can repeat indefinitely.
- Clicking blank editor space below the content creates or focuses the trailing paragraph, matching Notion's click-to-continue writing UX.
- Unsupported slash queries stay as paragraph text and do not convert on Enter.
- ArrowUp and ArrowDown move the selected slash-menu command.
- `Expandable Heading 1` converts into an expandable H1 block; collapsing it hides the paragraph body below it until the next heading.
- Existing block drag handles reorder visible blocks with drag-and-drop.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn-style base setup
- `@dnd-kit/core` for block drag-and-drop
- Vitest and React Testing Library
- Playwright

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:watch
npm run test:e2e
npm run build
```

## Architecture

The App Router route stays thin:

- `src/app/(editor)/page.tsx` renders the editor at `/` without changing the public URL.
- `src/app/(editor)/_components`, `_hooks`, `_types`, `_constants`, and `_utils` own the route-private editor UI, state, minimal block type, and interaction behavior.
- `src/app/globals.css` contains the contenteditable placeholder reset.

The editor intentionally uses a minimal model:

```ts
type EditorBlock =
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "heading-1"; text: string }
  | {
      id: string;
      type: "expandable-heading-1";
      text: string;
      isExpanded: boolean;
    };
```

There is no full document system, backend, or persistence because the Google Doc only requires the H1 conversion prototype and the initial reviewer experience should match Figma every time.

Additional notes:

- [System design](docs/system-design.md)
- [Design system notes](docs/design-system.md)
- [Final review checklist](docs/final-review.md)

## Testing

Component tests cover:

- Initial editor state.
- `/` opening the menu.
- `1` filtering and highlighted keyword.
- Mouse and Enter selection of Heading 1.
- Removal of `/1` after conversion.
- Focus staying in the H1.
- Heading typing.
- Enter creating and focusing the paragraph below.
- Paragraph Enter creating and focusing the next paragraph.
- Blank editor space creating or focusing the trailing paragraph without duplicate placeholders.
- Escape and outside click closing the menu.
- Native contenteditable input paths for paste and text replacement.
- Unsupported slash queries that should not convert.
- Expandable Heading 1 conversion, disclosure toggling, and paragraph body hide/show behavior.
- Mid-text native edits and long content.
- Re-entering from an H1 without duplicating empty paragraph placeholders.
- Pure block reorder behavior for drag-and-drop.

The Playwright tests cover the complete six-screen H1 flow in Chromium at the Figma reference viewport, repeated H1/paragraph creation, Notion-style click-to-continue editing, a multi-heading menu-position regression, duplicate-empty-paragraph regressions, the expandable heading flow, and drag-handle block reordering.

## Accessibility

- Editable blocks use textbox roles and clear accessible labels.
- The slash menu uses menu/menuitem roles.
- Focus is managed after conversion and after creating the following paragraph.
- Visual-only decorative controls are kept non-disruptive.

## Assumptions And Trade-Offs

- Figma raster screenshots are the visual source of truth.
- `Expandable Heading 1` is intentionally minimal: conversion, focus, paragraph insertion, disclosure toggling, and hiding/showing following paragraph blocks in the flat editor model.
- Drag-and-drop is intentionally flat block reordering only; it does not add a nested document tree.
- Slash-menu keyboard navigation is limited to ArrowUp, ArrowDown, Enter, and Escape.
- Persistence is intentionally omitted to preserve the expected initial reviewer state.

## Deployment

This Next.js app is ready for deployment on Vercel or another Node-compatible host. A deployment URL should be added to submission notes after publishing.
