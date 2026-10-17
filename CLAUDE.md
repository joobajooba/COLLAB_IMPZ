# COLLAB_IMPZ

Three.js walking test scene, shared by two collaborators. See `README.md` for how to run it (`npm install`, then `npx serve .`).

## Follow these rules strictly

This file, `docs/CLAUDE.md` and the design docs in `docs/` are the vision for the game. Follow them exactly.

- Do only what the user asked. Do not add features, change designs, rename things or restructure folders on your own.
- If a request conflicts with a rule here or a decision in `docs/DECISIONS.md`, stop and tell the user. Do not pick one quietly.
- A rule changes only when the user says so. Record the change in this file (or in `docs/DECISIONS.md` for design) on a staging branch like any other change.
- Ideas of your own go under **Suggestions** in a report, never straight into the docs or the game.

## Session start

At the start of every session in this repo, before anything else, open the repo in GitHub Desktop by running GitHub Desktop's command-line tool from the repo root: `github .` (on Windows it is `%LOCALAPPDATA%\GitHubDesktop\bin\github.bat`). If GitHub Desktop is already open, this brings it to the front. If it isn't installed, skip this step. (A collaborator may also have a `SessionStart` hook in `.claude/settings.local.json` that does this automatically.)

## Explain like I'm 5

The user is new to coding tools. Every time you describe work, whether in chat, a commit message, a PR description or the work log, include a short **"Like I'm 5"** explanation: one to three plain sentences a child could follow, with no jargon. Example: "The game now has a fishing rod. You walk to the water, press F, and wait for a fish to bite." Put the technical detail after it.

## Work log

Record everything you do in `docs/worklog/YYYY-MM-DD.md`, with one file per day, adding to it if it already exists. For each piece of work, write:

- **What:** one line.
- **Like I'm 5:** the simple explanation.
- **Where:** branch, PR link, and the files touched.

Commit the log on the same staging branch as the work it describes. Setup or chat-only work (cloning, installing, answering questions) goes in the log too.

## Slide pack

The team keeps project plans in a Google Slides deck: https://docs.google.com/presentation/d/1uxv90uRnxQYMdITVEi9A3Oa4mQowHsAwGe23MHUX8Ek/edit. It is shared "anyone with the link can view". Always read the latest version when asked about it, never a saved copy. Text only: `curl -sSL https://docs.google.com/presentation/d/1uxv90uRnxQYMdITVEi9A3Oa4mQowHsAwGe23MHUX8Ek/export/txt`. Whole deck: replace `txt` with `pptx`. A 401 means sharing was turned off, so tell the user.

## Desktop tools

The user allows Claude to use desktop tools on their machine when they name the tool for a task: Blender, Aseprite, GitHub Desktop, Godot, and others they mention. Use a tool only for the task it was named for. Saved files from those tools go into the repo's folder layout (`models/`, `sprites/`, `textures/`) and through a staging branch like any other change.

## GitHub workflow

Both collaborators review every change before it reaches `main`. Follow these rules for any work in this repo.

### Every change goes to staging

- Never commit or push directly to `main`.
- Create a branch named `staging/<topic>`, commit to it, push it, and open a **draft** pull request against `main` (`gh pr create --draft`).
- **One branch per mechanic.** Each game mechanic or skill gets its own branch, named after it: `staging/fishing`, `staging/woodcutting`, and so on. Keep all work on that mechanic on its branch until the user merges it. Never mix two mechanics on one branch, so each can be tested alone and one can't break another. Non-mechanic work (docs, setup, tooling) keeps a short topic name.
- Commit messages and PR descriptions start with a one-line summary, then a **Like I'm 5** paragraph, then the technical detail (see "Explain like I'm 5").
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

The game design lives in `docs/` and follows its own rules in `docs/CLAUDE.md`: a roadmap worked in passes, no deviating from what was asked, quality first, and a report at the end of each pass. Read that file before doing any design work.
