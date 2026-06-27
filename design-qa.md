**Source Visual Truth**
- Primary reference screenshots:
  - `/var/folders/lf/1nw6yl_15xd2_t68pnbr10d00000gn/T/TemporaryItems/NSIRD_screencaptureui_XisJjc/Screenshot 2026-06-26 at 7.05.42 PM.png`
  - `/var/folders/lf/1nw6yl_15xd2_t68pnbr10d00000gn/T/TemporaryItems/NSIRD_screencaptureui_zShWMD/Screenshot 2026-06-26 at 7.06.09 PM.png`
  - `/var/folders/lf/1nw6yl_15xd2_t68pnbr10d00000gn/T/TemporaryItems/NSIRD_screencaptureui_B0MEx2/Screenshot 2026-06-26 at 7.06.26 PM.png`
  - `/var/folders/lf/1nw6yl_15xd2_t68pnbr10d00000gn/T/TemporaryItems/NSIRD_screencaptureui_0N660G/Screenshot 2026-06-26 at 7.06.45 PM.png`
  - `/var/folders/lf/1nw6yl_15xd2_t68pnbr10d00000gn/T/TemporaryItems/NSIRD_screencaptureui_Ck1pOt/Screenshot 2026-06-26 at 7.07.02 PM.png`
  - `/var/folders/lf/1nw6yl_15xd2_t68pnbr10d00000gn/T/TemporaryItems/NSIRD_screencaptureui_5lTskH/Screenshot 2026-06-26 at 7.07.15 PM.png`
- Focused header references:
  - `/var/folders/lf/1nw6yl_15xd2_t68pnbr10d00000gn/T/TemporaryItems/NSIRD_screencaptureui_acw0Xm/Screenshot 2026-06-26 at 7.37.20 PM.png`
  - `/var/folders/lf/1nw6yl_15xd2_t68pnbr10d00000gn/T/TemporaryItems/NSIRD_screencaptureui_TOVE6n/Screenshot 2026-06-26 at 7.38.19 PM.png`
- Focused menu/scale references:
  - `/var/folders/lf/1nw6yl_15xd2_t68pnbr10d00000gn/T/TemporaryItems/NSIRD_screencaptureui_Bvwt91/Screenshot 2026-06-26 at 7.58.06 PM.png`
  - `/var/folders/lf/1nw6yl_15xd2_t68pnbr10d00000gn/T/TemporaryItems/NSIRD_screencaptureui_Hj91dv/Screenshot 2026-06-26 at 8.04.16 PM.png`
  - `/var/folders/lf/1nw6yl_15xd2_t68pnbr10d00000gn/T/TemporaryItems/NSIRD_screencaptureui_AWywlr/Screenshot 2026-06-26 at 8.09.58 PM.png`
  - `/var/folders/lf/1nw6yl_15xd2_t68pnbr10d00000gn/T/TemporaryItems/NSIRD_screencaptureui_34CLSK/Screenshot 2026-06-26 at 8.10.32 PM.png`
- Focused toolbar icon references:
  - `/var/folders/lf/1nw6yl_15xd2_t68pnbr10d00000gn/T/TemporaryItems/NSIRD_screencaptureui_X08wDP/Screenshot 2026-06-26 at 8.02.06 PM.png`
  - `/var/folders/lf/1nw6yl_15xd2_t68pnbr10d00000gn/T/TemporaryItems/NSIRD_screencaptureui_Ru9RTm/Screenshot 2026-06-26 at 8.02.22 PM.png`
  - `/var/folders/lf/1nw6yl_15xd2_t68pnbr10d00000gn/T/TemporaryItems/NSIRD_screencaptureui_T1DPAd/Screenshot 2026-06-26 at 8.25.18 PM.png`

**Implementation Evidence**
- Viewport: `1882x930`
- Route: `/`
- Browser captures:
  - `test-results/helpjuice-01-initial.png`
  - `test-results/helpjuice-03-filtered.png`
  - `test-results/helpjuice-04-heading-empty.png`
  - `test-results/helpjuice-05-heading-text.png`
  - `test-results/helpjuice-06-paragraph-empty.png`
  - `test-results/helpjuice-07-complete.png`
  - `test-results/helpjuice-08-menu-after-multiple-headings.png`
- Full-view comparison evidence:
  - `test-results/design-qa-initial-comparison.png`
  - `test-results/design-qa-filtered-menu-comparison.png`
  - `test-results/design-qa-heading-empty-comparison.png`
  - `test-results/design-qa-heading-text-comparison.png`
  - `test-results/design-qa-paragraph-empty-comparison.png`
- Focused region comparison evidence:
  - `test-results/design-qa-complete-focused-comparison.png`
  - `test-results/header-crops-comparison.png`
  - `test-results/menu-multiple-headings-popover-scrolled.png`
  - `test-results/toolbar-icon-fixes.png`

**Findings**
- No actionable P0/P1/P2 findings remain.

**Fidelity Surfaces**
- Fonts and typography: page title, description, paragraph, H1 placeholder, H1 text, and menu labels now match the reference scale and hierarchy closely at the desktop viewport.
- Spacing and layout rhythm: centered editor column, toolbar, title divider, description gap, slash menu anchor, H1 offset, and paragraph spacing were tuned against the supplied states.
- Colors and visual tokens: white canvas, subdued gray text, blue publish action, pale placeholder, selected menu row, menu border/shadow, green metadata badge, and help affordance are aligned to the screenshots.
- Image and icon fidelity: visual-only chrome now uses real icon components for common UI glyphs and a cropped bitmap asset for the supplied bunny avatar.
- Header fidelity: the left breadcrumb was retuned against the focused crop, and the editing control now uses the open-lock icon family shown in the reference instead of the previous keyhole lock.
- Menu collision fidelity: the slash menu now uses the shadcn Popover positioning layer, scrolls the active slash line into view when needed, and keeps the menu below the slash line with visible bottom gutter after several H1 blocks.
- Copy and content: menu labels, shortcuts, `/1` filter text, H1 text, and final paragraph content match the demonstrated flow. The description uses the initial full-page reference copy, which says `hitting enter.`

**Patches Made Since Previous QA Pass**
- Increased the desktop content column to the reference width.
- Reduced the oversized header controls, metadata toolbar, page title, description, and paragraph placeholder sizing against the focused scale references.
- Updated the Playwright viewport to `1882x930`.
- Added a screenshot for the paragraph-placeholder state before normal text entry.
- Swapped visual chrome/menu/handle glyphs to real `lucide-react` icons.
- Tuned the H1 block vertical offset to match the H1 placeholder and typed-heading states.
- Replaced the header lock with the open-lock shape and tuned the left breadcrumb's spacing, icon sizing, underline, and text weights against the focused header crops.
- Moved the slash menu to shadcn Popover, enabled viewport collision padding, restored vertical page scrolling, added bottom canvas space, and added an e2e regression for the multi-heading menu overflow case.
- Replaced the generic red X with the supplied bunny avatar bitmap, swapped the toolbar count glyph to a diagonal down-left arrow, and tuned the right check/cloud status pair.

**Follow-up Polish**
- P3: The focused final reference screenshot shows a variant description ending in `ENTER/RETURN`; the implementation follows the initial full-page Figma screenshot copy ending in `hitting enter.`

final result: passed
