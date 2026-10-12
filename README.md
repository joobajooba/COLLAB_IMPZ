# COLLAB_IMPZ

Three.js walking test scene.

## Run locally

```sh
npm install          # installs three.js into node_modules/
npx serve .          # or any static server, then open the printed URL
```

Opening `index.html` directly from disk won't work — ES modules need to be served over HTTP.

Controls: WASD to walk, Space to jump, drag to look, scroll to zoom.
Emotes: press E to open the panel, or press 1–6 (Wave, Cheer, Dance, Taunt, Bow, Shrug). Moving or jumping cancels an emote.
Mining: walk up to a rock until the "F Mine rock" prompt shows, then press F. The character swings three times and the rock breaks. A broken vein grows back after 10 seconds. Moving or jumping stops the swing.
Copper: the copper vein gives one copper ore into the inventory and costs 5 energy. It can't be mined below 5 energy, and energy slowly refills. Tin gives nothing yet.
Pickaxe: press I to open the inventory, or Q to cycle Stone, Bronze and Iron.

## Pickaxe model

`models/pickaxe.glb` is built in Blender by `models/build_pickaxe.py` (see the comment at its top for the command). Its skins live in `models/pickaxe-skins.json`, one per sprite in `sprites/pickaxes/`, and the game reads that file directly, so a new skin needs only a sprite and a JSON entry.
