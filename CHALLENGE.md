# Helpjuice Frontend Challenge Notes

## Sources Reviewed

- Figma: Helpjuice Front-End Developer Test Project.
- Google Doc: Helpjuice Test Project: Front-end Developer.
- Figma is the visual source of truth.
- Google Doc is the functional scope source of truth.

## Product Requirement

Build a live working prototype that visually and behaviorally matches the six Figma screenshots. The requested product is a small Notion-like editor focused only on creating an H1 heading component.

The required flow is:

1. Initial page shows the Helpjuice-like editor chrome, metadata toolbar, page title, description, and an empty paragraph placeholder.
2. The user types `/` in the empty paragraph.
3. The slash menu opens.
4. The user types `1`; the block displays `/1`, the menu remains open, and the menu shows `Filtering keyword 1` with the `1` highlighted.
5. `Heading 1` is selected by default.
6. Pressing Enter or clicking `Heading 1` converts the current block into an H1.
7. The `/1` filter text is removed.
8. Focus stays inside the converted H1.
9. The H1 placeholder appears immediately.
10. Typing updates the H1 text.
11. Pressing Enter from the H1 creates and focuses a normal paragraph directly below.
12. Pressing Enter from a normal paragraph creates and focuses the next paragraph, allowing the H1 flow to repeat.
13. Existing block drag handles can reorder visible blocks.
14. Clicking blank editor space below content creates or focuses the trailing paragraph so the user can continue writing without pressing Enter.

## Menu Content

The slash menu must show:

- `Add blocks`
- `Keep typing to filter, or escape to exit`
- `Filtering keyword 1`
- `Heading 1`
- `Shortcut: type # + space`
- `Expandable Heading 1`
- `Shortcut: type >># + space`

`Expandable Heading 1` is implemented only for the reviewed command flow: it converts into an expandable H1 block, exposes a disclosure toggle, and hides or shows following paragraph blocks until the next heading.

## Visual Requirements

The prototype should reproduce:

- Breadcrumb header.
- Editing and Publish Space controls.
- Metadata toolbar.
- Page title and description.
- Centered editor column.
- Empty paragraph placeholder.
- Slash command popover.
- Selected menu row.
- H1 placeholder.
- H1 text styling.
- Normal paragraph styling.
- Bottom-right help button.

Native editable element styles must be reset so the H1 does not inherit default browser margins and the heading and paragraph align to the same editor column.

## Interaction Requirements

- Escape closes the slash menu.
- Clicking outside closes the slash menu.
- Removing `/` closes the slash menu.
- Focus and caret behavior are part of the required functionality.
- The user must not need an extra click after converting to H1 or pressing Enter from the H1.

## Scope Boundaries

Do not implement:

- Persistence.
- A full document model.
- Rich text formatting.
- Collaboration.
- Document navigation.
- Full Notion behavior.
- Full nested expandable child-content behavior beyond the flat following-paragraph hide/show behavior.

## Quality Requirements

- Clean, typed React/TypeScript code.
- Tests for the required interaction behavior.
- A real-browser Playwright test for the full flow.
- Professional README with setup, scripts, architecture, assumptions, and testing notes.
- Production build should pass.

## Assumptions

- The six Figma raster screenshots are sufficient for visual matching.
- The Google Doc narrows implementation to the H1 conversion prototype.
- No local persistence is added so every reviewer starts from the same initial Figma state.
