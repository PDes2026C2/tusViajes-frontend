---
trigger: always_on
description: Mandatory verification using the task-success skill before completing any coding task.
---

# Task Success Verification Hook

To ensure the highest quality and prevent regressions, you MUST use the **task-success** skill before considering any task complete, especially after modifying source code or adding new tests.

## Verification Step
Execute the `task-success` skill to run both tests and the build process:
```bash
node .agents/skills/task-success/scripts/validate.js
```

## Success Criteria
- [ ] The `task-success` skill reports a successful run (both tests and build passed).
- [ ] Any regressions or build errors found are resolved before notifying the user.

> [!IMPORTANT]
> Failure to verify changes using this skill is a violation of the stability policy.