# Contributing to SlopCAD

Welcome to the SlopCAD developer community! This document provides guidelines for setting up your local environment, making code changes, and developing the documentation site.

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js** (v18 or higher recommended) and **npm**
- **Python** (for building/testing the documentation)

### Initial Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/willemsk/slopcad.git
   cd slopcad
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the development server locally:
   ```bash
   npm run dev
   ```

---

## 🧑‍💻 Code Style and Quality

To maintain consistency and code cleanliness, SlopCAD enforces strict constraints:
- **Linting & Formatting**: Powered by Google TypeScript Style (`gts`).
  - Run linter check: `npm run lint`
  - Automatically fix format issues: `npm run fix`
- **Testing**: Powered by Vitest.
  - Run all tests: `npm run test`
- **Type Safety**: Avoid using `as any` or bypassing compiler rules. Always write type guards or strictly narrow union types.

---

## 📚 Developing Documentation

The documentation is built with **MkDocs** and the **Material for MkDocs** theme.

### Setting up Python and documentation packages (Windows)
We recommend using the Windows Python Install Manager `py` command:

1. Create a virtual environment:
   ```cmd
   py -m venv venv
   ```
2. Activate the virtual environment:
   ```cmd
   venv\Scripts\activate
   ```
3. Install the documentation packages:
   ```bash
   pip install -r docs/requirements.txt
   ```

### Previews
To run a live-reloading preview server locally:
```bash
mkdocs serve
```
Open your browser and navigate to `http://127.0.0.1:8000/`.

---

## 🚀 Read the Docs Setup (For maintainers)

SlopCAD's documentation is hosted on **Read the Docs** and built automatically on every push to the `main` branch.

### Manual Setup Instructions:
1. Log in to [readthedocs.org](https://readthedocs.org).
2. Connect your GitHub account.
3. Import the `willemsk/slopcad` repository.
4. Read the Docs will automatically detect the `.readthedocs.yaml` configuration in the repository root and start building your site.
