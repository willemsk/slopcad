---
trigger: always_on
glob: "*"
description: "Security best practices."
---

# Security Standards

As a fully local, browser-based application without a backend, security focuses heavily on protecting against Cross-Site Scripting (XSS) and ensuring safe File I/O.

## Safe DOM Manipulation
- **No `eval()`**: Never use `eval()` or the `Function()` constructor.
- **No `innerHTML`**: Avoid using `innerHTML` or `dangerouslySetInnerHTML` in Preact components unless strictly necessary and the input is fully sanitized using a proven library (like DOMPurify). Rely on Preact's standard JSX rendering which inherently escapes text.

## File I/O and Deserialization
- **Strict Validation**: When loading `.json` project files via the browser File API, always wrap `JSON.parse()` in a `try/catch` block. 
- Validate the structure of the parsed JSON object to ensure it conforms to the expected `Project` interface before blindly injecting it into `app-state.ts`.
- **SVG Export**: When generating SVG files for export, ensure that any user-provided text content (e.g., in `TextEntity` or `DimensionEntity` labels) is properly XML-escaped to prevent injection into the SVG DOM.

## Data Storage
- **localStorage Restrictions**: Only use `localStorage` for non-sensitive user preferences (e.g., `uiScale`, theme settings). Do not store sensitive data or massive project states in `localStorage` due to size limits and lack of encryption.

## Dependency Management
- **No CDN Scripts**: Do not load executable scripts from external CDNs dynamically. All dependencies must be defined in `package.json` and bundled via Vite.
