# FAQ (Frequently Asked Questions)

Here are answers to the most common questions regarding SlopCAD.

---

## 💻 General Questions

### Does SlopCAD require an internet connection?
No. SlopCAD is a fully local web app. Once the page is loaded, all operations, math solver tasks, drawing canvas rendering, and file operations are performed directly inside your browser. No data ever leaves your computer.

### Where are my files stored?
By default, files are cached in your browser's `localStorage`. To persist them securely or move them to another computer, export your project as a `.json` file and save it to your local hard drive.

### Can I run SlopCAD on tablet or mobile?
Yes, but SlopCAD is heavily optimized for desktop mouse and keyboard controls. Some features (like keyboard shortcuts and detailed clicking/dragging) might be difficult to use on touchscreen interfaces.

---

## 🛠️ Drawing & Constraints

### Why can't I move a wall or vertex?
It is likely restricted by a constraint. Look at the entity properties or toggle **Show Constraints** in the status bar to verify. If a wall has a "Fixed Length" or "Horizontal" constraint, its motion is restricted. Try deleting the constraint and editing again.

### What is the maximum project size?
Because rendering is powered by the HTML5 Canvas 2D API, performance depends on your computer's CPU and memory. SlopCAD can easily handle drawings with thousands of architectural entities, but extremely large scale maps might cause rendering lag.
