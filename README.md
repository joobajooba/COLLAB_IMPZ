# COLLAB_IMPZ

Three.js walking test scene.

## Where things live

| Folder | What is in it |
|---|---|
| `docs/` | All design documents. Start at [`docs/README.md`](docs/README.md). |
| `models/` | 3D models (character, pickaxe, ore veins) and their Blender build scripts |
| `textures/` | World textures (soil, stone) |
| `sprites/` | 2D pixel art: `items/` for inventory icons, `pickaxes/` for tool icons |
| `.` (this folder) | The game itself: `index.html`, `main.js`, `package.json`, plus `README.md` and `CLAUDE.md` |

## Run locally

```sh
npm install          # installs three.js into node_modules/
npx serve .          # or any static server, then open the printed URL
```

Opening `index.html` directly from disk won't work — ES modules need to be served over HTTP.

Controls: WASD to walk, Space to jump, drag to look, scroll to zoom.
Emotes: press E to open the panel, or press 1–6 (Wave, Cheer, Dance, Taunt, Bow, Shrug). Moving or jumping cancels an emote.
Mining: there is a vein for each of the ten ores, Tin to Stellarite, with harder ores further from the start. Walk up to one until the "F Mine Tin" prompt shows, then press F. The character swings three times and the rock breaks, giving one ore and sometimes its gem. A broken vein grows back after 10 seconds. Moving or jumping stops the swing. A pickaxe mines its own ore and every ore below; if yours is too weak, the prompt says which one you need.
Energy: every mine costs 5 of 100 energy, and nothing can be mined below 5. Energy refills to 100 every 12 hours from midnight (00:00 and 12:00 on the player's clock) and is saved in the browser between reloads.
Inventory: press I. The 6×8 grid holds the pickaxes you own (click one to hold it) and your items. The top-left slots only show the held tool. Q cycles the pickaxes you own. The inventory resets when the page reloads.
Furnace and blacksmith: walk up to either and press F. The furnace turns 2 ore into 1 ingot (a test recipe). The blacksmith crafts pickaxes from ingots and supplies the hilt (also a test). You start with only the Stone pickaxe.
Test tools: Settings has buttons to refill energy, add 20 of every ore and unlock every pickaxe, for trying all the tiers quickly.

## Pickaxe model

`models/pickaxe.glb` is built in Blender by `models/build_pickaxe.py` (see the comment at its top for the command). Its skins live in `models/pickaxe-skins.json`, one per sprite in `sprites/pickaxes/`, and the game reads that file directly, so a new skin needs only a sprite and a JSON entry. Which ore each pickaxe mines, and its recipe, are in `PICKAXES` in `main.js`.
