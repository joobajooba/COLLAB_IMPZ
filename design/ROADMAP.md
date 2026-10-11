# IMPLINGZ: design roadmap

> Claude: read `design/CLAUDE.md` before working from this file.

## How this works

The design is built in **passes** (sprints). Each pass has a goal and a short list of items. At the end of every pass there is:

1. **A report** in `reports/`: what was done and what needs your decision.
2. **A review by you**: you read the docs and the report, answer the open questions, and either approve them or ask for changes.
3. **The next pass**, which picks up your feedback.

Passes keep going until **you** mark every doc `Signed off`. Nothing is finished just because a pass ended.

**Statuses:** `Not started` → `Draft` → `In review` → `Signed off` (only you can set `Signed off`).

---

## Doc status

| # | Doc | Status | Depends on | Last pass |
|---|---|---|---|---|
| 00 | [Overview](docs/00-overview.md) | Draft | n/a | 0 |
| 01 | [Activities](docs/01-activities.md) | Not started | 00, 02 | 0 |
| 02 | [Resources & economy](docs/02-resources.md) | Not started | 00 | 0 |
| 03 | [Games](docs/03-games.md) | Not started | 00, 02 | 0 |
| 04 | [Trade system](docs/04-trade.md) | Not started | 00, 02 | 0 |
| 05 | [Skirmish system](docs/05-skirmish.md) | Not started | 00, 02 | 0 |

**Why this order:** the overview decides what the NFT is and what the core loop is. Every system depends on that. Resources come next because every other system makes or spends them. If resources are designed last, the economy won't balance. Trade comes late because it depends on decisions about what is on-chain.

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

### After sign-off (not started, needs your go-ahead)
Turn the signed-off design into a build roadmap: prototype milestones in this repo.

---

## Current pass

**Pass 1: Foundations.** Waiting on your answers to the open questions in [the overview](docs/00-overview.md#open-questions).

---

## Pass log

| Pass | Dates | Goal | Outcome | Report |
|---|---|---|---|---|
| 0 | 2026-10-11 | Setup | Structure, rules and overview draft created | [report](reports/2026-10-11-pass-0.md) |
