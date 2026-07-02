# Git Workflow

You must adhere to this workflow for version control:

1. **Changelog**: Before committing, check if your changes warrant a changelog entry. Run the `/changelog` skill (defined in `.agents/skills/changelog/SKILL.md`) for any refactor, feature addition, or bug fix. Skip it for trivial formatting-only or comment-only changes.
2. **Commit Frequency**: At the end of every single turn where files were modified, you MUST commit your changes using git.
3. **Commands**:
   - Stage all changes: `git add .`
   - Commit: `git commit -m "Your descriptive message"`
4. **Commit Messages**: Determine the commit message dynamically based on the changes you just made. The message should be a concise summary of the added features, fixed bugs, or refactored components in that turn.
5. **Execution**: Perform the commit *before* responding to the user or ending your turn.
