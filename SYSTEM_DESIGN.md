# System Design Decision

The editor stays route-colocated under `src/app/(editor)` and continues to render at `/`.

## Simplified State Model

- `blocks` and `activeBlockId` live in `useEditorBlocks` as local React `useState`.
- `activeBlock` is derived from `blocks` and `activeBlockId`.
- Slash-menu visibility and slash query are derived from the active paragraph text; selected command lives in `useSlashMenu` because ArrowUp/ArrowDown can change it while the text stays `/1`.
- DOM block elements live in `useEditorFocus` as a `Map<string, HTMLElement>` ref.
- Pending focus and DOM sync requests are refs, not React state, because they do not render UI.

## Why `useReducer` Was Removed

The challenge only needs a small local block list and a few direct transitions. A reducer made the code look more formal, but it added action files, transient reducer outputs, and indirection without making this small editor easier to understand.

`useState` is sufficient because each operation is simple:

- Text update: update one block.
- Slash clear: clear one paragraph.
- Conversion: turn one paragraph into an empty H1 or expandable H1.
- Expandable toggle: flip the disclosure state on one expandable heading.
- Enter from a heading: reuse the immediate paragraph below, or insert one paragraph.
- Enter from a paragraph: insert one new paragraph immediately after the active paragraph.

No global state library is needed because there is no shared app state, server cache, persistence, or cross-route data.

## Hook Ownership

- `use-editor-blocks.ts`: editor data and block operations.
- `use-editor-focus.ts`: DOM refs, native contenteditable cleanup, requested focus, and caret placement.
- `use-slash-menu.ts`: menu open/query derivation, outside click, and viewport positioning.
- `use-helpjuice-editor.ts`: small controller that wires editor, focus, and menu intents together for the components.

Simplicity is prioritized over patterns. Pure block transformations stay in `_utils/editor-block.utils.ts` where they are easy to test without React or DOM APIs.
