# Final Review Checklist

## Issues Found

- Unsupported slash queries could still convert to H1 because any slash-prefixed paragraph was treated as an active command.
- The focused breadcrumb crop showed `Main` as emphasized and underlined, while the implementation had it as plain text.
- Documentation did not yet split system architecture and design-token decisions into the requested dedicated docs.
- Tests covered the main flow but initially missed unsupported slash text, expandable behavior, mid-text native editing, or long content.
- Initial slash-menu scrolling pulled the page too far upward and clipped the top of the title in the filtered screenshot state.
- The default popover open animation could be captured mid-transition, making visual QA screenshots look faded.
- The empty contenteditable block produced a browser hydration warning around caret-color mutation.
- Pressing Enter from an H1 that already had an empty paragraph below could create duplicate empty paragraph placeholders.
- Rich HTML pasted or inserted by native contenteditable input could leave styled spans, links, scripts, or inline styles in the editable DOM even though state read `textContent`.
- Expandable heading children used `parentId`, but drag reordering still moved only one flat block, which could orphan children from their expandable heading.
- Slash and block action menu selected states were exposed only with `data-selected`, not semantic ARIA state.
- Documentation still described older `/` and `/1` behavior and flat drag trade-offs after `/1` through `/5` and expandable children were added.

## Issues Fixed

- Limited active slash commands to `/` and `/1`.
- Pressing Enter on unsupported slash text no longer converts the block.
- Restored the breadcrumb emphasis for `Main`.
- Added component coverage for unsupported slash queries, expandable conversion and toggling, expandable paragraph hide/show behavior, native mid-text edits, and long heading/paragraph content.
- Added dedicated system-design and design-system documentation.
- Changed slash-menu scrolling to move only enough to preserve the menu's bottom gutter.
- Removed the popover animation for stable Figma-style screenshots.
- Scoped hydration-warning suppression to the editable node while preserving visible focus/caret behavior.
- Reused an existing empty paragraph below an H1 instead of inserting another empty paragraph.
- Fixed paragraph Enter so users can create another paragraph and repeat the `/1` heading flow indefinitely.
- Added Notion-style click-to-continue behavior on blank editor space without creating duplicate empty paragraphs.
- Added flat block drag-and-drop using the existing drag handles and `@dnd-kit/core`.
- Sanitized paste and rich native input paths back to plain text, removing pasted HTML elements and layout-breaking inline styles from editable blocks while preserving focus and avoiding IME composition rewrites.
- Made expandable heading drag behavior segment-based: a heading moves together with contiguous child blocks, while child-origin and child-target drags are ignored.
- Exposed slash command and block transform selected states with `role="menuitemradio"` and `aria-checked`.
- Added grouped reorder, rich paste/input sanitization, semantic menu state, and mobile WebKit smoke coverage.
- Updated README and system design docs for `/1` through `/5`, expandable `parentId` behavior, plaintext sanitization, and drag invariants.

## Assumptions Made

- The Google Doc defines the functional scope; the Figma screenshots define visual acceptance.
- `Expandable Heading 1` is implemented only for conversion, focus, paragraph insertion, disclosure toggling, and flat following-paragraph hide/show behavior.
- The initial reviewer state should always be clean, so persistence remains omitted.
- The primary visual target is the desktop screenshot viewport.

## Ideas Intentionally Excluded

- Full Notion-style document model.
- Full nested expandable heading child-content behavior beyond the flat `parentId` hide/show behavior.
- Nested drag-and-drop behavior for child blocks.
- Rich text marks or keyboard shortcuts beyond the approved H1 flow.
- Local storage or backend persistence.
- Full command palette behavior beyond the two reviewed heading commands.

## Remaining Limitations

- Only paragraph, Heading 1-4, and Expandable Heading 1 blocks are supported.
- Paragraph Enter behavior outside the required H1 creation path is native contenteditable behavior.
- Drag-and-drop is intentionally top-level only; expandable heading groups move together, and child blocks are not independent drag/drop targets.
- Mobile and tablet are responsive enough for layout integrity, but visual acceptance is based on the supplied desktop screenshots.
- The final description text follows the primary full-page Figma reference ending in `hitting enter.`
