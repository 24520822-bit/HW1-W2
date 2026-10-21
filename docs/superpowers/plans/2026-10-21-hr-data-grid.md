# HR Data Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a beginner-friendly, client-only HR attendance grid with 10 fictional employees, usable by mouse and keyboard and meeting WCAG 2.2 AA.

**Architecture:** Create a static page with native HTML controls and a semantic `<table>` enhanced as an ARIA grid for the requested cell-by-cell keyboard interaction. Keep the 10-record dataset and pure filter/sort/pagination functions separate from the DOM code; `src\app.js` connects them and renders the current view.

**Tech Stack:** HTML, CSS, browser-native JavaScript ES modules; Node.js built-in test runner only, with no runtime or test dependencies.

**Spec:** User-approved scope and technology decisions in the conversation; no separate spec file exists because the repository was empty at reconnaissance.

## Global Constraints

- Use plain HTML, CSS, and JavaScript; do not add React, TypeScript, a backend, or product features.
- Include exactly 10 fictional sample employees and show 5 employees per page.
- Provide name and department filters; sortable name, attendance-days, late-days, and overtime-hours columns.
- Support grid-cell arrow navigation, Enter to select a row, and Space to toggle its selection.
- Target WCAG 2.2 AA and Lighthouse Accessibility 100 and Best Practices 100.
- Use a real HTML `<table>`; do not replace it with a collection of layout `<div>` elements.
- Do not create commits or push changes on behalf of the user; each task ends with a suggested commit checkpoint for the user.

## File Structure

- `index.html` — page title, labeled filters, live status, semantic table/grid, and pagination controls.
- `styles.css` — responsive layout, visible focus, selected-row state, and accessible contrast.
- `src\data.js` — the fixed 10-record fictional dataset.
- `src\grid.js` — pure filter, stable sort, and pagination helpers.
- `src\app.js` — DOM rendering, UI state, filter/sort/page controls, selection, and keyboard behavior.
- `tests\data.test.js` — dataset size, shape, uniqueness, and valid numeric values.
- `tests\grid.test.js` — filters, sorting, stable ties, pagination, and empty results.
- `tests\manual-accessibility.md` — repeatable browser, keyboard, screen-reader, and Lighthouse checks.
- `package.json` — ES module mode and `npm test` script using Node's built-in test runner.

## Review Focus

- A filter with no matches must render a clear empty state and disable pagination rather than leave stale rows (Task 4 manual integration check).
- Equal sort values must retain deterministic input order, including when sorting numbers in both directions (Task 2 unit tests).
- Changing a filter or sort while on the last page must return to a valid page and keep page controls accurate (Task 4 manual integration check).
- Arrow navigation at grid boundaries must not wrap, and rerendering must not lose the active cell (Task 5 keyboard checks).
- Assistive technology must receive consistent grid, row, column-header, selected-state, and live-update semantics despite the native table plus ARIA grid roles (Task 3 markup audit and Task 5 keyboard/screen-reader checks).

---

### Task 1: Create the Test Harness and Employee Dataset

**Files:**
- Create: `package.json`
- Create: `src\data.js`
- Test: `tests\data.test.js`

**Interfaces:**
- Produces: `EMPLOYEES`, an array of exactly 10 objects with `id`, `name`, `department`, `attendanceDays`, `lateDays`, and `overtimeHours` fields. IDs are unique strings; names and departments are non-empty strings; all three measures are non-negative numbers.
- `package.json` sets `"type": "module"` and `"test": "node --test"`. No packages are added.

- [x] **Step 1: Add the minimal package configuration** in `package.json` with `"type": "module"` and `"test": "node --test"`; do not add dependencies.
- [x] **Step 2: Write failing dataset tests** in `tests\data.test.js` for exactly 10 entries, unique IDs, non-empty names and departments, and non-negative numeric measures.
- [x] **Step 3: Run `npm test`** and confirm it fails because `src\data.js` does not yet export `EMPLOYEES`.
- [x] **Step 4: Add 10 fictional employee records** in `src\data.js`, using the exact interface above.
- [x] **Step 5: Run `npm test`** and confirm all dataset assertions pass.
- [x] **Step 6: User commit checkpoint** (suggested): `git add package.json src\data.js tests\data.test.js` then `git commit -m "test: add sample employee dataset"`.

### Task 2: Implement and Test Grid Data Operations

**Files:**
- Create: `src\grid.js`
- Test: `tests\grid.test.js`

**Interfaces:**
- Consumes: `EMPLOYEES` from `src\data.js`.
- Produces: `filterEmployees(employees, { name, department })`, `sortEmployees(employees, { key, direction })`, and `paginateEmployees(employees, page, pageSize = 5)`. All return new arrays and do not mutate their inputs. Supported sort keys are `name`, `attendanceDays`, `lateDays`, and `overtimeHours`; directions are `asc` and `desc`.

- [x] **Step 1: Write failing tests** for case-insensitive partial name matching, exact department matching, empty filters, all four sort keys in both directions, stable ties, page size 5, and a final partial page.
- [x] **Step 2: Run `npm test`** and confirm the new grid tests fail because the helpers are not defined.
- [x] **Step 3: Implement the three pure helpers** in `src\grid.js`; compare numeric measures numerically, compare names consistently without locale-sensitive test assumptions, preserve input order for ties, and clamp pagination to valid bounds without mutating input.
- [x] **Step 4: Run `npm test`** and confirm all dataset and grid tests pass.
- [x] **Step 5: User commit checkpoint** (suggested): `git add src\grid.js tests\grid.test.js` then `git commit -m "feat: add employee grid data operations"`.

### Task 3: Add the Accessible Page Structure and Styles

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `tests\manual-accessibility.md`

**Interfaces:**
- Consumes: the documented employee fields and grid interaction requirements.
- Produces: labeled name and department filters, a real `<table role="grid">` with explicit `rowgroup`, `row`, `columnheader`, and `gridcell` roles, sortable-header buttons with `aria-sort`, a caption, pagination controls, a live status region, and visible keyboard focus styles. This is a keyboard-interactive ARIA grid, not a passive table; its assistive-technology behavior must be checked.

- [x] **Step 1: Write the manual markup/accessibility checklist** in `tests\manual-accessibility.md` before building the page: landmark and heading navigation, filter labels, table caption and role relationships, focus visibility, contrast, responsive layout, and status announcements.
- [x] **Step 2: Create `index.html`** with semantic landmarks and headings, explicitly associated labels, the table/grid skeleton, an empty-state element, a polite live region, and previous/next page buttons with accessible names.
- [x] **Step 3: Create `styles.css`** with a clear responsive layout, high-contrast text and controls, non-color-only selected state, and a visible focus indicator; do not suppress browser focus without an equally visible replacement.
- [x] **Step 4: Serve the page with `python -m http.server 4173` and inspect it in a browser**; confirm the checklist's static structure, labels, focus indicator, and responsive layout are present before wiring behavior.
- [x] **Step 5: User commit checkpoint** (suggested): `git add index.html styles.css tests\manual-accessibility.md` then `git commit -m "feat: add accessible grid page structure"`.

### Task 4: Connect Filters, Sorting, and Pagination

**Files:**
- Create: `src\app.js`
- Modify: `index.html`
- Modify: `tests\manual-accessibility.md`

**Interfaces:**
- Consumes: `EMPLOYEES`, the three `src\grid.js` helpers, and the IDs/roles defined in `index.html`.
- Produces: rendered rows of five or fewer employees, functional name/department filters and sortable headers, correct page controls, and an empty state with an announced result count.

- [x] **Step 1: Extend the manual checklist** with filter, sort, pagination, no-match, and last-page state-change checks.
- [x] **Step 2: Wire filter and sort controls** in `src\app.js`; filtering and sorting reset to page 1, each header button toggles its sort direction, and `aria-sort` reflects the active sort. Build department options from the dataset without duplicating employee records.
- [x] **Step 3: Render the current page and pagination state**; show 5 records per page, announce result counts, disable previous/next at boundaries, and show the empty state, a `0 of 0` page indicator, and disabled page buttons when there are no matches.
- [x] **Step 4: Verify the manual integration checklist** using the static server, including zero matches and filtering/sorting from page 2; confirm no stale row remains and page count is accurate.
- [x] **Step 5: Run `npm test`** and confirm the data-operation tests still pass.
- [x] **Step 6: User commit checkpoint** (suggested): `git add index.html src\app.js tests\manual-accessibility.md` then `git commit -m "feat: wire grid filters sorting and paging"`.

### Task 5: Implement Grid Keyboard Navigation and Selection

**Files:**
- Modify: `src\app.js`
- Modify: `index.html`
- Modify: `tests\manual-accessibility.md`

**Interfaces:**
- Consumes: the rendered ARIA grid and current page state from Task 4.
- Produces: one roving-focus grid cell at a time; Arrow keys move between cells and rows without wrapping; Enter selects the focused row; Space toggles that row's selected state; selected rows expose `aria-selected`.

- [x] **Step 1: Extend the manual checklist** with a keyboard-only walkthrough: enter the grid, move in each arrow direction, check row/column boundaries, use Enter and Space on a row, and repeat after filtering and paging.
- [x] **Step 2: Add roving `tabindex` and focus restoration** in `src\app.js`; clamp arrow movement to existing grid cells and never intercept arrow keys while focus is in a filter or pagination control.
- [x] **Step 3: Implement row selection** so Enter sets the focused row selected and Space toggles it; synchronize visual selected state and `aria-selected` without moving focus.
- [x] **Step 4: Verify the keyboard checklist** in a browser, including boundary non-wrapping, selection announcements, and focus remaining on a valid cell after rerender.
- [x] **Step 5: Run `npm test`** and confirm the pure data-operation tests pass.
- [x] **Step 6: User commit checkpoint** (suggested): `git add index.html src\app.js tests\manual-accessibility.md` then `git commit -m "feat: support keyboard grid navigation"`.

### Task 6: Complete Accessibility and Lighthouse Verification

**Files:**
- Modify: `styles.css`
- Modify: `tests\manual-accessibility.md`

**Interfaces:**
- Consumes: the complete grid and manual checklist.
- Produces: verified WCAG 2.2 AA-oriented interaction and documentation of repeatable browser checks; target Lighthouse Accessibility 100 and Best Practices 100.

- [x] **Step 1: Add final checks** to `tests\manual-accessibility.md` for keyboard-only operation, browser zoom/reflow, visible focus, contrast, accessible names, live updates, and screen-reader review of grid dimensions/headers/selection.
- [x] **Step 2: Run `npm test`** and confirm the complete automated suite passes.
- [x] **Step 3: Run the manual browser and accessibility checks** from the checklist; use browser developer tools and a screen reader to inspect the actual page, then fix only issues in the approved scope.
- [x] **Step 4: Run Lighthouse in Chrome DevTools** against the locally served page and confirm Accessibility 100 and Best Practices 100; record the results and any required repeatable setup in the checklist.
- [x] **Step 5: User commit checkpoint** (suggested): `git add styles.css tests\manual-accessibility.md` then `git commit -m "test: verify grid accessibility"`.
