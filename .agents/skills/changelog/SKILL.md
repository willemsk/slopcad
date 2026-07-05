---
name: changelog
description: >-
  Generates and appends a structured entry to docs/developer-guide/changelog.md using details
  from git diff and test output. Trigger when the user asks for a changelog
  update, /changelog, or when performing non-trivial refactors or fixes before commit.
---

# `/changelog` — Changelog Generator Skill

This skill automates the creation of changelog entries in `docs/developer-guide/changelog.md` to track refactors, features, and bug fixes.

## Instructions

Whenever this skill is triggered or you need to run it before a commit:

### 1. Gather Change Statistics
- Run `git diff HEAD --stat` (or `git diff --cached --stat` if files are staged) to get the count of files changed, insertions, and deletions.
- Identify which files were **Modified**, **Added**, or **Deleted**.

### 2. Gather Test Results
- Run `npm test` (or the specific test suite related to the change).
- Capture whether the tests passed and the count of tests if available.

### 3. Identify Task/CRIT ID
- Find the relevant Task ID or CRIT ID (e.g., `CRIT-006` or `TASK-001`) from your active task context, active implementation plan, or recent commit/branch names.

### 4. Format the Entry
Construct the entry using the following template:

```markdown
---

### [<TASK_OR_CRIT_ID>] — <Short Summary of the Change>
- **Date**: <YYYY-MM-DD>
- **Commit**: `[Pending Commit]` (Or the commit hash if already committed)
- **Files Changed**: <X> files, +<Y> insertions, -<Z> deletions
- **Tests**: ✅ <Test Status / Pass Count>
- **Details**: <A paragraph explaining the rationale, design decisions, and what was accomplished.>

<details>
<summary>Files</summary>

| Status | File |
|--------|------|
| <Added/Modified/Deleted> | `<file_path_relative_to_repo_root>` |

</details>
```

### 5. Update `docs/developer-guide/changelog.md`
- Read the current content of [changelog.md](file:///C:/Users/kheri/Documents/antigravity/quirky-lavoisier/docs/developer-guide/changelog.md).
- Insert the new entry directly below the `# Changelog` title and its introduction sentence/divider, keeping the file in **reverse-chronological order** (newest first).
- Write the updated content back to [changelog.md](file:///C:/Users/kheri/Documents/antigravity/quirky-lavoisier/docs/developer-guide/changelog.md).
