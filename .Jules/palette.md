

## 2026-06-15 - Status Bar and File Menu Accessibility Enhancements
**Learning:** Icon-only toggle buttons in the status bar and the application's file menu dropdown were missing critical ARIA attributes. Without `aria-label` and `aria-pressed`, screen reader users had no context for the Grid, Snap, and Constraint toggle states. Additionally, the File menu button lacked `aria-expanded` and `aria-haspopup`, making it impossible for screen reader users to understand it was a dropdown menu or know its current open/closed state.
**Action:** When adding icon-only buttons or toggleable UI elements, always pair them with appropriate `aria-label` and `aria-pressed` or `aria-expanded` attributes tied to the component's state to ensure complete keyboard and screen reader accessibility.

## 2026-06-15 - Icon-Only Buttons Missing ARIA Labels
**Learning:** Icon-only buttons used in toolbars (like `.qat-btn` in `menubar.tsx` and `.nav-btn` in `navigation-bar.tsx`) did not have `aria-label` attributes. This made them entirely invisible to screen reader users, who would only hear "button" without knowing what action it performed. While `title` tooltips were present, they are not sufficient for a11y compliance.
**Action:** When adding new icon-only buttons anywhere in the interface, always include an explicit `aria-label` attribute describing the action (e.g., `aria-label="New Plan"`).

## 2026-06-16 - Missing ARIA labels on modal/panel close buttons
**Learning:** Icon-only close buttons (×) inside modals and side panels are frequently missing accessible labels across the application.
**Action:** Add `aria-label` and `title` to these buttons to ensure screen readers can announce them and visual users get tooltips.

## 2026-06-16 - Missing ARIA Labels on Icon-Only UI Action Buttons
**Learning:** The ribbon collapse toggle button (using '▼' / '▲' text icons) and the constraint delete button ('×') were missing explicit `aria-label` attributes. Without these labels, screen reader users are entirely unaware of their function. Furthermore, UI toggles like the ribbon expand/collapse mechanism lack the `aria-expanded` attribute, leaving users blind to the toggle's current state.
**Action:** Ensure all icon-only action buttons (especially those indicating open/close, delete, or structural changes) are paired with `aria-label` attributes, and include appropriate ARIA state attributes like `aria-expanded` for toggleable sections.

## 2026-06-17 - [Extract File Menu]
**Learning:** The ribbon component uses specific CSS structures. Adding a file menu tab requires using `.ribbon-tab` to look cohesive.
**Action:** Use `.ribbon-tab` class for the File Menu button when integrating with the ribbon layout.

## 2026-06-18 - Row-Specific ARIA Labels for Inputs Embedded in Tables
**Learning:** `<input>` elements (radio, text, checkbox, color) embedded within table cells without explicit labeling elements were completely inaccessible to screen readers, announcing themselves vaguely like "checkbox" or "text edit" without any context indicating which row (e.g., which layer) they belonged to.
**Action:** When adding inputs inside tables where layout precludes the use of standard `<label>` tags, always use row-specific dynamic `aria-label`s (e.g., `aria-label={"Toggle lock for " + layer.name}`) to provide adequate context for screen reader users.

## 2026-06-18 - Missing context on tabular form inputs
**Learning:** Form inputs embedded directly within data tables (like the layer properties table) often lack explicit `<label>` elements due to visual space constraints. This leaves screen reader users completely disoriented, as they only hear "checkbox" or "text input" without knowing which row (e.g., which specific layer) the input controls.
**Action:** Always use dynamically generated, row-specific `aria-label` attributes (e.g., `aria-label={"Toggle visibility for " + layer.name}`) for any interactive form element embedded within a table row that lacks a visual, dedicated `<label>` element.

## 2026-06-18 - Dynamic ARIA labels in tables
**Learning:** When form inputs are placed inside tables, the layout often precludes the use of standard `<label>` tags.
**Action:** Always use row-specific dynamic `aria-label`s (e.g., `aria-label={"Toggle lock for " + layer.name}`) for proper screen reader accessibility in these situations.

## 2026-06-18 - Missing ARIA Labels on Table Form Inputs
**Learning:** Form input elements rendered inside table cells (like radios, checkboxes, text inputs, and color pickers) frequently cannot be wrapped in standard `<label>` tags due to strict table layout constraints. This leaves these inputs completely inaccessible to screen reader users, who will just hear "checkbox" or "text input" with no context of what row or entity it applies to.
**Action:** When adding form inputs inside tables where layout precludes standard `<label>` tags, always use row-specific, dynamic `aria-label` attributes (e.g., `aria-label={"Toggle lock for " + layer.name}`) to provide essential context for assistive technologies.

## 2026-06-27 - Table Row Input Accessibility
**Learning:** Inputs within table rows (like in the Layer Modal) that rely on column headers for context are entirely unreadable by screen readers without explicit ARIA labels. Because standard `<label>` tags are difficult to use in a dense table layout, screen reader users miss crucial context like "which layer is this for?".
**Action:** Always add dynamic, row-specific `aria-label`s to inputs in table/list structures (e.g., `aria-label={"Toggle lock for " + layer.name}`) to ensure proper screen reader accessibility.

## 2026-06-28 - Form Inputs in Table Layouts Missing ARIA Labels
**Learning:** Forms constructed within table layouts (like the layer modal) inherently lack proper `<label>` associations because structural table elements often break `<label>` to `id` mappings and make the HTML unwieldy. As a result, screen reader users encounter form elements (like checkboxes, radio buttons, color pickers, etc.) without any descriptive context.
**Action:** When adding form inputs inside tables where layout precludes the use of standard `<label>` tags, always use row-specific dynamic `aria-label`s (e.g., `aria-label={"Toggle lock for " + layer.name}`) for proper screen reader accessibility.

## 2024-06-29 - Verifying Disabled States in Playwright
**Learning:** Standard Playwright interaction methods like `hover()` or `click()` automatically wait for an element to be actionable (which means, among other things, not being `disabled`). Attempting to `hover()` a `disabled` button to verify its state will cause the script to hang and eventually timeout because Playwright considers disabled elements non-actionable.
**Action:** When writing verification scripts that need to demonstrate or inspect a `disabled` state (like a disabled Delete Layer button), use `force=True` (e.g., `button.hover(force=True)`) to bypass actionability checks, or simply assert the attribute's presence without trying to trigger an interaction.

## 2026-07-05 - Missing ARIA Labels on Table Inputs
**Learning:** Form inputs inside table structures (like in the Layer Properties modal) often lack context for screen readers when they rely entirely on visual layout and table column headers. Without explicit `aria-label`s, screen reader users only hear the input type (e.g., "radio button", "checkbox", "color picker") without knowing which specific item the input controls.
**Action:** When creating tables containing form inputs, always add context-aware `aria-label`s to the inputs (e.g., `aria-label="Set visibility for Layer 1"`) to ensure proper screen reader accessibility.

## 2026-07-05 - Missing ARIA Labels on Layer Properties Table Inputs
**Learning:** Inputs within a data table (like the ones in the Layer Properties modal for layer status, name, visibility, lock, and color) often lack explicit `aria-label`s. Because they are in a table row rather than paired with standard `<label>` elements, screen readers only announce the generic input type (e.g., "radio button", "checkbox") without context of which row/layer it applies to.
**Action:** When creating tables containing inline inputs, always append dynamic `aria-label` attributes to the inputs that include the identifying context of the row (e.g., `aria-label={"Toggle visibility for layer: " + layer.name}`) to ensure proper accessibility.
## 2024-07-07 - Semantic labels for Command Line Input
**Learning:** Presentational elements (like `<span>`) used as visual labels are entirely ignored by screen readers, meaning any adjacent inputs without explicit `aria-label`s will lack context. The command line input was previously accompanied by a `<span>Command:</span>`, rendering it unlabelled for assistive tech.
**Action:** Always use semantic `<label>` tags with a proper `htmlFor` attribute that maps to the input's `id` instead of presentational elements (or use `aria-label`/`aria-labelledby`) to ensure inputs are properly announced to screen reader users.
