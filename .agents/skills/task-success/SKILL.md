---
name: task-success
description: Execute verification steps (tests and build) to ensure code changes are successful and the project is stable. Use this skill when the user asks to verify changes, run tests, check if the build works, or before considering a task complete.
---

# Task Success Verification

This skill automates the verification process by running the project's test suite and build command.

## Workflow

1.  **Trigger**: Use this skill when:
    *   Explicitly asked to "verify", "run tests", or "build check".
    *   Finishing a complex coding task or adding new tests.
    *   Wants to ensure no regressions were introduced.

2.  **Execution**: Run the validation script using Node.js:
    ```bash
    node .agents/skills/task-success/scripts/validate.js
    ```

3.  **Reporting**:
    *   If successful, report that both tests and build passed.
    *   If failed, identify which stage failed (Tests or Build) and report the error to the user for fixing.

## Success Criteria
- [ ] `npm run test -- --run` passes all tests.
- [ ] `npm run build` completes without errors.
- [ ] Project remains in a stable, deployable state.

> [!TIP]
> Always run this before submitting a PR or asking the user to review significant changes.