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

## All documents, by importance

Every Markdown file in the repo, most important first. The order is **Proposed**. You can change it. When a `.md` file is added or removed, update this list in the same PR.

| # | Document | What it is | Status |
|---|---|---|---|
| 1 | [DECISIONS.md](DECISIONS.md) | Every decision you have made. The source of truth: anything else that disagrees with it is wrong. | Living log |
| 2 | [docs/00-overview.md](docs/00-overview.md) | The game's intent, core loop and the role of the NFT. Every other doc must agree with it. | Draft |
| 3 | [ROADMAP.md](ROADMAP.md) (this file) | The design passes and the status of every design doc. | Living |
| 4 | [BUILD-ROADMAP.md](BUILD-ROADMAP.md) | The playable game: what is built, what is in review, and the next milestones. | Living |
| 5 | [docs/02-resources.md](docs/02-resources.md) | Resources and economy: ore tiers, pickaxes, energy, item pictures. The most filled-in design doc. | Draft |
| 6 | [ART-DIRECTION.md](ART-DIRECTION.md) | The art style: cartoon stylised 3D for the world, 2D pixel art for menus and inventory, the 32 reference listings, and a checklist for every 3D asset. | Draft |
| 7 | [docs/01-activities.md](docs/01-activities.md) | What players do in the world, and what each activity produces. | Not started |
| 8 | [docs/05-skirmish.md](docs/05-skirmish.md) | The Pokémon-style battle system. | Not started |
| 9 | [docs/03-games.md](docs/03-games.md) | Minigames and their rewards. | Not started |
| 10 | [docs/04-trade.md](docs/04-trade.md) | How value moves between players. | Not started |
| 11 | [../CLAUDE.md](../CLAUDE.md) | Repo rules for Claude: staging branches, draft PRs, "commit to main", backups and rollback. | Rules |
| 12 | [CLAUDE.md](CLAUDE.md) | Design rules for Claude: don't deviate, quality first, statuses, how to run a pass, reports. | Rules |
| 13 | [../README.md](../README.md) | How to run the game, and its controls. | Reference |
| 14 | [reports/2026-10-13-mining-roadmap.md](reports/2026-10-13-mining-roadmap.md) | Report: the mining build roadmap completed (M3–M5) and D-010 to D-013. | Done |
| 15 | [reports/2026-10-11-pass-0.md](reports/2026-10-11-pass-0.md) | Report for Pass 0 (setup). | Done |
| 16 | [reports/_TEMPLATE.md](reports/_TEMPLATE.md) | The template every report follows. | Template |

**Why this order:** decisions and the overview come first because every other doc must agree with them. The two roadmaps come next because they say what to work on. Then come the system docs, in the order they will be worked on. The art direction sits after Resources because every 3D asset already being built (veins, furnace, anvil, cave) must follow it. Resources is first because every other system makes or spends resources. The two `CLAUDE.md` files and the README tell people and Claude how to work in the repo, but they don't define the game. Reports are history.

**Local only, not on GitHub:** `docs/gathering/01-mining.md` and `reports/2026-10-11-pass-1.md`. They exist only in one collaborator's folder and aren't in this list until they are reconciled and merged (see [To reconcile](#to-reconcile-not-on-github)).

---

## Doc status

Each design system is a main row. Its sub categories (↳ rows) are the topics inside it, taken only from what is on `main`. A system with nothing written yet has no sub rows. New sub rows are added when a topic is decided or a section is written.

For a main row, **Status** is the doc's status. For a sub row, it is the topic's label: **Decided** (with the D-number), **Proposed** (Claude's suggestion, waiting for you), **Open question**, or **Not decided** (you've said it's still to come).

| # | Doc / topic | Status | Still open | Depends on | Last pass |
|---|---|---|---|---|---|
| **00** | **[Overview](docs/00-overview.md)** | **Draft** | Open questions 1–6 | n/a | 0 |
| 00.1 | ↳ One-line pitch | Open question | A working version is Proposed | | |
| 00.2 | ↳ Design pillars | Proposed | Your call on all four | | |
| 00.3 | ↳ Core loop | Proposed | Question 6 | | |
| 00.4 | ↳ Systems map | Decided (D-002) for the five systems | Each system's job is Proposed | | |
| 00.5 | ↳ Target player and platform | Open question | Questions 4 and 5 | | |
| 00.6 | ↳ Scope guardrails | Proposed | Your call | | |
| **01** | **[Activities](docs/01-activities.md)** | **Not started** | Everything | 00, 02 | 0 |
| 01.1 | ↳ Mining | Decided in 02 (D-005 to D-013), and built | Not written up in 01 yet | | |
| **02** | **[Resources & economy](docs/02-resources.md)** | **Draft** | Sections 1, 2 and 5–8 are empty | 00 | 0, then user additions (D-005 to D-013) |
| 02.1 | ↳ Ore tiers and item pictures | Decided (D-005) | Drawn 3D veins for tiers 3–10 (the build recolours the copper vein) | | |
| 02.2 | ↳ Pickaxes: which mines which ore, and craft costs | Decided (D-006, D-011) | What the Stellarite pickaxe is for (a stronger pickaxe also mines every lower ore) | | |
| 02.3 | ↳ Mining rewards and vein respawn | Decided (D-007, D-010) | n/a | | |
| 02.4 | ↳ Energy | Decided (D-008, D-009) | Whether the reset is one shared time zone for every player | | |
| 02.5 | ↳ Inventory | Decided (D-008) | Saving it between visits (build M6) | | |
| 02.6 | ↳ Gems | Decided (D-005, D-012) | n/a | | |
| 02.7 | ↳ Smelting: ore into ingots | Not decided. The build uses a test recipe (D-013) | You are working on it. What Coal is for. | | |
| 02.8 | ↳ Hilts | Open question. The build supplies them free as a test (D-013) | How players get each hilt | | |
| 02.9 | ↳ Selling, and other crafting and blacksmithing | Not decided | All of it | | |
| 02.10 | ↳ Prestige icons | Not decided | What they are for | | |
| 02.11 | ↳ Sources, sinks, currencies, tradeability | Open question | The six questions at the end of 02 | | |
| **03** | **[Games](docs/03-games.md)** | **Not started** | Everything | 00, 02 | 0 |
| **04** | **[Trade system](docs/04-trade.md)** | **Not started** | Everything | 00, 02 | 0 |
| **05** | **[Skirmish system](docs/05-skirmish.md)** | **Not started** | Everything | 00, 02 | 0 |

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
  - [x] Energy: 5 per mine for every ore, reset every 12 hours from midnight; 6×8 inventory (D-008, D-009)
  - [x] Tin gives tin ore (D-010)
  - [x] Gem chance per ore: 10% down to 1% by tier (D-012)
  - [x] A stronger pickaxe also mines every weaker ore (D-011)
  - [ ] Energy reset: one shared time zone, or each player's own clock (open question)
  - [ ] Smelter: how ore becomes ingots (you are working on this; the build uses a test recipe, D-013)
  - [ ] How players get hilts (Ash Wood, Oak Wood, Void, Cosmic) (the build supplies them free as a test, D-013)
  - [ ] What the Stellarite pickaxe is for, and what Coal is for
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

One collaborator has local Pass 1 work that was never pushed. On 2026-10-13 it was saved on a **local-only** branch, `backup/local-pass-1-wip`, so it isn't lost. It was written against the old decision log, and it clashes with what is now on `main`:

- `docs/gathering/01-mining.md` (a mining design doc), `reports/2026-10-11-pass-1.md`, and edits to `00-overview.md`, `01-activities.md`, `DECISIONS.md` and this file.
- Its decisions are numbered D-005 to D-043, but `main` already uses D-005 to D-013.
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
| User additions | 2026-10-12 | Energy and inventory | Same energy cost for every ore, 12-hour reset from midnight, 6×8 inventory (D-008, D-009), via PR #13. | No report |
| Roadmap update | 2026-10-12 | Bring this file up to date | Doc status and Pass 2 progress updated to match `main`. Build roadmap started. Unpushed local work listed under "To reconcile". All 14 `.md` files listed by importance. Sub categories added under each design system in Doc status. | No report |
| User additions | 2026-10-13 | Complete the mining roadmap | Tin reward (D-010), stronger pickaxes mine weaker ores (D-011), gem chance (D-012), test smelting and hilt values (D-013). Build milestones M3–M5 built and in review (PR #16). | [report](reports/2026-10-13-mining-roadmap.md) |
| User additions | 2026-10-14 | Art direction | `ART-DIRECTION.md` created from your 32 reference listings, as `Draft`. Cartoon stylised 3D world (D-014). 2D pixel art for menus and inventory, 3D for anything in the world (D-015). The style rules are Proposed; six open questions at the end of the doc. | No report |
| User additions | 2026-10-15 | Art direction answers | Implingz are already done and left out (D-016). Veins can differ in colour (D-017). References are style only; assets are made by us (D-018). Veins should look like Stylized Ore, which you own a licence for (D-019). | No report |
