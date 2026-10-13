# Mining: design document
**IMPLINGZ · Gathering phase 1 · Chapter 2**

| Status | Last pass | Depends on |
|---|---|---|
| In review | 1 | [00-overview](../00-overview.md), [02-resources](../02-resources.md) |

> **Labels:** **Decided** = the user decided it (D-number in [`DECISIONS.md`](../../DECISIONS.md)) · **Proposed** = Claude's suggestion, waiting for the user · **Open** = not settled.
> All numbers marked Proposed are starting values for playtesting, not final balance. Everything lives in game data so it can be retuned without code changes (D-015).

---

## 1. Summary
Players load their customised Imp, walk up to an ore vein and mine it. **Every ore can be mined with any pickaxe, and mining always pays out.** A better pickaxe just makes it much faster. Nuggets are smelted at a **furnace** into ingots. Ingots are handed to an **NPC blacksmith**, who crafts better pickaxes. Crafted pickaxes are **NFTs** with a **fixed maximum supply**, first come first served. When the supply runs out, **Chapter 2 ends**.

```
 Free stone pickaxe
        │  can mine ANY ore (slowly on hard ores)
        ▼
   Ore vein ──► Nuggets ──(furnace)──► Ingots ──(blacksmith)──► Better pickaxe (NFT, capped supply)
                                                                   │
                         mine harder ores much faster ◄─────────────┘
```

## 2. Player journey
1. **Connect wallet.** One account per wallet (D-024). The game reads every Imp the wallet holds.
2. **Build your Imp.** In the 3D customiser, pick traits from the Imps you own to make one **main Imp** (D-025). Choose up to 3–5 other Imps as your **party** (D-026, D-031).
3. **Start with a stone pickaxe.** It's free and already in your inventory (D-033).
4. **Mine.** Walk to a vein and press E. Your Imp swings and a progress bar fills. When it's full you get a **nugget** and XP (D-043).
5. **Smelt.** Take nuggets to the **furnace** and turn them into **ingots** (D-033).
6. **Craft.** Give ingots to the **blacksmith** and choose a pickaxe from its menu, if any are left (D-039, D-040).
7. **Equip.** The new pickaxe is minted to your wallet as an NFT (D-037). Equip it in the **character menu** and it shows on your Imp (D-035).
8. **Mine faster, repeat.** Harder ores now take far less time. Or sell the pickaxe on OpenSea.
9. **Chapter end.** When the blacksmith's supply is gone, Chapter 2 ends (D-041).

## 3. Core rules (all Decided)
| Rule | Decision |
|---|---|
| Any pickaxe can mine any ore. Nothing is locked. | D-042 |
| Mining always succeeds in the end. Pickaxe vs ore tier only sets **how long** it takes, and it gets exponentially longer the further the pickaxe is below the ore. | D-043 |
| There are **10 ore tiers**. | D-042 |
| Tier 10 pickaxe on tier 10 ore ≈ **10 minutes**. Stone on tier 10 ≈ **24 hours**. | D-043 |
| Mining gives nuggets → furnace → ingots → blacksmith → items. | D-033, D-039 |
| Nuggets and ingots live **only in the database**, not on-chain. | D-036 |
| Crafted items are **NFTs** (open edition, many copies) on Robinhood Chain, sellable on OpenSea. | D-018, D-037 |
| Every item has a **fixed maximum supply**, first come first served (e.g. 200 of the top pickaxe). | D-040 |
| Chapter 2 ends when supply runs out. | D-041 |
| Energy and cooldowns are **per account**. Imp Coins or ETH can be spent to reduce them. | D-023, D-024 |
| Mining level is **per account**, separate from other skills, and adds to an overall account level. | D-032 |
| Level 50 should take **~3 months** of maximum daily play. | D-028 |
| Party Imps give a bonus by Tier: 1 = 1%, 2 = 2%, 3 = 3% each. Max 5 party Imps, plus the main Imp. | D-026, D-029, D-031 |
| Players can run several wallets as several accounts. Accepted. | D-030 |

## 4. The mining action
**Proposed**
1. **Approach.** Within ~1 m of a vein a prompt appears: **"E: Mine \<ore\>"**, showing the expected time with your current pickaxe (e.g. "~4 m 30 s").
2. **Swing.** Pressing E starts a swing loop: one swing every **2.4 s**, and each swing costs **1 energy** (section 10). Moving, jumping or emoting stops it.
3. **Progress bar.** Each swing fills a bar above the vein. When it's full you get **1 nugget + XP**, guaranteed (D-043). The bar then resets for the next nugget.
4. **Sweet spot (optional).** A ring pulses on each swing. Pressing E at the right moment makes that swing count for **+50% progress**. Ignoring it is fine; mining is just slower. This rewards attention and makes simple bots less efficient.
5. **Saved progress.** Your progress on a vein is saved per player. You can leave and come back days later and carry on. *This is essential for long digs.*
6. **Depletion & respawn.** Each vein holds a few nuggets (section 5). When it's empty it looks depleted, then refills after its respawn time.

**Vein states**
```
Ready ──(mine)──► Being mined ──(last nugget)──► Depleted ──(respawn timer)──► Ready
```

**Personal veins (Proposed):** each player has their own progress and depletion on every vein. Nobody can steal your rock and there's no griefing. The trade-off is no competition for rocks. *(Open Q10.)*

## 5. Ores
**Decided:** 10 tiers (D-042). **Waiting on your progression diagram** for names and smelting recipes. The table below is a **Proposed** placeholder that the maths in sections 6 and 9 is built on.

| Tier | Ore (placeholder) | Time per nugget, matching pickaxe | XP per nugget | Nuggets per vein | Respawn |
|---|---|---|---|---|---|
| 1 | Copper / Tin | 15 s | 9 | 5 | 10 s |
| 2 | Iron | 23 s | 16 | 5 | 15 s |
| 3 | *Tier 3* | 34 s | 27 | 4 | 20 s |
| 4 | *Tier 4* | 51 s | 46 | 4 | 30 s |
| 5 | *Tier 5* | 1 m 17 s | 77 | 4 | 45 s |
| 6 | *Tier 6* | 1 m 56 s | 128 | 3 | 60 s |
| 7 | *Tier 7* | 2 m 55 s | 211 | 3 | 90 s |
| 8 | *Tier 8* | 4 m 24 s | 344 | 3 | 120 s |
| 9 | *Tier 9* | 6 m 38 s | 558 | 2 | 150 s |
| 10 | *Tier 10* | 10 m | 900 | 2 | 180 s |

**Why these XP numbers:** XP per nugget is set so that **mining your own pickaxe's tier gives the best XP per minute** (0.6 XP/s at tier 1, rising to 1.5 XP/s at tier 10). Easier ores are quicker but give less XP. Harder ores are a long dig for a nugget that's worth more. Upgrading your pickaxe always pays off.

## 6. Mining time
**Decided (D-043):** pickaxe tier vs ore tier sets the time per nugget, exponentially.

**Proposed formula:**
```
matched time (pickaxe tier = ore tier):  15 s at tier 1, ×1.5 per tier  →  10 min at tier 10
pickaxe BELOW the ore:  × 1.74 for every tier below   (9 tiers below: 10 min → 24 h)
pickaxe ABOVE the ore:  × 0.95 for every tier above   (never faster than 80% of matched)
party bonus:            faster by the party's total %  (section 8)
sweet spot:             +50% progress on each swing you hit
```

**Time per nugget** (no party, no sweet spot; the matching tier is in **bold**):

| Pickaxe ↓ / Ore → | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 (stone) | **15s** | 39s | 1.7m | 4.5m | 12m | 31m | 1.3h | 3.5h | 9.2h | 24h |
| 2 | 14s | **23s** | 59s | 2.6m | 6.8m | 18m | 46m | 2.0h | 5.3h | 14h |
| 3 | 14s | 21s | **34s** | 1.5m | 3.9m | 10m | 27m | 1.2h | 3.0h | 8.0h |
| 4 | 13s | 20s | 32s | **51s** | 2.2m | 5.9m | 15m | 40m | 1.7h | 4.6h |
| 5 | 12s | 19s | 31s | 49s | **1.3m** | 3.4m | 8.8m | 23m | 1.0h | 2.6h |
| 6 | 12s | 18s | 29s | 46s | 1.2m | **1.9m** | 5.1m | 13m | 35m | 1.5h |
| 7 | 12s | 18s | 28s | 44s | 1.2m | 1.8m | **2.9m** | 7.7m | 20m | 52m |
| 8 | 12s | 18s | 27s | 42s | 1.1m | 1.8m | 2.8m | **4.4m** | 12m | 30m |
| 9 | 12s | 18s | 27s | 41s | 1.0m | 1.7m | 2.6m | 4.2m | **6.6m** | 17m |
| 10 (top) | 12s | 18s | 27s | 41s | 1.0m | 1.6m | 2.5m | 4.0m | 6.3m | **10.0m** |

- **Every pickaxe tier matters:** each one mines harder ores ~1.7× faster than the tier below, so demand spreads across the whole pickaxe collection.
- **Nobody is blocked:** a stone pickaxe can dig out a tier 10 nugget; it just takes a long time.

**⚠ Open Q1: is this active time or real time?**
- **Proposed: active time.** The bar only fills while you're swinging, which uses energy. This matches every other rule (energy, sweet spot, bot protection). The cost: stone on tier 10 = 24 h of swinging ≈ **12 days** of maxed-out play (2 h/day) for one nugget. Long digs rely on saved progress (section 4).
- **Alternative: real time.** You start a dig and your Imp keeps mining while you're away. Stone on tier 10 is a true 24 h. That's friendlier, but energy would have to limit *how many digs* you start rather than minutes, and idle digs are very easy for multi-wallet players and bots to scale.

## 7. Furnace & blacksmith

### Furnace (smelting)
**Decided:** nuggets are smelted into ingots at a furnace in the game (D-033). Ingots stay in your account (D-036).
**Proposed:** 2 nuggets → 1 ingot, 3 s per ingot, never fails, and you can queue a whole stack. No fuel needed. *(Open Q4.)*

### Blacksmith (crafting)
**Decided:** an NPC blacksmith crafts items. You hand over ingots (taken from your account) and pick from its menu (D-039). Each item has a fixed max supply, first come first served (D-040).

**Proposed:**
- The menu shows each item's **recipe** and **remaining supply**, e.g. "Top-tier pickaxe: 37 / 200 left".
- When you confirm, the ingots are removed and the item is **minted to your wallet** (D-037). If the item sold out in the meantime, your ingots are returned.
- **Supply caps live in the contract** and can never be raised, even through an upgrade. That way the chain itself refuses to mint #201 of 200, and it decides fairly who gets the last one.

### Pickaxes
| Tier | Pickaxe | Recipe (ingots) | Max supply | NFT? |
|---|---|---|---|---|
| 1 | Stone | Free starter | Unlimited | **No.** Database only, can't be sold (Proposed, stops wallet farming) |
| 2 | Bronze | *From your diagram* | *TBD* | Yes |
| 3 | Iron | *From your diagram* | *TBD* | Yes |
| 4–9 | *TBD* | *From your diagram* | *TBD* | Yes |
| 10 | *Top tier (your example: obsidian)* | *From your diagram* | **200** | Yes |

- **Equipping needs the NFT in your wallet.** Sell it and you drop back to your next-best pickaxe.
- **No durability.** Pickaxes don't break (Proposed). The sink is crafting itself, which uses up ingots. *(Open Q11.)*
- **Art already in the repo:** 48×48 icons for stone, bronze and iron pickaxes (`*_pickaxe.zip`).

## 8. Your Imp & party
- **Main Imp (Decided, D-025):** built in the 3D customiser from traits you own. **Proposed:** it's cosmetic, and the party gives the bonuses. If you sell the Imp a trait came from, that trait drops off at your next login.
- **Party (Decided, D-026, D-029, D-031):** add other Imps you own to your party. Each one gives a bonus by its **Tier** trait:

| Party Imp tier | Bonus each | Imps in the collection |
|---|---|---|
| Tier 1 | 1% | 1,560 (70%) |
| Tier 2 | 2% | 558 (25%) |
| Tier 3 | 3% | 104 (5%) |

| Mining level | Party slots (Proposed) |
|---|---|
| 1–19 | 3 |
| 20–39 | 4 |
| 40–50 | 5 (max, D-031) |

- **Proposed: the bonus is mining speed.** It was originally a chance bonus, but mining no longer uses chance (D-043). Max party = 5 × tier 3 = **15% faster**. *(Open Q2.)*
- An Imp can only be in one party: the party of the wallet holding it. If it's sold, it leaves the party.
- Only 104 tier 3 Imps exist, so at most 20 players can ever run a full tier 3 party. That gives tier 3 Imps clear extra value (D-013).

## 9. Mining level & XP
- **Decided:** mining level is per account, separate from other skills, and adds to account level (D-032). Level 50 takes ~3 months of max daily play (D-028).
- **Proposed:** level cap 50. **XP to reach the next level = 21 × current level².**

| Reach level | Total XP | Day reached* |
|---|---|---|
| 10 | 5,985 | ~day 2 |
| 20 | 51,870 | ~day 9 |
| 30 | 179,655 | ~day 25 |
| 40 | 431,340 | ~day 52 |
| 50 | 848,925 | **~day 91** |

\*Modelled in code. Assumptions: 2 h of active mining a day (full energy + both boosts), always mining your pickaxe's own tier, a tier 1 party, no sweet-spot hits, and a pickaxe upgrade every 5 levels (tier 10 by level 46).

**How much the other factors matter** (days to level 50):
| Situation | Days |
|---|---|
| Tier 1 party, upgrading pickaxes (baseline) | ~91 |
| No party | ~95 |
| Full tier 2 party | ~87 |
| Full tier 3 party | ~84 |
| Never gets past a tier 5 pickaxe | ~115 |
| Never upgrades from stone | ~188 |
| Hits about half the sweet spots | ~73 |

**The pickaxe matters far more than the party.** Never upgrading doubles the time to level 50. That makes crafted pickaxes, and their limited supply, the heart of the chapter.

**What level does:** unlocks party slots, and adds to account level. Should it unlock anything else? *(Open Q13.)*

## 10. Energy, cooldowns & boosts
- **Decided:** energy and cooldowns are per account (D-024). Imp Coins or ETH can be spent to reduce cooldowns (D-023).
- **Proposed:** each account has **2,000 energy**. One swing costs 1, so that's ~80 min of mining. It refills steadily, to full over 24 h.
- **Boosts (Proposed):** a boost refills 500 energy (~20 min), paid in **Imp Coins** or a small **ETH** fee. **Maximum 2 boosts a day per account**, so the most anyone mines is ~2 h a day. Boosts only add time; they never change speed or rare finds.
  - *Why a cap rather than full removal:* unlimited paid mining lets money (including bot farms' money) race to the capped pickaxes and wrecks the 3-month pacing. *(Open Q6.)*
- Imp Coins come from staking Imps (D-022), so boosts give staking a real use.

**Two kinds of cooldown:**
| | Vein respawn | Account energy |
|---|---|---|
| Limits | One rock, briefly | Total mining per day |
| Length | 10–180 s | Up to 24 h |
| Boostable? | No | Yes (capped) |

## 11. Rare finds
**Proposed:** randomness stays only as a *bonus*, on top of guaranteed nuggets. It's rolled per swing, so slow and fast miners get the same chance per minute.

| Find | Average | Notes |
|---|---|---|
| Rough gem | ~1 per 3 h of mining | Gem tier follows the ore tier |
| *IMPLINGZ rare* (placeholder) | ~1 per 60 h of mining | A lore collectible worth showing off |

Whether these are database resources or NFTs is to be decided with the crafting design.

## 12. What's stored where
| Thing | Where | Decision |
|---|---|---|
| Account, wallet, chosen main Imp, party | Supabase | D-014, D-024, D-025 |
| Mining level, XP, energy, vein progress | Supabase | D-032, D-024 |
| Nuggets, ingots, stone pickaxe | Supabase (not NFTs) | D-036 (stone pickaxe: Proposed) |
| Imp Coins | Supabase | D-022 |
| Crafted pickaxes | Robinhood Chain, open-edition NFT with a per-item cap | D-018, D-037, D-040 |
| Which Imps and pickaxes you hold | Read from the chain at login and regularly after | D-019 |

## 13. Fairness & anti-abuse
- **Server-authoritative (essential):** the server tracks every swing, progress and nugget. The browser only displays them. The current prototype runs entirely in the browser, so this must be built before anything has value.
- **Energy is the main limit.** Multi-wallet play is accepted (D-030). **Proposed:** every account must hold at least 1 Imp.
- **The race for capped pickaxes** is where bots gain most. Watch for inhumanly regular swing timing, use the sweet spot as a light human check, and rate-limit per account.
- **Imp Coins and resources are off-chain,** so only the server can add or remove them.

## 14. Feel & feedback
**Proposed** checklist:
- A swing animation built with the existing bone system, and an impact sound on each hit.
- Sparks on each hit, and a bigger burst plus a "+1 \<ore\> nugget" pop-up when the bar fills.
- The progress bar shows the time left, e.g. "~3 h 12 m".
- Veins visibly crack as they're mined, and look depleted when empty.
- An XP bar with the level, and a level-up flash and sound.
- The sweet-spot ring, with a clear "nice!" response.
- The blacksmith menu with a live "x / 200 left" counter.

## 15. Build plan
**Already in the prototype** (`main.js`): walking, jump and emotes; one tin vein model at 5 spots with collision.

**Smallest first version (Proposed, no server needed):**
1. One ore (tier 1), the stone pickaxe, the E prompt, the swing loop and the progress bar → nugget.
2. Vein depletion and respawn.
3. A nugget counter, plus mining XP and level.
4. *Test:* does swing → nugget → level up feel good for 5 minutes?

**Then, in order:** a second ore tier and the time table → saved vein progress → furnace → blacksmith (database items only) → energy → server-authoritative backend (Supabase) → wallet login and party → NFT minting with contract caps.

## 16. Done when…
- [ ] Your progression diagram is in: ore names, recipes, and the pickaxe supply caps.
- [ ] Open Q1 (active or real time) and Q2 (party as speed) are decided.
- [ ] The smallest first version has been built and played, and the feel is approved.
- [ ] You mark this doc **Signed off**.

---

## Open questions
1. **Active or real time** for mining (section 6)? Proposed: active.
2. **Party bonus as speed** (+1/2/3% per Imp)? Proposed: yes.
3. **Progression diagram:** ore names, what each smelts into, pickaxe recipes, and each pickaxe's supply cap.
4. **Furnace:** 2 nuggets → 1 ingot with no fuel, or something else?
5. **Blacksmith costs:** ingots only, or also Imp Coins? Who pays the transaction fee for minting: the player or the team?
6. **Boost cap:** 2 boosts a day (Proposed), or allow cooldowns to be removed completely?
7. **Energy:** ~80 min a day (~2 h with boosts). Is that the right feel?
8. **Chapter 2 end:** when *every* item sells out, or when the top pickaxe sells out?
9. **After Chapter 2:** do leftover nuggets and ingots carry over?
10. **Veins:** personal (Proposed) or shared?
11. **Durability:** no (Proposed), or should pickaxes wear out?
12. **Sweet spot:** keep it?
13. **Mining level:** should it unlock anything beyond party slots?
14. **Resources between players:** can players trade nuggets and ingots in-game, or never?
15. **Stone pickaxe:** database-only and unsellable (Proposed)?

## Decisions this doc relies on
D-013, D-015, D-018, D-019, D-022 to D-026, D-028 to D-033, D-035 to D-037, D-039 to D-043. Superseded and no longer applied: D-010 (resources part), D-020, D-027, D-034, D-038, and the chance part of D-042.

## Pass history
| Pass | Change |
|---|---|
| 1 | Consolidated into a clean design document after many decisions in this pass. XP rebalanced so mining your own pickaxe tier gives the best XP per minute. Level curve re-modelled for time-based mining (21 × level², ~91 days). Status → In review. |
| 1 | Working drafts: first draft; then updates for the brief, staking and cooldowns, accounts and party, the tier spread, the mining chain, off-chain resources, the blacksmith and supply caps, pickaxes setting odds, and time-based mining. |
