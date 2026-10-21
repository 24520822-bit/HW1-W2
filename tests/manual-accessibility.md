# Manual accessibility and browser checks

Run the page with `python -m http.server 4173` from the repository root and open `http://localhost:4173`.

## Static structure

- [x] The page has one `main` landmark, one descriptive `h1`, and a logical heading order.
- [x] The name and department filters each have a visible, programmatically associated label.
- [x] The data is rendered in an actual HTML `<table>` with a useful caption, table section roles, row roles, and column-header roles.
- [x] The table exposes the interactive grid role and five columns; sortable header buttons have clear accessible names and expose the active sort state.
- [x] The result announcement is a polite live region; the empty state has readable text.
- [x] Previous and next buttons have clear accessible names and visible disabled states.

## Keyboard and focus

- [x] Exactly one grid cell has `tabindex="0"`; all other grid cells use `tabindex="-1"`.
- [x] Arrow keys move to adjacent cells and rows, and stop at every edge without wrapping.
- [x] Enter selects the focused employee; Space toggles that employee's selected state and visible marker.
- [x] The selected row exposes `aria-selected="true"` and selection changes are announced meaningfully.
- [x] After paging, filtering, or sorting, focus stays on a valid grid cell if it was in the grid before the rerender; external filter/page focus is not stolen.
- [x] Arrow keys in filters and pagination controls retain their native behavior.
- [x] Grid navigation and selection behavior were exercised through browser keyboard-event checks; manually confirm keyboard-only Tab entry/exit before treating the accessibility audit as complete.
- [ ] Focus is visibly rendered during a physical keyboard-only pass, distinct from the selected-row indicator, and not obscured by nearby content.
- [x] Controls have sufficiently large hit areas and spacing.

## Visual and responsive

- [x] Text has at least 4.5:1 contrast for normal-size text and at least 3:1 for large text and essential control boundaries.
- [x] State is not conveyed by color alone; selected rows also have a visible marker or outline.
- [x] At a 320 CSS-pixel viewport, filters and pagination fit; document width stays within the viewport, while the data table is the only horizontally scrollable region.
- [ ] At 200% browser zoom, filters and pagination remain usable and the data table can be inspected without clipping content.
- [ ] Content remains usable at 320 CSS pixels with real keyboard/screen-reader operation; the data table's two-dimensional layout is the only region that may require horizontal scrolling.

## Assistive technology

- [ ] A screen reader announces the grid name, row/column headers, row position, selected state, result count, and page changes meaningfully.
- [ ] Native table navigation and ARIA grid keyboard instructions do not contradict each other in the screen readers available for testing.
- [ ] The arrow-key, Enter, and Space behaviors are discoverable, consistent, and do not trap focus.

## Data and pagination behavior

- [x] Initial render shows exactly 5 employees on page 1 and indicates page 1 of 2.
- [x] A partial name match is case-insensitive; selecting a department filters to that exact department; clearing filters restores all 10 employees.
- [x] Each sortable column toggles ascending/descending order; the active header exposes `aria-sort`.
- [x] Previous/next controls navigate between the two pages and disable at the first/last page.
- [x] While on page 2, changing a filter or sort returns to page 1 and renders only current results.
- [x] A filter with no matches clears all employee rows, announces zero results, displays the empty state and Page 0 of 0, and disables both page controls.

## Lighthouse

- [x] Lighthouse Accessibility score is 100.
- [x] Lighthouse Best Practices score is 100.
