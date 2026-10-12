# COLLAB_IMPZ

Three.js walking test scene.

## Run locally

```sh
npm install          # installs three.js into node_modules/
npx serve .          # or any static server, then open the printed URL
```

Opening `index.html` directly from disk won't work — ES modules need to be served over HTTP.

Controls: WASD to walk, Space to jump, drag to look, scroll to zoom.
Emotes: click one in the Emotes panel or press 1–6 (Wave, Cheer, Dance, Taunt, Bow, Shrug). Moving or jumping cancels an emote; E hides the panel.
Mining: walk up to a rock until the "F Mine rock" prompt shows, then press F. The character swings three times and the rock breaks and is removed. Moving or jumping stops the swing.
Pickaxe: click a skin in the Pickaxe panel or press Q to cycle Stone, Bronze and Iron.

## Pickaxe model

`models/pickaxe.glb` is built in Blender by `models/build_pickaxe.py` (see the comment at its top for the command). Its skins live in `models/pickaxe-skins.json`, one per sprite in `sprites/pickaxes/`, and the game reads that file directly, so a new skin needs only a sprite and a JSON entry.

## Copper ore vein

`models/copper_vein.glb` is a stylised, low-poly copper vein (about 1,000 triangles, 0.85 m tall, origin at the bottom centre) built in Blender by `models/build_copper_vein.py`. It has no textures: three flat materials colour the rock sides, the upward faces and the copper. It is not placed in the scene yet. `models/copper_vein_preview.png` and `models/copper_vein_preview_wire.png` show it lit and as a wireframe.
