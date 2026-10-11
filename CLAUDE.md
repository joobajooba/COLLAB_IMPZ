# COLLAB_IMPZ

Three.js walking test scene, shared by two collaborators. See `README.md` for how to run it (`npm install`, then `npx serve .`).

## GitHub workflow

Both collaborators review every change before it reaches `main`. Follow these rules for any work in this repo.

### Every change goes to staging

- Never commit or push directly to `main`.
- Create a branch named `staging/<topic>`, commit to it, push it, and open a **draft** pull request against `main` (`gh pr create --draft`).
- If the change depends on another open staging PR, branch from that one and set the PR base to it (a stacked PR), so the diff shows only the new change.
- Afterwards, tell the user what changed, the branch name and the PR link.

### "Commit to main"

Merge only when the user says **"commit to main"**. Then:

1. `git fetch` and list the open staging PRs. If it's unclear which ones to merge, ask.
2. **Back up first.** Tag the current `origin/main` as `backup/main-YYYYMMDD-HHMM` (an annotated tag whose message says what is about to be merged) and push the tag.
3. Merge each PR, oldest in the stack first: `gh pr ready <n>`. If its base is another staging branch, retarget it with `gh pr edit <n> --base main`. Then `gh pr merge <n> --merge`. Always use a merge commit, never squash or rebase, so the history stays intact.
4. Pull `main`, run the game and confirm it still loads.
5. Report what was merged and the name of the backup tag.

Delete the merged staging branches only when the user asks, and only after confirming they are fully merged (`git merge-base --is-ancestor origin/<branch> origin/main`).

### Rolling back

- Default: open a PR that reverts the bad merge (`git revert -m 1 <merge-sha>`). History is kept and nothing is force-pushed.
- Resetting `main` to a `backup/main-*` tag needs a force-push. Do it only after the user explicitly confirms that specific reset.
- Never delete or move `backup/*` tags.

## Game design

The game design lives in `design/` and follows its own rules in `design/CLAUDE.md`: a roadmap worked in passes, no deviating from what was asked, quality first, and a report at the end of each pass. Read that file before doing any design work.
