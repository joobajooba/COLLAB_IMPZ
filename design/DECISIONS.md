# Decision log

Only decisions **the user** has made go here. Each one gets a number (D-001, D-002, …) so the docs can refer to it.

A decision can only be changed by the user. Changing it means adding a new entry that **supersedes** the old one. Old entries are never deleted.

| ID | Date | Decision | Affects | Supersedes |
|---|---|---|---|---|
| D-001 | 2026-10-11 | IMPLINGZ is a web game built around an NFT collection. | All | n/a |
| D-002 | 2026-10-11 | The design covers five systems: activities, resources, games, trade, and a Pokémon-style skirmish system. | All | n/a |
| D-003 | 2026-10-11 | The design is run as a roadmap worked in repeated passes (scrum). A doc is done only when the user signs it off. | Process | n/a |
| D-004 | 2026-10-11 | Design files are Markdown (`.md`) and live in `design/` in this repo. | Process | n/a |
| D-005 | 2026-10-12 | Mining has ten ore tiers, in this order: Tin, Copper, Iron, Coal, Gold, Obsidian, Mithril, Adamantite, Void Stone, Stellarite. Each tier has an ore icon, an ingot icon (Coal has no ingot file), and one gem that can come with that ore: Topaz, Sapphire, Amethyst, Ruby, Emerald, Jade, Diamond, Painite, Arcanium, Eclipsium. The gem chance is not set. Smelting, blacksmithing, crafting and selling are not decided yet. | 02, inventory, mining | n/a |
| D-006 | 2026-10-12 | Each ore is mined with one named pickaxe: Stone mines Tin and Copper, Bronze mines Iron, Iron mines Coal, Steel mines Gold, Gold mines Obsidian, Obsidian mines Mithril, Mithril mines Adamantite, Adamantite mines Void Stone, Void mines Stellarite. Pickaxe craft costs are set (see `02-resources.md`). Stone has no craft cost on the table. How ingots are made in the smelter is not decided. Selling is not decided. | 02, mining, crafting | The "crafting is not decided" part of D-005, for pickaxes only |
| D-007 | 2026-10-12 | First playable mining reward, for testing. Breaking a copper vein puts one Copper ore (`nugget_copper.png`) in the player's inventory and costs 5 energy. Energy starts at 100. A copper vein can't be mined below 5 energy. Energy refills slowly over time (rate not set; the build uses a test value). Every ore vein grows back 10 seconds after it breaks, for now. Tin gives nothing yet. | 02, mining, inventory, energy | n/a |
| D-008 | 2026-10-12 | Every mine costs 5 energy, whatever the ore. Energy resets to max every 12 hours; it does not refill slowly. Mined items and owned pickaxes go in the inventory menu (a 6-column, 8-row grid). The top-left slots are only for the tool the player has selected. | 02, mining, inventory, energy, HUD | The slow energy refill in D-007 |
