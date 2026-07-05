# File Operations

SlopCAD keeps all data local to your computer. Learn how to save, open, and export your drawings.

---

## 💾 Saving and Loading Projects

SlopCAD projects are saved in a custom JSON-based `.json` format containing all pages, layers, geometries, and constraints.

### Automatic Saving
The application automatically saves your active drawing to the browser's `localStorage` on every change. Even if you refresh the browser or close the tab, your work will load exactly where you left it.

### Exporting/Downloading Project File
To share a project or back it up:
1. Click the **Save** button in the Top Menu.
2. Select **Export Project JSON**.
3. Choose a filename. A `.json` file containing your project will be downloaded.

### Importing/Opening Project File
To open a previously saved `.json` project:
1. Click the **Open** button in the Top Menu.
2. Choose **Load Project JSON**.
3. Select the `.json` file from your local storage.
4. Your active workspace will load the new project.

---

## 🎨 Exporting Vector Drawings (SVG)

To use your drawings in other editors (like Adobe Illustrator, Inkscape) or print them:
1. Click **File -> Export SVG** in the Menu.
2. Choose your scale and options (e.g. export active page, include grid).
3. The SVG file will download instantly, rendering all lines, walls, and annotations as standard vector paths.
