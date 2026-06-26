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
