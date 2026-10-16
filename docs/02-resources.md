# 02: Resources & economy

| Status | Last pass | Depends on |
|---|---|---|
| Draft | 0 | 00 |

> Must agree with [00-overview](00-overview.md) and [02-resources](02-resources.md).
> Labels: **Decided** (in `DECISIONS.md`) · **Proposed** (Claude's suggestion) · **Open question**

**Purpose of this doc:** Everything that can be gathered, earned, spent or traded, and where it enters (sources) and leaves (sinks) the game.

**Read the pictures.** The mining items live as 48×48 PNGs in `sprites/items/`. When this doc is used, open every file in that folder and match it to the tables below. The picture decides what the item looks like. A filename is only the label. If a filename and a picture disagree, trust the picture and say so.

---

## 1. Role in the core loop
*What this system takes in, what it gives out, and where it sits in the loop in the overview.*

## 2. Player experience
*What it should feel like, in 2–3 sentences.*

## 3. Rules & mechanics
*How it works, precise enough for a developer to build from.*

### Mining tiers (Decided, D-005)

The user set this table on 2026-10-12. It is the list of ores that can be mined, the ingot icon that belongs to each, and the one gem that can come with that ore. Ten tiers, lowest to highest. One gem per tier. No tier shares a gem.

The **Chance for Gem** column was empty on the user's table. The user set it on 2026-10-13 (**Decided, D-012**): 10% for Tin, falling 1% per tier to 1% for Stellarite. The chance is rolled each time a vein breaks, and the gem comes on top of the ore.

Which pickaxe mines which ore, and what a crafted pickaxe costs, is decided in D-006 and D-011 below. How an ingot is made in the smelter is **not decided**. The user is still working on that. Until then the build uses a **test** recipe (D-013, see [Smelting and hilts](#smelting-and-hilts-test-values-d-013)). Other blacksmithing, other crafting, and selling are **not decided**. Do not fill those in.

What mining gives: one ore item for that tier (the `nugget_` picture) every time a vein breaks (D-007, D-010), and sometimes the paired gem (D-012). Ingots come only from the furnace, never straight from mining.

| Tier | Name | Ore picture | Ingot picture | Gem | Gem picture | Gem chance (D-012) |
|---|---|---|---|---|---|---|
| 1 | Tin | `sprites/items/nugget_tin.png` | `sprites/items/ingot_tin.png` | Topaz | `sprites/items/gemstone_topaz.png` | 10% |
| 2 | Copper | `sprites/items/nugget_copper.png` | `sprites/items/ingot_copper.png` | Sapphire | `sprites/items/gemstone_sapphire.png` | 9% |
| 3 | Iron | `sprites/items/nugget_iron.png` | `sprites/items/ingot_iron.png` | Amethyst | `sprites/items/gemstone_amethyst.png` | 8% |
| 4 | Coal | `sprites/items/nugget_coal.png` | none | Ruby | `sprites/items/gemstone_ruby.png` | 7% |
| 5 | Gold | `sprites/items/nugget_gold.png` | `sprites/items/ingot_gold.png` | Emerald | `sprites/items/gemstone_emerald.png` | 6% |
| 6 | Obsidian | `sprites/items/nugget_obsidian.png` | `sprites/items/ingot_obsidian.png` | Jade | `sprites/items/gemstone_jade.png` | 5% |
| 7 | Titanite | `sprites/items/nugget_mithril.png` | `sprites/items/ingot_mithril.png` | Diamond | `sprites/items/gemstone_diamond.png` | 4% |
| 8 | Dreadstone | `sprites/items/nugget_adamantite.png` | `sprites/items/ingot_adamantite.png` | Painite | `sprites/items/gemstone_painite.png` | 3% |
| 9 | Void Stone | `sprites/items/nugget_void.png` | `sprites/items/ingot_void.png` | Arcanium | `sprites/items/gemstone_arcanium.png` | 2% |
| 10 | Stellarite | `sprites/items/nugget_stellarite.png` | `sprites/items/ingot_stellarite.png` | Eclipsium | `sprites/items/gemstone_eclipsium.png` | 1% |

File names that do not match the display name:

- Void Stone uses `void`, not `void_stone`.
- Titanite uses `mithril` (D-020).
- Dreadstone uses `adamantite` (D-020).
- Coal has an ore picture only. There is no `ingot_coal.png`. The table still showed a second coal icon in the Ingot column. That file was not in the asset folder. Do not invent one.

What the pictures actually show (open the file if you need the exact pixels):

- `nugget_` files are the ore rocks. Tin is a pale grey chunk. Coal is a black jagged lump. Void Stone is a dark purple spiral, not a bar. The others follow the same rock shape, coloured for that tier.
- `ingot_` files are bars. Stellarite is a blue bar with yellow stars. Void Stone is a dark bar with a purple spiral. Tin is a plain silver bar.
- Gems are cut stones. Topaz is an orange round gem. Arcanium is a purple four-point star. Eclipsium is a black sphere with a white four-point glint. The other gems match their names: blue sapphire, purple amethyst, red ruby, green emerald, green jade, white diamond, red painite cluster.

These pictures are inventory icons. They are not the 3D ore vein in the walk scene (`models/tin_orevein.fbx`).

### Pickaxes (Decided, D-006)

The user set these two tables on 2026-10-12. The first says which pickaxe mines which ore. The second says what a crafted pickaxe takes. There is no Steel ore and no Steel ingot. The Steel pickaxe is made from iron ingots.

The mine table names **one** pickaxe per ore. The user added on 2026-10-13 that a pickaxe also mines **every ore below** its named ore (**Decided, D-011**). So the Gold pickaxe mines Obsidian and everything below it, and upgrading never locks a player out of the lower ores.

Stellarite is mined with the Void pickaxe. The Stellarite pickaxe is crafted, and the table does not name an ore for it. **Proposed:** it mines everything the Void pickaxe does (all ten ores), because D-011 makes a stronger pickaxe mine what a weaker one can. That leaves it with no mining advantage over Void. **Open question:** what the Stellarite pickaxe is for.

The Stone pickaxe mines Tin and Copper. It has **no row** on the craft table. Do not invent a Stone recipe.

Hilts are ingredients only. The table does not say how a player gets an Ash Wood Hilt, an Oak Wood Hilt, a Void Hilt, or a Cosmic Hilt (**open question**; the build supplies them for free as a test, D-013). There is no picture for a hilt in `sprites/items/`.

| Ore | Gem | Mined with |
|---|---|---|
| Tin | Topaz | Stone Pickaxe |
| Copper | Sapphire | Stone Pickaxe |
| Iron | Amethyst | Bronze Pickaxe |
| Coal | Ruby | Iron Pickaxe |
| Gold | Emerald | Steel Pickaxe |
| Obsidian | Jade | Gold Pickaxe |
| Titanite | Diamond | Obsidian Pickaxe |
| Dreadstone | Painite | Titanite Pickaxe |
| Void Stone | Arcanium | Dreadstone Pickaxe |
| Stellarite | Eclipsium | Void Pickaxe |

| Pickaxe | Crafted using |
|---|---|
| Stone Pickaxe | No craft row |
| Bronze Pickaxe | 5 Tin Ingot, 5 Copper Ingot, 1 Ash Wood Hilt |
| Iron Pickaxe | 5 Iron Ingot, 1 Ash Wood Hilt |
| Steel Pickaxe | 10 Iron Ingot, 1 Ash Wood Hilt |
| Gold Pickaxe | 10 Gold Ingot, 1 Ash Wood Hilt |
| Obsidian Pickaxe | 10 Obsidian Ingot, 1 Oak Wood Hilt |
| Titanite Pickaxe | 10 Obsidian Ingot, 1 Oak Wood Hilt |
| Dreadstone Pickaxe | 10 Dreadstone Ingot, 1 Oak Wood Hilt |
| Void Pickaxe | 10 Void Ingot, 1 Void Hilt |
| Stellarite Pickaxe | 10 Stellarite Ingot, 1 Cosmic Hilt |

The Titanite row is written the same as the Obsidian row: 10 Obsidian Ingot and 1 Oak Wood Hilt. It does not use a Titanite ingot. That is what the table says. Do not change it.

Coal is not an ingredient in any pickaxe. Coal still has no ingot file.

The walk scene has all ten pickaxes as skins (`models/pickaxe-skins.json`). Stone, Bronze and Iron have drawn sprites. Steel to Stellarite are **test placeholders**: their sprites in `sprites/pickaxes/` are the iron sprite recoloured with each ingot's colours, and the handle coloured for its hilt. They should be replaced with drawn art.

### Smelting and hilts (test values, D-013)

The real smelter recipe and how players get hilts are **not decided**. So the build can be played end to end, it uses these **test values** until the user decides (D-013):

- A **furnace** in the scene turns **2 ore into 1 ingot** of the same metal. Coal can't be smelted, because it has no ingot.
- A **blacksmith** (an anvil in the scene) crafts the pickaxes in the table above for exactly the D-006 ingots, and **supplies the hilt for free**.
- Smelting and crafting cost no energy. That is not decided either.

These are test values, not the design. Replace them when the user decides.

### Prestige icons (not part of the mining table)

These six files were in the same folder. They are **not** ores, ingots or gems, and the user has not said what they are for. Do not attach them to a tier.

| File | What the picture is |
|---|---|
| `sprites/items/prestige_0.png` | Gold star medal with a red and blue ribbon |
| `sprites/items/prestige_1.png` | Red eye with a yellow slit pupil on a black winged shape |
| `sprites/items/prestige_2.png` | Green dragon head with yellow horns and spines |
| `sprites/items/prestige_3.png` | Red horned helmet with a dark visor |
| `sprites/items/prestige_4.png` | Gold beast face with a mane and an open mouth |
| `sprites/items/prestige_5.png` | Gold crown floating over a blue glowing ring |

## 4. Inputs & outputs
| Takes in | Gives out | Notes |
|---|---|---|
| Breaking one vein of any tier, and 5 energy | 1 ore of that tier (`nugget_` icon) in the inventory menu | **Decided** (D-005, D-007, D-008, D-010). The scene has a vein for every tier. Tin uses `models/tin_orevein.fbx` and Copper uses `models/copper_vein.glb`. Iron to Stellarite use the copper vein recoloured per tier: **test art** until each has its own model. |
| Breaking one vein of any tier | That tier's gem, sometimes | **Decided** (D-005, D-012). 10% for Tin down to 1% for Stellarite, rolled once per vein. |
| Mining any vein | Costs 5 energy | **Decided** (D-008). Energy max is 100. Below 5 energy nothing can be mined. Energy resets to 100 every 12 hours from midnight (00:00 and 12:00), with no slow refill (D-009). The build uses the player's own clock and saves energy in the browser. **Open question:** whether midnight should be one shared time zone for every player. |
| Time | A broken vein grows back after 10 seconds | **Decided** (D-007), for now. Applies to every vein. |
| The pickaxe named for that ore, or a stronger one | The right to mine that ore | **Decided** (D-006, D-011). Every player starts with Stone. |
| Ingots and one hilt, in the amounts in the pickaxe table | That crafted pickaxe, from the blacksmith | **Decided** (D-006) for the ingots. Stone has no craft cost. How the player gets a hilt is an **open question**. The build supplies hilts for free as a test (D-013). |
| Ore, at the furnace | Ingots | **Not decided.** The user will add how ingots are made. The build uses a test recipe of 2 ore to 1 ingot (D-013). |
| Other blacksmithing, other crafting, selling | Not decided | Still unset. |

## 5. NFT touchpoints
*Where the NFT or the blockchain is involved, and where it deliberately isn't.*

## 6. Risks
*Abuse, balance or scope risks, and how we handle each.*

## 7. Smallest first version
*The least we could build to test whether this system is fun.*

## 8. Done when…
*The conditions for the user to sign this off. Agreed with the user.*

---

## Questions this doc must answer
1. Full list of resources and currencies, grouped by tier/rarity.
2. Source for each: which activity, game or skirmish reward creates it?
3. Sink for each: what spends or destroys it? Every resource needs at least one sink, or it inflates and becomes worthless.
4. Which resources are tradeable, and which are on-chain? (Depends on overview question 3.)
5. How many currencies? (Guardrail: one, unless this doc proves otherwise.)
6. How do we watch and rebalance the economy after launch?

## Pass history
| Pass | Change |
|---|---|
| 0 | Template created with the questions to answer. |
| User addition, 2026-10-12 | Mining tier table and `sprites/items/` catalog recorded (D-005). Status set to Draft. Smelt, blacksmith, craft and sell left unset on purpose. |
| User addition, 2026-10-12 | Pickaxe mine list and pickaxe craft costs recorded (D-006). Smelter recipes for ingots still unset. |
| User addition, 2026-10-12 | Copper mining reward, energy cost and 10-second respawn recorded (D-007). Built into the game as a test. |
| User addition, 2026-10-12 | 5 energy per mine for every ore, 12-hour energy reset, 6×8 inventory menu (D-008). |
| User addition, 2026-10-13 | Tin gives tin ore (D-010). A pickaxe mines its named ore and every ore below (D-011). Gem chance 10% down to 1% by tier (D-012). Test smelting and hilt values for the build (D-013). Stellarite ingot picture description corrected: it is a bar, not a chest. |
| User addition, 2026-10-16 | Mithril renamed Titanite, Adamantite renamed Dreadstone (D-020). File names still use `mithril` and `adamantite`. |
