---
name: subphase-verifier
description: Automated protocol and tool to verify subphase deliverables, architectural boundaries, code quality, and git state.
---

# Subphase Verifier Skill

Use this skill at the conclusion of every subphase to guarantee compliance before presenting an Approval Gate to the user.

## Verification Checklist

1. **Workspace Health**: Run `pnpm verify:subphase` to check:
   - Biome formatting and linting (0 errors)
   - Cross-app illegal import boundaries (zero cross-talk)
   - TypeScript compiles cleanly
2. **Deliverables Review**: Verify that every deliverable promised in the subphase plan is created, non-empty, and functional.
3. **Ledger Update**: Update `docs/execution-ledger/STATUS.md` with status `DONE`, verification summary, and timestamp.
4. **Git Checkpoint**: Stage and commit changes with a standard conventional commit message (`feat(...)`, `fix(...)`, `chore(...)`).
5. **Approval Gate Presentation**: Present a clear markdown summary, validation results, and wait for explicit user confirmation before proceeding.
