# Helpjuice Editor Challenge

A focused Next.js editor prototype that recreates the Helpjuice/Notion-style `/1` to heading flow from the supplied reference screens.

The project is intentionally scoped: it prioritizes faithful interaction behavior, maintainable route-local architecture, a small real design system, and strong regression coverage over building a full document editor.

## What This Implements

- Helpjuice-like page chrome with breadcrumb navigation, metadata toolbar, title, description, editor canvas, and help control.
- Native `contentEditable` paragraph editing with an initial active placeholder.
- Slash menu opened by `/`, filtered by supported numeric commands.
- `Heading 1` creation by typing `/1` and pressing Enter or selecting the menu item.
- Heading text entry followed by Enter to create or focus the next paragraph.
- Repeated heading and paragraph creation without duplicate empty blocks.
- Notion-style blank-space continuation that creates or focuses a trailing paragraph.
- Expandable Heading 1 conversion, disclosure toggling, body hide/show behavior, and continuation after collapse.
- Block action menu for turning blocks into text/heading types and deleting blocks.
- Flat drag-and-drop block reordering with `@dnd-kit/core`.
- Prototype toasts for visual-only page chrome controls.

## Tech Stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS v4, shadcn/Base UI primitives |
| Language | TypeScript |
| Icons | `lucide-react` |
| Drag and drop | `@dnd-kit/core` |
| Unit/component tests | Vitest, React Testing Library |
| Browser tests | Playwright |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Additional development commands:

```bash
npm run test:watch
npm run start
```

## Project Structure

```text
src/app/(editor)/
  page.tsx
  _components/
  _constants/
  _hooks/
  _tests/
  _types/
  _utils/
```

The public route remains `/`. The `(editor)` route group keeps editor implementation details colocated without leaking route-private folders into the URL.

Key files:

- `src/app/(editor)/page.tsx`: thin route entry point.
- `src/app/(editor)/_components/helpjuice-editor.tsx`: page chrome and editor composition.
- `src/app/(editor)/_components/editor-block.tsx`: editable block rendering and side controls.
- `src/app/(editor)/_components/slash-menu.tsx`: slash command popover.
- `src/app/(editor)/_hooks/use-helpjuice-editor.ts`: controller hook that composes editor state, focus, and slash-menu behavior.
- `src/app/(editor)/_hooks/use-editor-blocks.ts`: local block state and intent actions.
- `src/app/(editor)/_hooks/use-editor-focus.ts`: DOM refs, contentEditable synchronization, and focus restoration.
- `src/app/(editor)/_utils/editor-block.utils.ts`: pure block transformation utilities.

## Architecture

The editor uses local React state and a small flat block model. There is no backend, persistence, rich-text mark system, or nested document tree because those are outside the challenge scope.

The supported block types are intentionally narrow:

```ts
type EditorBlock =
  | { id: string; type: "paragraph"; text: string; parentId?: string }
  | {
      id: string;
      type: "heading-1" | "heading-2" | "heading-3" | "heading-4";
      text: string;
      parentId?: string;
    }
  | {
      id: string;
      type: "expandable-heading-1";
      text: string;
      isExpanded: boolean;
      parentId?: string;
    };
```

Design choices:

- Keep behavior route-local and easy to reason about.
- Let the browser handle normal typing, paste, selection, deletion, caret movement, and IME composition.
- Intercept only the editor behaviors that matter: slash commands, Enter, Escape, focus restoration, disclosure toggling, and block actions.
- Keep pure block updates in utilities so edge cases are testable without rendering React.
- Reuse immediate/trailing paragraphs when required to avoid duplicate empty placeholders.

## Design System

This repo includes a small implemented design system, not a large UI library.

- Editor tokens live in `src/app/globals.css`.
- Route-level style helpers live in `src/app/(editor)/_components/editor-style-utils.ts`.
- Slash command rows share `src/app/(editor)/_components/command-menu-item.tsx`.
- Repeated editor surfaces, menu states, icon sizing, focus rings, radii, shadows, and widths use semantic tokens.

See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for the exact tokens and trade-offs.

## Testing Strategy

Tests are split by behavior:

- `editor-heading-flow.test.tsx`: H1 creation, focus, paragraph continuation, repeated usage, block action behavior, and native input paths.
- `editor-expandable-heading-flow.test.tsx`: expandable H1 conversion, focus, disclosure toggling, paragraph body behavior, and repeated usage.
- `slash-menu.test.tsx`: menu opening, filtering, selection, keyboard navigation, mouse selection, and close behavior.
- `editor-block.utils.test.ts`: pure block transformations, paragraph insertion/reuse, slash text clearing, conversion, deletion, reordering, and missing-ID safety.

Playwright covers the full reviewer-facing flow in Chromium at the reference desktop viewport, including screenshots for the key states.

## Accessibility

- Editable blocks expose `role="textbox"` and descriptive labels.
- Slash and block menus use `role="menu"` and `role="menuitem"`.
- Focus is restored after conversion, block creation, disclosure toggling, and deletion.
- Keyboard navigation is supported for the slash menu.
- Decorative icons are hidden from assistive technology.
- Visual-only controls remain labeled and explain themselves through prototype toasts.
- A shared `focus-visible` ring is used for interactive editor chrome.

## Assumptions And Trade-Offs

- The supplied Figma screenshots are treated as the visual source of truth.
- The app is desktop-first because the acceptance references are desktop captures.
- Expandable headings use a flat model: body paragraphs are hidden while collapsed, but this is not a full nested document system.
- Drag-and-drop reorders flat visible blocks only.
- Persistence is omitted so reviewers always land on the expected clean initial state.
- The implementation favors direct, testable code over framework-heavy editor abstractions.

## Documentation

- [System design](docs/system-design.md)
- [Design system](DESIGN_SYSTEM.md)
- [Final review checklist](docs/final-review.md)

## Deployment

The app can be deployed to Vercel or any Node-compatible host that supports Next.js. Run `npm run build` before publishing.
