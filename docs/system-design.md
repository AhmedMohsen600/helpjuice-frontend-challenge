# System Design

## Goal

Build the smallest reliable Helpjuice editor prototype that matches the supplied six-screen H1 flow. The public route remains `/`; the implementation is route-colocated under `src/app/(editor)`.

## Architecture

- `src/app/(editor)/page.tsx` is a thin Server Component that renders `HelpjuiceEditor`.
- `src/app/(editor)/_components` contains visual route-private UI:
  - `HelpjuiceEditor` composes the page chrome and editor surface.
  - `EditorBlock` renders the contenteditable paragraph or H1 block.
  - `SlashMenu` renders the shadcn popover command menu.
  - `DndContext` from `@dnd-kit/core` wraps the visible block list for flat drag-and-drop reordering.
- `src/app/(editor)/_hooks/use-helpjuice-editor.ts` is now a small controller hook that composes focused route-local hooks and exposes the component view model.
- `use-editor-blocks.ts` owns editor-domain state and intent actions.
- `use-editor-focus.ts` owns DOM refs, contenteditable synchronization, initial focus, and caret placement.
- `use-slash-menu.ts` owns slash-menu visibility, query derivation, outside-click closing, and viewport positioning.
- `_constants`, `_types`, and `_utils` hold route-local constants, the minimal block type, pure block transformations, caret placement, and block ID creation.

## State Model

The editor uses local React state only:

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

This is enough for the challenge flow: one starting paragraph, conversion to H1, a following paragraph, and flat visible-block reordering. There is no persistence, backend, rich-text mark model, or document tree because those are outside the Google Doc scope.

## State Ownership Decision

The editor uses `useState` inside `useEditorBlocks`. A reducer was removed because the supported editor behavior is small and direct: update text, clear slash text, convert a paragraph to H1 or expandable H1, toggle one expandable heading, and insert or reuse one following paragraph. Paragraph Enter uses the same insertion operation so the `/1` flow can repeat. Reducer actions and transient reducer outputs added indirection without improving this challenge.

- React state: `blocks` and `activeBlockId`.
- Refs: the DOM block map, pending focus target, and pending DOM sync IDs live in `useEditorFocus`.
- Derived values: `activeBlock`, slash-menu open state, and slash query are derived rather than duplicated in state. The selected slash command is local menu state because ArrowUp/ArrowDown changes it independently from the typed query.
- Removed state: `emptyParagraphAfterHeadingRefs` is no longer needed. Paragraph reuse is derived from the block list by checking whether the immediate next block is already a paragraph.
- External state libraries are not used; the state is local to the editor route.

## Interaction Decisions

- The slash menu opens only for supported command text: `/` and `/1`.
- `/1` displays the highlighted filtering keyword and keeps `Heading 1` selected.
- Pressing Enter on `/` or `/1` converts the active paragraph to the selected empty focused heading command.
- Unsupported slash queries are left as paragraph text and do not convert on Enter.
- Pressing Enter in a normal paragraph inserts and focuses a new paragraph immediately below it.
- Clicking blank editor space creates or focuses a trailing paragraph, reusing an existing empty trailing paragraph to avoid duplicate placeholders.
- ArrowUp and ArrowDown move between `Heading 1` and `Expandable Heading 1`.
- `Expandable Heading 1` converts into an expandable H1 block with a disclosure toggle. Collapsing it hides following paragraph blocks until the next heading while keeping the expandable heading title visible.
- Drag handles use `@dnd-kit/core` pointer dragging to move the active block to the target block's position.
- Normal typing, paste, text selection, text replacement, deletion, caret movement, mobile keyboard input, and IME composition are left to native `contentEditable` behavior. The hook intercepts only Enter, Escape, conversion, and focus restoration.

## Focus And Refs

Block DOM nodes are stored in a `Map<string, HTMLElement>` ref for average `O(1)` lookup. After conversion or paragraph creation, the controller requests focus through `useEditorFocus`; a layout effect resolves the pending ref after React renders and places the caret at the end of the target editable node.

The focus hook synchronizes DOM text for programmatic editor changes such as clearing slash text and converting a paragraph to an H1, and when a previously hidden block remounts after an expandable heading is reopened. Native typing, paste, replacement, and deletion are left to the browser, so ordinary input does not trigger an all-block DOM synchronization pass.

## Complexity

- Block updates are a single immutable `O(n)` map or slice over the small local block list.
- Paragraph insertion finds the source block once. Headings reuse an immediate paragraph when present; paragraphs always insert a new paragraph below so repeated heading/paragraph creation keeps moving forward.
- Trailing paragraph continuation checks the last block once and reuses it when it is already an empty paragraph.
- Drag reordering finds the active and target block once, then moves the active block with a single immutable array splice.
- Ref registration and lookup are average `O(1)`.
- Slash matching and command navigation are constant time because the challenge supports only `/`, `/1`, and two commands.
- No global state library or memoization layer is added; the code is intentionally direct.

## Reliability

- Missing refs are treated as no-ops.
- Unknown block IDs leave state unchanged.
- Duplicate IDs are avoided by route-local ID generation for new paragraphs.
- The slash popover uses shadcn/Base UI positioning to avoid viewport clipping after several blocks.
- The route group and private folders follow Next App Router conventions and do not affect the public URL.
- `DndContext` uses a stable id to avoid server/client hydration mismatches from generated accessibility ids.

## Known Limitations

- Only paragraph, H1, and expandable H1 blocks exist.
- Pressing Enter in a paragraph that is not a supported slash command falls back to native contenteditable behavior.
- Expandable headings support a flat disclosure behavior for following paragraph blocks, but no nested child-content model is implemented.
- Drag-and-drop reorders flat blocks only; collapsed hidden paragraph children are not exposed as drop targets while hidden.
- Mobile/tablet layout receives responsive width constraints, but the primary visual acceptance target is the supplied desktop screenshot viewport.
