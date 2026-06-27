# Design System Notes

## Source

The visual system is derived from the provided Figma raster screenshots and focused crops. Values are best-effort screenshot measurements rather than inspectable Figma tokens.

## Layout

- Canvas: white page with full-width Helpjuice-style chrome.
- Header height: `80px`.
- Editor column: `956px` desktop width, centered, responsive to `calc(100% - 64px)` below wide desktop.
- Metadata toolbar: `48px` height, subtle border, `6px` radius, soft shadow.
- Main title block sits below the toolbar with a thin divider.
- Editor body starts with a large vertical gap below the description to match the initial and slash-menu states.
- The page grows in normal document flow as blocks are added; modest bottom padding keeps the final block away from the help button, and the slash-menu state temporarily adds enough room for the Figma-height panel to stay below the active line.

## Typography

- Font family: Geist via `next/font/google`, falling back to system sans.
- Page title: `48px`, extra-bold, `1.12` line height, dark navy.
- Description: `19px`, normal, `1.45` line height, muted slate.
- Paragraph block: `19px`, normal, `1.48` line height.
- H1 editor block: `40px`, bold, tight line height.
- Slash menu title: `22px`, bold.
- Slash menu item label: `18px`, bold.
- Slash menu shortcuts: `15px`.

## Color Tokens

- Primary text: `#111722`.
- H1 text: `#1d2635`.
- Body text: `#4b5565`.
- Muted UI text: `#9aa3b1`.
- Breadcrumb text: `#8e98a6`.
- Placeholder text: `#c4cad4`.
- Divider/border: `#e5e9ef`, `#e6eaf0`, `#dfe4eb`.
- Selected menu row: `#f1f3f6`.
- Publish action: `#2f5f9f`.
- Filter highlight: `#2f67b1`.
- Green status/cloud: `#2f9b73`.
- P badge background: `#d8f6e5`; text: `#2c8a64`.

## Icons And Assets

- UI glyphs use `lucide-react` where available.
- The metadata avatar uses `public/helpjuice-avatar.png`, a bitmap crop from the supplied reference.
- Decorative icons are hidden from assistive technology with `aria-hidden`.
- The bottom-right help control is an icon button with an accessible `aria-label`.

## Editable Blocks

- Native margins are not used for editable H1 content.
- Paragraph and H1 blocks share the same editor column alignment.
- Empty editable blocks show placeholders through `.editor-block:empty::before`.
- Focus is communicated through the native caret, matching the screenshots.

## Slash Menu

- Implemented with the shadcn/Base UI popover primitive for positioning.
- Width: `404px`.
- Height: `471px` on the desktop acceptance viewport, with a viewport max only as a small-screen safety fallback.
- Border radius: `5px`.
- Border: `#dfe4eb`.
- Shadow: `0 28px 70px rgba(15, 23, 42, 0.16)`.
- The menu remains below the active slash line and shifts within viewport collision padding.
- The first command row is selected by default; ArrowUp/ArrowDown can move selection to the expandable row.

## Responsive Notes

- The desktop viewport used for Playwright visual captures is `1882x930`, matching the supplied screenshot scale.
- The content column collapses with horizontal page gutters on narrower widths.
- The challenge is desktop-first because all acceptance screenshots are desktop captures.
