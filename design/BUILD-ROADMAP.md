# IMPLINGZ: build roadmap

> Claude: read `design/CLAUDE.md` before working from this file. Code changes still follow the root `CLAUDE.md`: a `staging/` branch and a draft PR for every change.

This file tracks the **playable game** in this repo: what is built, what is in review, and what comes next. The design docs are tracked in [ROADMAP.md](ROADMAP.md).

## Rules

- **Build only what is decided.** A step can use a rule only if it is in `DECISIONS.md`. If a step needs something that isn't decided, it is **Blocked**, and the blocking question goes to the design roadmap. Test values are fine, but label them as test values in the code and the PR, as the energy refill was.
- **The design wins over the prototype.** If the game and a design doc disagree, the doc is right, and the gap is listed under [Gaps](#gaps-between-the-game-and-the-design).
- **One milestone at a time.** Finish or park the current one before starting the next.
- Update this file in the same PR as the change it describes.

**Statuses:** `Done` (merged to `main`) · `In review` (open PR) · `Next` · `Blocked` (waiting on a decision) · `Later`.

The milestone order below is **Proposed**. You can reorder it.

---

## Milestones

| # | Milestone | Status | Waiting on |
|---|---|---|---|
| M0 | Walk scene | Done | n/a |
| M1 | First mining loop | Done | n/a |
| M2 | Inventory and energy | In review (PR #13) | Your review of #13 |
| M3 | All ten ores in the scene | Next (partly blocked) | 3D vein models; the pickaxe question |
| M4 | Gems | Blocked | Gem chance (D-005) |
| M5 | Smelting and pickaxe crafting | Blocked | Smelter recipes; hilt sources |
| M6 | Saving and accounts | Blocked | Overview questions 1–3 |
| M7 | Imps and the NFT | Blocked | Overview questions 1–3 |
| Later | Skirmish, games, trade, shared chat | Later | Design docs 03–05 |

---

### M0: Walk scene: Done
- [x] Platform, character, walk cycle, third-person camera (drag to look, scroll to zoom)
- [x] Ore rocks with collision (PR #4)
- [x] Jump, and an emote panel with six emotes (PR #5)

### M1: First mining loop: Done
- [x] Pickaxe model from Blender, with Stone, Bronze and Iron sprite skins (PR #7)
- [x] Mine a rock with F: three swings, then the rock breaks (PR #7)
- [x] Game HUD: coins and energy display, profile, global chat panel, settings, menus moved to the centre (PR #8)
- [x] 48×48 item art for all ores, ingots, gems and prestige icons (PR #9, D-005)
- [x] Copper ore vein placed in the scene (PR #11)
- [x] Copper vein gives 1 copper ore and costs 5 energy. Veins grow back after 10 seconds (PR #12, D-007)

### M2: Inventory and energy: In review (PR #13)
- [ ] Inventory menu: a 6×8 grid. Pickaxes first (click one to hold it), then mined items with counts. The top-left slots show only the held tool.
- [ ] Every mine costs 5 energy. Energy resets to 100 every 12 hours, with no slow refill. Saved in the browser. (D-008 and D-009 in the PR)
- [ ] Soil floor texture, square profile picture, chat width lined up with the HUD
- [ ] **Check before merging:** the PR description says the reset is at 00:00 and 12:00 **UTC**, but the code uses the **player's own clock**, and the doc lists the time zone as an open question. Decide which one is meant.

### M3: All ten ores in the scene: Next (partly blocked)
Decided: the ten tiers and the ore each gives (D-005), and the one pickaxe named for each ore (D-006).
- [ ] Give Tin a reward (1 tin ore), the same as copper. **Open question:** D-007 says "Tin gives nothing yet". You need to say when it should.
- [ ] A 3D vein for each of tiers 3–10 (Iron to Stellarite). **Open question:** which vein model is which tier is not decided (02, section 4).
- [ ] Only let the named pickaxe mine each ore (D-006). **Blocked:** whether a stronger pickaxe can also mine a weaker ore is an open question in 02. Today any skin can mine any rock.
- [ ] Pickaxe skins for all ten pickaxes in the design (Stone, Bronze, Iron, Steel, Gold, Obsidian, Mithril, Adamantite, Void, Stellarite). The game has three.

### M4: Gems: Blocked
- [ ] Mining an ore sometimes also gives its gem (D-005). **Blocked:** the gem chance is not decided. Don't invent one.

### M5: Smelting and pickaxe crafting: Blocked
Decided: what each crafted pickaxe costs in ingots and hilts (D-006).
- [ ] Smelter: ore to ingot. **Blocked:** you are still working on the smelter recipes.
- [ ] Craft a pickaxe from ingots and a hilt, using the D-006 table exactly. **Blocked:** how players get hilts is not decided, and no hilt picture exists yet.
- [ ] Owning a pickaxe unlocks it in the inventory, instead of the Q skin cycle.

### M6: Saving and accounts: Blocked
- [ ] Keep the inventory between visits. Today only energy is saved, and only in this browser (PR #13).
- [ ] Coins on the HUD: today the counter is fixed at 0, and nothing earns or spends coins.
- **Blocked:** where player data lives (browser, server, or on-chain) depends on the overview's open questions 1–3.

### M7: Imps and the NFT: Blocked
- [ ] Use the player's Imp as their character, and anything else the NFT does in the game.
- **Blocked:** the overview's open questions 1–3 (what an Imp is in the game, whether non-holders can play, what goes on-chain).

### Later
- Skirmish, games and trade, once their design docs (03–05) exist.
- Shared chat: the chat panel works only on your own screen. There is no server, so other players don't see messages.
- Other gathering skills.

---

## Gaps between the game and the design

These are known differences. They don't need a fix until their milestone comes up.

| Game today | Design | Milestone |
|---|---|---|
| Three pickaxe skins (Stone, Bronze, Iron), cycled with Q | Ten pickaxes. Each ore has one named pickaxe (D-006). | M3 |
| Any pickaxe mines any rock | One named pickaxe per ore (D-006) | M3 |
| Tin veins give nothing | Tin is tier 1 and gives tin ore (D-005), but "Tin gives nothing yet" (D-007) | M3 |
| Energy refills slowly (test value: 1 every 10 seconds) | Fixed 12-hour reset (D-008, in PR #13) | M2 |
| `README.md` says energy slowly refills | Will be wrong once PR #13 merges | M2 |
| Overview section 2 says jump and emotes are "work in progress" | They are built (PR #5) | Design Pass 1 |

---

## Log

| Date | Change |
|---|---|
| 2026-10-12 | Build roadmap created from `main` at `da2a51a` and open PR #13. |
