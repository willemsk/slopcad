---
trigger: always_on
glob: "src/ui/**/*, src/app.css, src/app.tsx"
description: "UI aesthetics, layout, and component rules."
---

# App UI Guidelines

## Design Language
- **Aesthetic**: AutoCAD-inspired professional dark theme. It shouldn't be a 1:1 pixel clone, but must match the structural layout, high density, and functional feel of professional CAD software.
- **Color Palette**: Stick to the tokens defined in `src/app.css` `:root`.
  - Backgrounds: `--bg-primary: #1e1e1e`, `--bg-secondary: #2d2d30`.
  - Accent: Autodesk Blue (`--accent: #007acc`).
- **Typography**: 
  - *UI text*: `Inter` (sans-serif).
  - *Data/Coordinates/Commands*: `JetBrains Mono` (monospace).
- **Icons**: 
  - Use inline SVG components exclusively, stored in `src/ui/icons.tsx`. 
  - **Do NOT** use emojis, icon fonts, or large external icon libraries (like FontAwesome or lucide-react unless specifically approved).

## Layout Structure
The application uses a flex-based vertical shell defined in `app.tsx`:
1. **Quick Access Toolbar** (`menubar.tsx`)
2. **Ribbon** (`toolbar.tsx` + `ribbon.css`)
3. **Main Workspace** (`.app-main` holding the Canvas and the collapsible Properties Panel)
4. **Command Line** (`command-line.tsx`)
5. **Page Tabs** (`page-tabs.tsx`)
6. **Status Bar** (`status-bar.tsx`)

## UI Scaling & Responsiveness
- **Scaling Mechanism**: To support 1440p and 4K displays, UI elements are scaled using the CSS `zoom` property applied directly to the UI component wrappers in `app.tsx`.
- The scaling factor is controlled via `uiScaleSignal` in `app-state.ts`.
- **Canvas Isolation**: The canvas itself is **never** scaled by CSS `zoom` to prevent blurry rendering and coordinate mapping issues.
- **Desktop First**: The UI is optimized for desktop interactions (mouse + keyboard). Mobile/touch responsiveness is not a requirement.
