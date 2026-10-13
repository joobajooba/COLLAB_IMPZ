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
| 00 | [Overview](docs/00-overview.md) | Draft | n/a | 1 |
| 01 | [Activities](docs/01-activities.md) | Not started | 00, 02 | 0 |
| 01.1 | ↳ [Gathering 1: Ores & mining](docs/gathering/01-mining.md) | **In review** | 00, 02 | 1 |
| 01.2 | ↳ Gathering 2: Trees & lumbering | Not started | 01.1 | n/a |
| 01.3 | ↳ Gathering 3: Fishing | Not started | 01.1 | n/a |
| 01.4 | ↳ Gathering 4: Hunting animals | Not started | 01.1 | n/a |
| 01.5 | ↳ Gathering 5+: Farming & foraging (order not set) | Not started | 01.1 | n/a |
| 02 | [Resources & economy](docs/02-resources.md) | Not started | 00 | 0 |
| 03 | [Games](docs/03-games.md) | Not started | 00, 02 | 0 |
| 04 | [Trade system](docs/04-trade.md) | Not started | 00, 02 | 0 |
| 05 | [Skirmish system](docs/05-skirmish.md) | Not started | 00, 02 | 0 |

**Mining is the current focus (D-017).** Your brief now gives the overview its shape, so it's no longer paused. Mining sets the pattern (vein states, levels, tools, rare finds) that the later gathering phases reuse.

**Why the remaining order:** the overview decides what the NFT is and what the core loop is. Every system depends on that. Resources come next because every other system makes or spends them. If resources are designed last, the economy won't balance. Trade comes late because it depends on decisions about what is on-chain.

---

## Pass plan

The plan can change. Only the user changes it. Passes are numbered when they actually run (see the pass log).

### Pass 0: Setup ✔
- [x] Folder structure, rules for Claude, doc templates
- [x] First draft of the overview, with open questions marked
- [x] Pass 0 report

### Pass 1: Gathering phase 1: ores & mining
**Goal:** a mining design you're happy to build from, and a pattern for the other gathering skills.
- [x] First draft of `docs/gathering/01-mining.md`
- [x] Consolidated into a clean design document → **In review** (D-005 to D-043 applied)
- [ ] You review it and answer its open questions
- [ ] Revise until you mark it `Signed off`
- [ ] (Optional) build the smallest first version in the prototype and playtest it

### Gathering phases 2–5 (one pass each, in order)
- Phase 2: Trees & lumbering
- Phase 3: Fishing
- Phase 4: Hunting animals
- Phase 5+: Farming and foraging (order to be decided)

### Foundations (overview), in progress alongside mining
**Goal:** settle the decisions every other doc depends on.
- [x] Your brief recorded: collection, vision, core loop, technical needs (D-007 to D-017)
- [x] Your notes recorded: Robinhood Chain, claim model, per-Imp allowance, multisig upgrades, staking/Imp Coins, cooldowns (D-018 to D-023)
- [x] Accounts, customiser, party, ~3-month level curve recorded (D-024 to D-028)
- [ ] Answer the overview's remaining open questions (non-holders, combat, minigames, platform, staking, Imp Coins, boost fees)
- [ ] Record the answers in `DECISIONS.md`
- [ ] Lock the core loop and the systems map
- [ ] Overview → `In review`

### Economy spine (resources, then activities)
**Goal:** define what exists in the economy and how players get it.
- [ ] Resources: list, sources, sinks, rarity tiers, which are tradeable
- [ ] Activities: what players do and what each activity outputs
- [ ] Consistency check against the overview

### Play (skirmish and games)
**Goal:** define the two systems players spend most of their time in.
- [ ] Skirmish: battle rules, stats, types, progression, PvE/PvP
- [ ] Games: minigame list, rewards, how they plug into the loop
- [ ] Consistency check against resources

### Trade
**Goal:** define how value moves between players.
- [ ] Trade: in-game vs marketplace, fees and sinks, anti-abuse
- [ ] Consistency check across all docs

### Review passes
**Goal:** tighten, fix mismatches and get sign-off.
- [ ] Repeat until you mark every doc `Signed off`

### After sign-off (not started, needs your go-ahead)
Turn the signed-off design into a build roadmap: prototype milestones in this repo.

---

## Current pass

**Pass 1: Gathering phase 1, ores & mining.** The mining design doc is **In review**. Waiting on your progression diagram, the doc's open questions, and your review of [the mining doc](docs/gathering/01-mining.md) and [the updated overview](docs/00-overview.md), and their open questions.

---

## Pass log

| Pass | Dates | Goal | Outcome | Report |
|---|---|---|---|---|
| 0 | 2026-10-11 | Setup | Structure, rules and overview draft created | [report](reports/2026-10-11-pass-0.md) |
| 1 | 2026-10-11 → | Ores & mining | Mining draft written; overview rewritten from your brief and notes; waiting on your review | [report](reports/2026-10-11-pass-1.md) |
