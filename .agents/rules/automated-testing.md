# Automated Testing Workflow

You must adhere to this workflow to ensure code quality:

1. **Test-Driven or Test-After execution**: When you implement a new feature or fix a bug, you MUST create or update the relevant unit tests (`src/core/`) or integration tests (`src/tools/`, `src/ui/`).
2. **Best-Effort Testing**: Implement tests to the best of your abilities for all new core logic, snapping mechanisms, solvers, and state mutations.
3. **Validation**: You MUST run `npm run test` to verify that all tests pass. Do not present your work as complete if tests are failing. Fix failing tests immediately.
4. **Integration Tests for Tools**: Make sure new canvas tools have their own `.test.ts` file covering standard mouse event sequences and state updates.
