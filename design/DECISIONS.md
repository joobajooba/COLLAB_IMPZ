# Decision log

Only decisions **the user** has made go here. Each one gets a number (D-001, D-002, …) so the docs can refer to it.

A decision can only be changed by the user. Changing it means adding a new entry that **supersedes** the old one. Old entries are never deleted.

| ID | Date | Decision | Affects | Supersedes |
|---|---|---|---|---|
| D-001 | 2026-10-11 | IMPLINGZ is a web game built around an NFT collection. | All | n/a |
| D-002 | 2026-10-11 | The design covers five systems: activities, resources, games, trade, and a Pokémon-style skirmish system. | All | n/a |
| D-003 | 2026-10-11 | The design is run as a roadmap worked in repeated passes (scrum). A doc is done only when the user signs it off. | Process | n/a |
| D-004 | 2026-10-11 | Design files are Markdown (`.md`) and live in `design/` in this repo. | Process | n/a |
| D-005 | 2026-10-11 | Gathering skills are designed in phases: 1 ores & mining, 2 trees & lumbering, 3 fishing, 4 hunting animals, 5 not yet decided. | Activities, Resources | n/a |
| D-006 | 2026-10-11 | Gathering design (starting with mining) comes before the overview foundations. The overview questions are paused. | Process | n/a |
| D-007 | 2026-10-11 | IMPLINGZ ("Imps") is a collection of 2,222 randomly generated pixel-art NFTs on Robinhood Chain. Each Imp is also being made as a 3D model (pixel and 3D versions). | All | n/a |
| D-008 | 2026-10-11 | Players load their own 3D Imp as their avatar in the web game. | All | n/a |
| D-009 | 2026-10-11 | Social hub: players talk to each other, show off their Imp's traits and use emotes. | Social | n/a |
| D-010 | 2026-10-11 | Gathered resources are minted into an open NFT collection, visible and tradeable on OpenSea. They can be crafted into better resources and then into items. The collection grows as more is gathered. | Resources, Crafting, Trade | n/a |
| D-011 | 2026-10-11 | Crafted items can be equipped on Imps to show them off. | Crafting, Social | n/a |
| D-012 | 2026-10-11 | Later chapter: mini-bosses and bosses fought with gathered/crafted items. They drop boss items and trophies to show off or resell on OpenSea. | Combat | n/a |
| D-013 | 2026-10-11 | Imps are the primary collection. Everything else exists to support Imps and to increase the utility and value of holding one. | All | n/a |
| D-014 | 2026-10-11 | The game needs a database for accounts (wallet address, Imp avatars) and inventory (gathered and crafted items), kept in step with a smart contract so items also sit in the player's wallet as NFTs. | Tech | n/a |
| D-015 | 2026-10-11 | Nothing is hard-set: the game and its contracts must be built so they can be changed whenever needed, to keep up with Web3 and browser-game trends. | All | n/a |
| D-016 | 2026-10-11 | Later gathering chapters include fishing, lumbering, hunting, farming and foraging. Phases 1–4 stay as in D-005. Farming and foraging fill phase 5 onward (order not set). | Activities | D-005 (phase 5 only) |
| D-017 | 2026-10-11 | The user's brief is the general overview of the project. The overview is no longer paused, but mining stays the current pass. | Process | D-006 |
| D-018 | 2026-10-11 | The resource/item collection is on Robinhood Chain, the same chain as the Imps. | Resources, Tech | n/a |
| D-019 | 2026-10-11 | Claim model: gathered resources go into an in-game balance first. Players claim them to their wallet in one batched transaction when they choose. Crafting burns the inputs. For minted items the chain is the source of truth, and the database follows the chain. | Resources, Crafting, Tech | n/a |
| D-020 | 2026-10-11 | Each Imp held gives a daily mining allowance, so holding more Imps means more mining. | Mining, Activities | n/a |
| D-021 | 2026-10-11 | Contract upgrades need approval from several team members (multisig) and are announced before they take effect. | Tech | n/a |
| D-022 | 2026-10-11 | Existing feature: Imps can be staked to earn Imp Coins. Imp Coins are stored on the player's account in the Supabase database (off-chain). | Resources, Tech | n/a |
| D-023 | 2026-10-11 | Mining has cooldowns. Spending Imp Coins or paying an ETH fee can lower or remove a cooldown. | Mining, Resources | n/a |
| D-024 | 2026-10-11 | One account per connected wallet, which can hold many Imps (e.g. 30). Energy and cooldowns are per account, not per Imp. | Mining, Tech | D-020 |
| D-025 | 2026-10-11 | 3D customiser on the website: reads every IMPLINGZ NFT the wallet owns and its trait metadata. The player builds one main Imp using only traits they own. That personalised Imp is used for mining and games. | Social, Tech | n/a |
| D-026 | 2026-10-11 | Party: alongside the main Imp, players add other Imps they own (around 3 at first, growing with level to a maximum of 5). Party Imps raise the chance of finding a resource based on their Tier trait (1, 2 or 3; 3 is strongest). No party means no bonus. Purpose: holders of many Imps get real use from them. | Mining, Activities | n/a |
| D-027 | 2026-10-11 | Mining a resource is a chance: a swing can give nothing. | Mining | n/a |
| D-028 | 2026-10-11 | Reaching mining level 50 should take around 3 months for a player who mines the maximum every day. Long grind, to keep players engaged. | Mining | n/a |
| D-029 | 2026-10-11 | Party bonus per Imp by Tier: tier 1 = +1%, tier 2 = +2%, tier 3 = +3%. Collection spread: 104 tier 3, 558 tier 2, 1,560 tier 1 (of 2,222). | Mining | n/a |
| D-030 | 2026-10-11 | Multi-wallet loophole accepted: someone can split Imps across several wallets and run several accounts. Seen as inevitable. | Mining, Tech | n/a |
| D-031 | 2026-10-11 | Party maximum is 5 Imps, on top of the main Imp. | Mining | n/a |
| D-032 | 2026-10-11 | Skill levels are per account and separate from each other (mining, lumbering, hunting, foraging, etc.). Each skill level contributes to an overall account level. | All skills, Tech | n/a |
| D-033 | 2026-10-11 | Mining progression: every player starts with a free stone pickaxe. A pickaxe's tier decides which ores it can mine. Mining gives nuggets. Nuggets are smelted into ingots at a furnace in the game. Ingots are crafted into better pickaxes, which unlock new ores. Some ores may give more XP. | Mining, Crafting | n/a |
| D-034 | 2026-10-11 | Everything earned or crafted is stored in the open NFT collection in the player's wallet, visible on OpenSea, where it can be traded (likely for ETH) or kept to craft with. | Resources, Trade | n/a |
| D-035 | 2026-10-11 | Character menu in the 3D viewer: players choose their Imp's traits and the items it uses (e.g. which pickaxe is equipped). Equipped items show on the Imp in game. | Social, Crafting | n/a |
| D-036 | 2026-10-11 | Resources (nuggets, ingots and other gathered or processed materials) are stored only in the database on the player's account. They are **not** NFTs. | Resources, Mining, Tech | D-010 (resources part), D-019, D-034 |
| D-037 | 2026-10-11 | Only finished crafted items (pickaxes, swords, etc.) are NFTs. They form an open-edition collection, with many copies of each item (e.g. 2,000 iron pickaxes), resellable on OpenSea. | Crafting, Trade, Tech | D-034 |
| D-038 | 2026-10-11 | Crafting into NFTs is open for a limited time. When it closes, the collection is locked, so supply is fixed and items keep their value. | Crafting, Trade, Tech | n/a |
| D-039 | 2026-10-11 | Crafting is done by an NPC blacksmith in the game. The player hands over ingots (removed from their account), picks an item from the blacksmith's menu, and the blacksmith crafts it. | Crafting, Mining | n/a |
| D-040 | 2026-10-11 | Every craftable item has a fixed maximum supply (e.g. the top-tier obsidian pickaxe: 200 ever). It's first come, first served: each craft takes one off that item's remaining supply. | Crafting, Trade, Tech | n/a |
| D-041 | 2026-10-11 | The mining chapter ("Chapter 2") ends when all crafted-item supply is gone. Supply limits replace the time-limited crafting window. | Crafting, Process | D-038 |
| D-042 | 2026-10-11 | Pickaxes don't limit which ores you can mine. Any pickaxe (even stone) can mine any ore. The pickaxe only sets the chance of getting a resource. Example: stone pickaxe on a tier 10 ore ≈ 2%; tier 10 pickaxe on a tier 10 ore ≈ 80%, never guaranteed. There are 10 ore tiers. Purpose: sold-out pickaxes never block anyone from progressing; early, active players get better odds sooner. | Mining, Crafting | D-033 (the "pickaxe decides which ores" part) |
| D-043 | 2026-10-11 | Mining always succeeds in the end: no random "nothing found". The pickaxe tier against the ore tier sets **how long** a nugget takes to mine, and it gets exponentially longer the further the pickaxe is below the ore. Example: tier 10 pickaxe on tier 10 ore ≈ 10 minutes; stone pickaxe on tier 10 ore ≈ 24 hours. Any pickaxe can still mine any ore. | Mining | D-027; D-042 (the chance part only) |
