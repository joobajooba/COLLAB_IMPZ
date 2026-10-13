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
| M2 | Inventory and energy | Done | n/a |
| M3 | All ten ores in the scene | In review (PR #16) | Your review; drawn art for veins 3–10 and pickaxes 4–10 |
| M4 | Gems | In review (PR #16) | Your review |
| M5 | Smelting and pickaxe crafting | In review (PR #16), on test values | Real smelter recipe and hilt sources (D-013) |
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

### M2: Inventory and energy: Done
- [x] Inventory menu: a 6×8 grid. Pickaxes first (click one to hold it), then mined items with counts. The top-left slots show only the held tool. (PR #13, D-008)
- [x] Every mine costs 5 energy. Energy resets to 100 at 00:00 and 12:00, with no slow refill. Saved in the browser. (PR #13, D-008, D-009)
- [x] Soil floor texture, square profile picture, chat width lined up with the HUD (PR #13)
- **Open question:** the reset uses each player's own clock. Whether it should be one shared time zone for every player is not decided (02, section 4).

### M3: All ten ores in the scene: In review (PR #16)
Decided: the ten tiers and the ore each gives (D-005, D-010), and which pickaxe mines which ore (D-006, D-011).
- [x] Tin gives 1 tin ore, the same as copper (D-010).
- [x] A vein for each of tiers 3–10 (Iron to Stellarite), with a name tag that shows as you walk up. **Test art:** each is the copper vein, with its rock and crystals recoloured from the ore's picture. Drawn models for each tier can replace them later.
- [x] The floor is now 16 m across (was 10 m) to fit them. Low tiers sit near the start, high tiers around the edge. Copper has a second vein. **Test layout.**
- [x] A pickaxe mines its named ore and every ore below (D-011). The prompt says which pickaxe you need, for example "Needs a Bronze pickaxe".
- [x] Skins for all ten pickaxes. Steel to Stellarite are **placeholders**: their sprites are the iron sprite recoloured with each ingot's colours.
- [x] Every pickup shows a short "+1 Iron ore" line.

### M4: Gems: In review (PR #16)
- [x] Mining an ore sometimes also gives its gem: 10% for Tin, down to 1% for Stellarite (D-012). Gem pickups are highlighted.

### M5: Smelting and pickaxe crafting: In review (PR #16), on test values
Decided: what each crafted pickaxe costs in ingots (D-006). Test values until you decide the rest (D-013).
- [x] Furnace in the scene: F opens it. **Test recipe:** 2 ore make 1 ingot. Coal can't be smelted.
- [x] Blacksmith's anvil in the scene: F opens it. Crafts each pickaxe for the D-006 ingots exactly. Shows what you have and what you need. **Test:** the blacksmith supplies the hilt.
- [x] Players start with only the Stone pickaxe. Crafting adds a pickaxe and puts it in your hand. Q cycles the pickaxes you own.
- [x] **Test tools** in Settings, so reviewers can try every tier quickly: refill energy, +20 of every ore, unlock all pickaxes. Remove before launch.
- [ ] Replace the test smelter recipe and free hilts when you decide them.

### Mining: what's left after M5
Everything that is decided for mining is now built. These are the open items:
- The real smelter recipe and how players get hilts (D-013).
- Drawn 3D veins for tiers 3–10, and drawn sprites for the Steel to Stellarite pickaxes.
- What the Stellarite pickaxe is for (02, Pickaxes).
- What Coal is for: it has no ingot and is in no recipe.
- Whether the energy reset uses one shared time zone (02, section 4).
- Saving the inventory between visits (M6).

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
| Furnace: 2 ore make 1 ingot. The blacksmith supplies hilts. | Not decided (D-013). These are test values. | M5 |
| Smelting and crafting cost no energy | Not decided | M5 |
| The inventory and owned pickaxes reset when the page reloads. Only energy is saved. | Not decided | M6 |
| Overview section 2 says jump and emotes are "work in progress" | They are built (PR #5) | Design Pass 1 |

---

## Log

| Date | Change |
|---|---|
| 2026-10-12 | Build roadmap created from `main` at `da2a51a` and open PR #13. |
| 2026-10-12 | PR #13 merged: M2 marked Done. Energy gap rows removed. |
| 2026-10-13 | PR #16: M3, M4 and M5 built from D-010 to D-013 and moved to In review. Mining's remaining open items listed. |
