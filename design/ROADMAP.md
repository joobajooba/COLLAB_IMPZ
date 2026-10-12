# IMPLINGZ: design roadmap

> Claude: read `design/CLAUDE.md` before working from this file.
>
> This file tracks the **design docs**. What has been built in the game, and what to build next, is in [BUILD-ROADMAP.md](BUILD-ROADMAP.md).

## How this works

The design is built in **passes** (sprints). Each pass has a goal and a short list of items. At the end of every pass there is:

1. **A report** in `reports/`: what was done and what needs your decision.
2. **A review by you**: you read the docs and the report, answer the open questions, and either approve them or ask for changes.
3. **The next pass**, which picks up your feedback.

Passes keep going until **you** mark every doc `Signed off`. Nothing is finished just because a pass ended.

**Statuses:** `Not started` → `Draft` → `In review` → `Signed off` (only you can set `Signed off`).

Decisions can also arrive between passes, as **user additions** (for example a table you hand over). They go straight into `DECISIONS.md` and the doc they belong to, and are logged in the pass log below.

---

## Doc status

| # | Doc | Status | Depends on | Last pass |
|---|---|---|---|---|
| 00 | [Overview](docs/00-overview.md) | Draft | n/a | 0 |
| 01 | [Activities](docs/01-activities.md) | Not started | 00, 02 | 0 |
| 02 | [Resources & economy](docs/02-resources.md) | Draft | 00 | 0, then user additions (D-005 to D-007) |
| 03 | [Games](docs/03-games.md) | Not started | 00, 02 | 0 |
| 04 | [Trade system](docs/04-trade.md) | Not started | 00, 02 | 0 |
| 05 | [Skirmish system](docs/05-skirmish.md) | Not started | 00, 02 | 0 |

**Why this order:** the overview decides what the NFT is and what the core loop is. Every system depends on that. Resources come next because every other system makes or spends them. If resources are designed last, the economy won't balance. Trade comes late because it depends on decisions about what is on-chain.

**Where things actually stand:** the mining part of Resources (02) has moved ahead of the overview through user additions. The overview's open questions are still unanswered, so 02 can't go past `Draft` until they are: what is on-chain, and what an Imp is in the game, change how resources work.

---

## Pass plan

The pass plan can change. Only the user changes it.

### Pass 0: Setup ✔
- [x] Folder structure, rules for Claude, doc templates
- [x] First draft of the overview, with open questions marked
- [x] Pass 0 report

### Pass 1: Foundations (overview)
**Goal:** settle the decisions every other doc depends on.
- [ ] Answer the overview's open questions (NFT role, on-chain scope, earning, audience, platform)
- [ ] Record the answers in `DECISIONS.md`
- [ ] Lock the core loop and the systems map
- [ ] Overview → `In review`

### Pass 2: Economy spine (resources, then activities)
**Goal:** define what exists in the economy and how players get it.
- [ ] Resources: list, sources, sinks, rarity tiers, which are tradeable
  - [x] Ten ore tiers, their ore, ingot and gem pictures (D-005)
  - [x] Which pickaxe mines which ore, and pickaxe craft costs (D-006)
  - [x] First playable reward: copper ore for 5 energy, 10-second vein respawn (D-007)
  - [ ] Energy: same cost for every ore, 12-hour reset (in open PR #13 as D-008 and D-009, not on `main` yet)
  - [ ] Gem chance per ore (open question, D-005)
  - [ ] Smelter: how ore becomes ingots (you are working on this)
  - [ ] How players get hilts (Ash Wood, Oak Wood, Void, Cosmic)
  - [ ] Whether a stronger pickaxe can also mine a weaker ore (open question in 02)
  - [ ] Selling, and other crafting and blacksmithing
  - [ ] What the prestige icons are for
  - [ ] Sinks for every resource
- [ ] Activities: what players do and what each activity outputs
- [ ] Consistency check against the overview

### Pass 3: Play (skirmish and games)
**Goal:** define the two systems players spend most of their time in.
- [ ] Skirmish: battle rules, stats, types, progression, PvE/PvP
- [ ] Games: minigame list, rewards, how they plug into the loop
- [ ] Consistency check against resources

### Pass 4: Trade
**Goal:** define how value moves between players.
- [ ] Trade: in-game vs marketplace, fees and sinks, anti-abuse
- [ ] Consistency check across all docs

### Pass 5+: Review passes
**Goal:** tighten, fix mismatches and get sign-off.
- [ ] Repeat until you mark every doc `Signed off`

### Build roadmap (started early, at your request on 2026-10-12)
The build roadmap was planned for after sign-off. You asked for it now, because the game is already being built alongside the design. It lives in [BUILD-ROADMAP.md](BUILD-ROADMAP.md). A build step can only use what is **Decided** here. Anything still open is marked as blocked there.

---

## To reconcile (not on GitHub)

One collaborator has local, uncommitted Pass 1 work that was never pushed. It was written against the old decision log, and it clashes with what is now on `main`:

- `docs/gathering/01-mining.md` (a mining design doc), `reports/2026-10-11-pass-1.md`, and edits to `00-overview.md`, `01-activities.md`, `DECISIONS.md` and this file.
- Its decisions are numbered D-005 to D-043, but `main` already uses D-005 to D-007 (and PR #13 adds D-008 and D-009).
- Some of them contradict `main`. For example, the local D-042 and D-043 say any pickaxe can mine any ore, but D-006 names one pickaxe per ore. The local D-023 uses cooldowns, but `main` uses energy.

`main` is the source of truth for now. Before any of that work is used, the two of you agree which rules win. Then the local decisions are renumbered after the last one on `main`, and any that change a decision on `main` are entered as **supersedes**.

---

## Current pass

**Pass 1: Foundations.** Waiting on your answers to the open questions in [the overview](docs/00-overview.md#open-questions). The mining resources in 02 have moved ahead through user additions (see the pass log).

---

## Pass log

| Pass | Dates | Goal | Outcome | Report |
|---|---|---|---|---|
| 0 | 2026-10-11 | Setup | Structure, rules and overview draft created | [report](reports/2026-10-11-pass-0.md) |
| User additions | 2026-10-12 | Mining resources | Ore tiers (D-005), pickaxes (D-006) and the first copper reward (D-007) recorded in 02. 02 moved to `Draft`. | No report |
| Roadmap update | 2026-10-12 | Bring this file up to date | Doc status and Pass 2 progress updated to match `main`. Build roadmap started. Unpushed local work listed under "To reconcile". | No report |
