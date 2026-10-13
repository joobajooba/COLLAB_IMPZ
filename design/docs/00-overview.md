# 00: Overview

| Status | Last pass | Depends on |
|---|---|---|
| Draft | 1 | n/a |

> Every other doc must agree with this one. If a system doc conflicts with it, the overview wins until the user decides otherwise.
>
> Labels: **Decided** (in `DECISIONS.md`) · **Proposed** (Claude's suggestion) · **Open question**

---

## 1. What IMPLINGZ is
- **Decided (D-007):** IMPLINGZ ("Imps") is a collection of **2,222 randomly generated pixel-art NFTs** on **Robinhood Chain**. Each Imp is also being made as a **3D model**, so there will be a pixel-art version and a 3D version of every Imp.
- **Decided (D-022): staking already exists.** Imps can be staked to earn **Imp Coins**, which are stored on each player's account in the **Supabase** database (off-chain).
- **Decided (D-013): Imps are the primary collection.** Everything else exists to support Imps and to increase the **utility and value of holding one** over time.

## 2. The game in one line
**Proposed:** *Load your Imp into a browser world, hang out, gather and craft. Everything you gather and make is an NFT you truly own, and you can use it to power up and show off your Imp.*

## 3. The vision (from the user's brief)
All **Decided** (D-008 to D-012, D-016):
1. **Your Imp is your avatar.** Players load their own 3D Imp into a web-based game. One account per wallet, which can hold many Imps (D-024). A **3D customiser** on the website reads every Imp the wallet owns and lets the player build **one main Imp** from the traits they own (D-025).
2. **Social hub.** Players talk to each other, show off their Imp's traits and use emotes.
3. **Gather.** Players use their Imp to mine resources, helped by a **party** of other Imps they own. Each party Imp's **Tier** (1–3) gives a bonus (D-026). It was a chance bonus; since mining now always succeeds and only varies in **time** (D-043), it's proposed as a speed bonus. Later chapters add fishing, lumbering, hunting, farming and foraging.
4. **Resources stay in the game.** Gathered and processed resources (nuggets, ingots…) live in the player's account in the database. They are not NFTs (D-036).
5. **Craft, and own it on-chain.** Resources are crafted into better resources, and those into **items**. **Finished crafted items (pickaxes, swords…) are NFTs** in an open-edition collection on OpenSea, with many copies of each (D-037). Items are crafted by an **NPC blacksmith**: you hand over ingots and pick what to make (D-039). **Every item has a fixed maximum supply**, e.g. only 200 obsidian pickaxes ever, first come first served (D-040). **Chapter 2 ends when all item supply is gone** (D-041). For mining: nuggets → smelted at a furnace into ingots → crafted by the blacksmith into pickaxes (D-033, D-039).
   **Levels (D-032):** each skill (mining, lumbering, hunting, foraging…) has its own level per account, and all of them add up to an overall **account level**.
6. **Show off.** Crafted items can be **equipped on Imps** through a **character menu** in the 3D viewer, alongside traits (D-035).
7. **Bosses (later chapter).** Mini-bosses and bosses are fought with the items players have gathered and crafted. They drop **boss items and trophies** to show off or resell on OpenSea.
8. **Stay current.** Once the core works, the game keeps evolving with Web3 and browser-game trends.

## 4. Design pillars
Every feature is judged against these. If a feature doesn't serve one, it gets cut.

1. **Imps first.** (Decided, D-013.) Every system should make holding an Imp more useful or more desirable.
2. **Built to change.** (Decided, D-015.) Nothing is hard-set. Numbers, items, recipes and content live in data that can be changed without rewriting the game. Smart contracts are designed to be extended (section 8).
3. **Fun before finance.** (Proposed.) The game must be worth playing for its own sake. This is what protects Imp value long-term: if players only come for the trading value, they leave the moment prices dip, and floor prices follow.
4. **Earned, not botted.** (Proposed.) Anything with on-chain value must be earned through real play. Bot farms flood the market and crash the value of everything players own.

## 5. Core loop
**Decided (from the brief):**

```
   Load your Imp ──► Hang out · show traits · emote
         │
         ▼
   Gather (mine first) ──► Resources (in your account, off-chain)
                                │
                                ▼
     Furnace (nuggets → ingots) → Blacksmith (ingots → item, while supply lasts)
                                │
                                ▼
              Crafted item = NFT in your wallet (open edition)
                     │                         │
          Equip on your Imp                Sell on OpenSea
                     │
                     ▼ (later chapter)
         Fight bosses ──► Boss items & trophies ──► Show off / resell
```

## 6. Systems map
| System | Its job | Doc | Note |
|---|---|---|---|
| Social hub | Meet, chat, show traits, emote | *none yet* | In the brief. The prototype already has emotes. |
| Customiser & party | Build your main Imp from owned traits; pick party Imps | *none yet* | D-025, D-026. Party rules are in the mining doc for now. |
| Activities: gathering | Turns play time into resources | [01](01-activities.md), [mining](gathering/01-mining.md) | Mining is the current pass |
| Resources | Off-chain materials in the player's account: what exists, sources and sinks | [02](02-resources.md) | |
| Crafted items | The on-chain open-edition NFT collection; each item has a fixed max supply; crafted by the NPC blacksmith | *none yet* | D-037, D-039–D-041. Part of the proposed Crafting doc. |
| Crafting | Resources → better resources → items | *none yet* | In the brief. It's the main sink. |
| Games | Minigames and side content | [03](03-games.md) | Not in the brief. Keep or cut? |
| Trade | OpenSea, and possibly in-game trading | [04](04-trade.md) | |
| Skirmish / bosses | Combat that uses crafted items | [05](05-skirmish.md) | The brief describes bosses. Is Pokémon-style PvP still planned? |

## 7. Technical foundations (from the brief)
**Decided (D-014):** the game needs:
- **An accounts database:** account, wallet address, and the Imp(s) the player uses as avatars.
- **An inventory database:** everything the player has gathered and crafted. For resources the database *is* the record (D-036). For crafted items it follows the chain.
- **A smart contract** for the crafted-item collection, so items live in the player's own wallet as NFTs (D-037).

**Also decided:**
- **Database: Supabase** (already used for Imp Coins, D-022).
- **Chain: Robinhood Chain** for the crafted-item collection, the same as the Imps (D-018).
- **Resources are off-chain (D-036).** No claiming and no transaction fees for mining or smelting. Crafting uses up the resources in the database.
- **Crafted items are on-chain (D-037).** Once an item is in a wallet, the chain is the source of truth, and the game follows it.
- **Fixed supply per item (D-040).** Each item (e.g. obsidian pickaxe) has a maximum. When it's reached, that item can't be minted again. Chapter 2 ends when every item has sold out (D-041).
- **Contract upgrades (D-021)** need several team members to approve (multisig) and are announced before they take effect.

**What lives where:**
| | Imp Coins | Resources | Crafted items |
|---|---|---|---|
| Where it lives | Supabase (off-chain) | Supabase (off-chain) | Robinhood Chain (NFTs, open edition) |
| How you get it | Staking Imps | Gathering, smelting | Blacksmith crafting (while that item's supply lasts), bosses |
| Tradeable on OpenSea | No | No | Yes |

**Proposed: details still to design.**
- **Log in with your wallet.** The player signs a message (a free signature, no transaction). The server then checks on-chain which Imps that wallet holds.
- **One contract for all crafted items.** The usual standard for open editions is ERC-1155: each item type (e.g. "Iron pickaxe") is one ID with many copies. It shows on OpenSea as one collection.
- **Keeping the database in step:** a background job reads the contract's mint and transfer events. That way, an item sold on OpenSea leaves the seller's inventory and character menu in the game too.
- **Supply caps holders can trust:** each item's maximum supply should be **written into the contract**, so the contract itself refuses to mint item #201 of 200. A cap kept only in our database is just a promise, and the upgradeable contract (D-015, D-021) could raise it. **Proposed:** caps can be set when an item is added, but **never raised** afterwards, including through upgrades. The contract cap also settles races fairly: if two players ask for the last obsidian pickaxe at the same moment, the chain decides who got it.

## 8. Risks Claude is flagging
These are honest concerns, not decisions. Each one ends in an open question below.

1. ~~Chain choice~~ **Resolved: Robinhood Chain (D-018).**
2. **Bots.** Once ore is worth real money, people will script bots to mine it. Mining has to be **server-authoritative** (the server decides every result, not the browser) and rate-limited. **Per-account energy (D-024)** caps how much one account can mine per day. *Open:* one person can still run several wallets as several accounts (mining doc, question 11).
3. **Inflation.** Solved by D-036 and D-040: resources can't be sold, and every item has a fixed maximum supply. What's left is **balance**: if the caps are set too high, items are common and cheap even when capped. Caps should be set from the expected number of players (e.g. far fewer obsidian pickaxes than there are Imps).
4. **"Built to change" vs trust.** Safeguard **decided (D-021):** multisig approval and advance notice for upgrades. Still Proposed: keep rules such as recipes and rates in game data rather than in the contract where possible.
5. **Legal.** Promoting the game as a way to raise floor prices, or to earn from gameplay, can attract regulatory attention (for example, around securities or gambling rules). This varies by country. *Claude is not a lawyer.* Get proper advice before launch, and be careful with marketing language. Paid boosts (D-023) belong in that advice too: paying ETH for more mining time, when mining can produce random rare finds, could look like a loot-box to some regulators. That's one more reason boosts should never improve the odds (mining doc section 10).
6. **Paying to skip cooldowns (D-023).** If ETH can *remove* cooldowns completely, the daily energy limit stops limiting anything for players with money. Bot farms can pay too, so it also weakens the bot protection, and more crafted items get minted during the crafting window. It can also read as pay-to-win to holders. **Proposed:** boosts *lower* a cooldown, with a daily cap on how many you can use. Imp Coins are the main way to boost, which gives staking a use and ties back to holding Imps. ETH is an optional shortcut with the same cap. Details are in the mining doc, section 10.
7. ~~Sell-outs and progression~~ **Resolved (D-042):** pickaxes only change your odds, so a sold-out pickaxe never blocks anyone.

---

## Open questions
1. ~~Which chain?~~ **Answered: Robinhood Chain (D-018).**
2. **Can people without an Imp play?** For example, a free guest Imp with limits. A holders-only game pushes demand toward Imps but caps the player base.
3. ~~Claim model~~ Answered (D-019), then **replaced:** resources stay off-chain and only crafted items are NFTs (D-036, D-037).
4. ~~Mining limit per Imp~~ **Answered yes (D-020), then replaced:** energy is per account, and extra Imps help through the party instead (D-024, D-026).
5. **Combat:** the brief describes boss fights. Is the Pokémon-style skirmish (D-002) still planned, as PvP or alongside bosses, or does bosses replace it?
6. **Games (minigames):** the brief doesn't mention them. Keep them in the plan or drop them?
7. **Platform:** desktop browser only, or mobile too?
8. **Staked Imps:** can a staked Imp still be used in the game (as your avatar and for its mining allowance)? If staking moves the Imp out of your wallet into a contract, the game's "which Imps do you hold" check would miss it.
9. **Imp Coins:** will they stay off-chain only, or could they become a token later? This decides how carefully they need protecting from bots.
10. **Where does ETH from boost fees go?** Options: the team treasury, buying back and burning resources, or a reward pool. This affects how holders see the fee.
11. ~~Crafting window~~ **Replaced by supply caps (D-040, D-041).** Still open: what are the caps for each item? That will come with your progression diagram.
12. ~~When an item sells out~~ **Answered (D-042):** it's gone, but nobody is blocked, because any pickaxe can mine any ore.
13. **Who pays the transaction fee** when a crafted item is minted to the player's wallet: the player, or the team?
14. **Chapter 2 end:** does it end when *every* item has sold out, or when the top item (obsidian pickaxe) sells out? If it's every item, one unpopular item could keep the chapter open for a very long time.
15. **After Chapter 2:** what happens to leftover nuggets and ingots in players' accounts? Do they carry into the next chapter, or are they worthless?

## Pass history
| Pass | Change |
|---|---|
| 0 | First draft. Pitch, pillars, loop and guardrails proposed; open questions listed. |
| 1 | Mining always succeeds; pickaxe vs ore sets the time per nugget (D-043). |
| 1 | Pickaxes set odds rather than unlocking ores (D-042). Sell-out risk resolved. |
| 1 | Blacksmith NPC crafts items (D-039); each item has a fixed max supply, first come first served (D-040); Chapter 2 ends when supply runs out (D-041), replacing the time window (D-038). |
| 1 | Resources moved off-chain (D-036). Only crafted items are NFTs, as an open edition (D-037), with a limited crafting window and then a lock (D-038). Loop, tech section and risks updated. |
| 1 | Updated from the user's notes: one account per wallet with energy per account (replaces the per-Imp allowance), 3D customiser, Tier-based party. |
| 1 | Updated from the user's notes: Robinhood Chain, claim model, per-Imp allowance and multisig upgrades decided. Staking, Imp Coins (Supabase) and cooldowns added. Claude flagged the risk of paying to skip cooldowns. |
| 1 | Rewritten from the user's spoken brief: collection facts, vision, core loop, technical foundations recorded as decisions. Claude added the claim/crafting-burn model, a risk list and new open questions. |
