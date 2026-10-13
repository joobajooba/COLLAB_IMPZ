import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const PLATFORM = 16;
// Times the soil texture repeats across the platform.
const SOIL_REPEAT = 10;
const HALF = PLATFORM / 2;
const EDGE = 0.55;
const MOVE_SPEED = 2.5;
const CYCLE_HZ = 3.1;

const THIGH_FORWARD = 0.82;
const THIGH_BACK = 0.4;
const KNEE_LIFT = 1.05;
const KNEE_BACK = 0.06;
const TOE_AMP = 0.3;
const ARM_AMP = 0.5;
const STRIDE_DIP = 0.02;
const CHAR_RADIUS = 0.22;
// Rock colliders are a little smaller than their bounding boxes so the
// character can get close to the jagged edges.
const ROCK_TIGHTEN = 0.85;
// Positive rotation around the character's right axis swings a limb backward.
const SWING = -1;

const JUMP_SPEED = 3.6;
const GRAVITY = 14;
const LAND_TIME = 0.18;
const EMOTE_FADE_IN = 0.2;
const EMOTE_FADE_OUT = 0.25;

// The pickaxe model is about 1 m long; this is its length in the hand.
const PICKAXE_SCALE = 0.5;
// Where the hand holds the handle, in model units from the bottom.
const PICKAXE_GRIP = 0.18;
// Gap between the character and a rock's edge that still counts as in reach.
const MINE_REACH = 0.35;
const MINE_SWINGS = 3;
const SWING_TIME = 0.8;
// Fraction of a swing when the pick hits the rock.
const STRIKE_AT = 0.6;
const BREAK_TIME = 0.35;
const DEBRIS_TIME = 0.9;
// Name tags over veins and stations show within this distance.
const LABEL_RANGE = 3.2;

// The ten ore tiers, lowest first (D-005). Breaking a vein gives one of its ore
// (D-007, D-010) and, with `gemChance`, its gem too (D-012). `file` is the name
// in sprites/items/. `ingot: false` because Coal has no ingot.
// `model`: "tin" is tin_orevein.fbx; "vein" is models/copper_vein.glb, with its
// rock and ore crystals recoloured by `look` (TEST art until each tier has
// its own vein). `spots` are where its veins stand: a TEST layout.
const ORES = [
  { id: "tin", label: "Tin", file: "tin", tier: 1, gem: "topaz", gemChance: 0.1, model: "tin",
    spots: [
      { x: 1.55, z: -1.05, rot: 0, scale: 1 },
      { x: -2.6, z: -2.4, rot: 1.9, scale: 0.85 },
      { x: -3.2, z: 1.8, rot: 4.1, scale: 1.1 },
      { x: 3.1, z: 2.7, rot: 2.7, scale: 0.9 },
      { x: 0.4, z: 3.4, rot: 5.3, scale: 0.75 },
    ] },
  { id: "copper", label: "Copper", file: "copper", tier: 2, gem: "sapphire", gemChance: 0.09, model: "vein",
    spots: [
      { x: 3.0, z: -2.6, rot: 0.3, scale: 0.85 },
      { x: -4.6, z: 4.6, rot: 2.2, scale: 0.85 },
    ] },
  { id: "iron", label: "Iron", file: "iron", tier: 3, gem: "amethyst", gemChance: 0.08, model: "vein",
    look: { ore: "#aab0ba", metal: 0.9, rough: 0.3, top: "#6a625a", side: "#4e5158" },
    spots: [{ x: -5.6, z: -0.6, rot: 1.2, scale: 0.9 }] },
  { id: "coal", label: "Coal", file: "coal", tier: 4, gem: "ruby", gemChance: 0.07, model: "vein", ingot: false,
    look: { ore: "#1c1c21", metal: 0.1, rough: 0.55, top: "#4c4742", side: "#3a3836" },
    spots: [{ x: -5.2, z: -5.0, rot: 4.0, scale: 0.9 }] },
  { id: "gold", label: "Gold", file: "gold", tier: 5, gem: "emerald", gemChance: 0.06, model: "vein",
    look: { ore: "#ffb21f", metal: 0.95, rough: 0.25, top: "#a8873f", side: "#8a7a62" },
    spots: [{ x: -1.4, z: -6.0, rot: 0.6, scale: 0.9 }] },
  { id: "obsidian", label: "Obsidian", file: "obsidian", tier: 6, gem: "jade", gemChance: 0.05, model: "vein",
    look: { ore: "#251b33", metal: 0.3, rough: 0.06, top: "#3e3449", side: "#2c2830" },
    spots: [{ x: 2.6, z: -6.0, rot: 5.2, scale: 0.9 }] },
  { id: "mithril", label: "Mithril", file: "mithril", tier: 7, gem: "diamond", gemChance: 0.04, model: "vein",
    look: { ore: "#d9caff", metal: 0.8, rough: 0.2, top: "#8f87a8", side: "#9c97ad", glow: "#2c2058" },
    spots: [{ x: 6.0, z: -4.2, rot: 3.1, scale: 0.9 }] },
  { id: "adamantite", label: "Adamantite", file: "adamantite", tier: 8, gem: "painite", gemChance: 0.03, model: "vein",
    look: { ore: "#8c2629", metal: 0.75, rough: 0.3, top: "#6b3b31", side: "#5a3a36" },
    spots: [{ x: 6.2, z: 0.6, rot: 1.7, scale: 0.95 }] },
  { id: "void", label: "Void Stone", file: "void", tier: 9, gem: "arcanium", gemChance: 0.02, model: "vein",
    look: { ore: "#4d2a91", metal: 0.3, rough: 0.3, top: "#2b2337", side: "#2a2234", glow: "#3a167a" },
    spots: [{ x: 5.4, z: 5.2, rot: 4.6, scale: 1 }] },
  { id: "stellarite", label: "Stellarite", file: "stellarite", tier: 10, gem: "eclipsium", gemChance: 0.01, model: "vein",
    look: { ore: "#4a8bea", metal: 0.5, rough: 0.2, top: "#2b3b5c", side: "#27324a", glow: "#1b4bb0" },
    spots: [{ x: 0.2, z: 6.4, rot: 0.9, scale: 1.05 }] },
];
const GEMS = {
  topaz: "Topaz", sapphire: "Sapphire", amethyst: "Amethyst", ruby: "Ruby", emerald: "Emerald",
  jade: "Jade", diamond: "Diamond", painite: "Painite", arcanium: "Arcanium", eclipsium: "Eclipsium",
};
// Pickaxes, weakest first. `mines` is the highest ore tier it can mine: its
// named ore(s) in D-006 and every ore below (D-011). Stellarite has no named
// ore; it mines everything the Void pickaxe does. `cost` is its D-006 recipe
// in ingots; Stone has none and every player starts with it. The 3D look and
// sprite of each are in models/pickaxe-skins.json under the same id.
const PICKAXES = [
  { id: "stone", mines: 2 },
  { id: "bronze", mines: 3, cost: { tin_ingot: 5, copper_ingot: 5 }, hilt: "Ash Wood Hilt" },
  { id: "iron", mines: 4, cost: { iron_ingot: 5 }, hilt: "Ash Wood Hilt" },
  { id: "steel", mines: 5, cost: { iron_ingot: 10 }, hilt: "Ash Wood Hilt" },
  { id: "gold", mines: 6, cost: { gold_ingot: 10 }, hilt: "Ash Wood Hilt" },
  { id: "obsidian", mines: 7, cost: { obsidian_ingot: 10 }, hilt: "Oak Wood Hilt" },
  { id: "mithril", mines: 8, cost: { obsidian_ingot: 10 }, hilt: "Oak Wood Hilt" },
  { id: "adamantite", mines: 9, cost: { adamantite_ingot: 10 }, hilt: "Oak Wood Hilt" },
  { id: "void", mines: 10, cost: { void_ingot: 10 }, hilt: "Void Hilt" },
  { id: "stellarite", mines: 10, cost: { stellarite_ingot: 10 }, hilt: "Cosmic Hilt" },
];
// TEST values until the smelter and hilts are designed (D-013): the furnace
// turns this many ore into one ingot, and the blacksmith supplies every hilt.
const SMELT_ORE = 2;
// The furnace and the blacksmith's anvil.
const STATIONS = [
  { id: "furnace", label: "Furnace", verb: "Use furnace", x: -1.7, z: 0.9, rot: 0.5 },
  { id: "smith", label: "Blacksmith", verb: "Use anvil", x: 1.5, z: 1.2, rot: -0.4 },
];
// Seconds before a broken vein grows back.
const ORE_RESPAWN = 10;
const ENERGY_MAX = 100;
const MINE_ENERGY = 5;
// Energy refills to full every 12 hours from midnight on the player's clock (00:00 and 12:00).
const ENERGY_RESET_MS = 12 * 60 * 60 * 1000;
const ENERGY_KEY = "impz.energy";
const INVENTORY_SLOTS = 6 * 8;
// Item id -> { label, icon }: each ore, its ingot and its gem.
const ITEMS = {};
for (const ore of ORES) {
  ITEMS[ore.id + "_ore"] = { label: `${ore.label} ore`, icon: `./sprites/items/nugget_${ore.file}.png` };
  if (ore.ingot !== false) {
    ITEMS[ore.id + "_ingot"] = { label: `${ore.label} ingot`, icon: `./sprites/items/ingot_${ore.file}.png` };
  }
  ITEMS[ore.gem] = { label: GEMS[ore.gem], icon: `./sprites/items/gemstone_${ore.gem}.png` };
}

const BONES = [
  "thigh_l",
  "calf_l",
  "foot_l",
  "thigh_r",
  "calf_r",
  "foot_r",
  "upperarm_l",
  "upperarm_r",
];

// Bones that jump and emote poses can bend, parents before children. Angles in
// poses are [x, y, z] in character space: +x tips a limb backward (or the
// spine forward), +y turns toward the character's left, +z swings the
// character's left arm out/up (the right arm uses -z). They're applied y, then
// x, then z, so an arm swung forward with x keeps that when raised with z.
const POSE_BONES = [
  "spine_01",
  "spine_03",
  "neck_01",
  "head",
  "clavicle_l",
  "upperarm_l",
  "lowerarm_l",
  "hand_l",
  "clavicle_r",
  "upperarm_r",
  "lowerarm_r",
  "hand_r",
  "thigh_l",
  "calf_l",
  "foot_l",
  "thigh_r",
  "calf_r",
  "foot_r",
];

// Emotes, in panel order. `duration: 0` loops until the character moves.
const EMOTES = [
  { id: "wave", label: "Wave", icon: "👋", duration: 2.4, pose: wavePose },
  { id: "cheer", label: "Cheer", icon: "🙌", duration: 2.2, pose: cheerPose },
  { id: "dance", label: "Dance", icon: "🕺", duration: 0, pose: dancePose },
  { id: "taunt", label: "Taunt", icon: "😜", duration: 2.4, pose: tauntPose },
  { id: "bow", label: "Bow", icon: "🙇", duration: 2.0, pose: bowPose },
  { id: "shrug", label: "Shrug", icon: "🤷", duration: 1.8, pose: shrugPose },
];

const keys = new Set();
const colliders = [];
const restLocal = new Map();
const restWorld = new Map();
const bones = {};

const qA = new THREE.Quaternion();
const qB = new THREE.Quaternion();
const qC = new THREE.Quaternion();
const qD = new THREE.Quaternion();
const ePose = new THREE.Euler();
const vForward = new THREE.Vector3();
const vRight = new THREE.Vector3();
const vMove = new THREE.Vector3();
const lateral = new THREE.Vector3();
const desiredCam = new THREE.Vector3();
const lookAt = new THREE.Vector3();

const character = new THREE.Group();
const modelHolder = new THREE.Group();
character.add(modelHolder);

let ready = false;
let footOffset = 0;
let lookHeight = 0.7;
let yaw = 0;
let phase = 0;
let blend = 0;
let camYaw = 0;
let pitch = 0.46;
let distance = 3.6;
let legLength = 0.18;
let jumpY = 0;
let jumpVel = 0;
let airborne = false;
let airBlend = 0;
let landTimer = 0;
// { def, t, fadeT } while an emote plays; fadeT >= 0 once it's fading out.
let emote = null;
const emoteButtons = new Map();

// Pickaxe: the loaded model and its skins from models/pickaxe-skins.json
// (id -> skin). It's attached to hand_r once the character has loaded.
// Players start with Stone and craft the rest; `held` is the one in hand.
let pickaxe = null;
const restHand = { hand: new THREE.Matrix4(), grip: new THREE.Vector3() };
let skins = {};
const owned = new Set(["stone"]);
let held = "stone";

// Ore veins that can still be mined, and the one being mined right now:
// { vein, x, z, t, strikes, fadeT } with fadeT >= 0 once the swing winds down.
const veins = [];
let mining = null;
// Name tag sprites (see addLabel).
const labels = [];
// Breaking veins and flying rock chips: { update(dt) -> false when finished }.
const effects = [];

let energy = ENERGY_MAX;
let energyPeriod = 0;
// Item id -> count, in the order the items were first picked up.
const inventory = new Map();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color("#141820");
scene.add(character);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.05,
  80
);

const hemi = new THREE.HemisphereLight("#c5d4ff", "#3a2c24", 0.85);
scene.add(hemi);

const sun = new THREE.DirectionalLight("#fff6ea", 2.3);
sun.position.set(4.5, 9, 3.5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 30;
sun.shadow.camera.left = -10;
sun.shadow.camera.right = 10;
sun.shadow.camera.top = 10;
sun.shadow.camera.bottom = -10;
sun.shadow.bias = -0.0004;
scene.add(sun);
scene.add(sun.target);

const fill = new THREE.DirectionalLight("#9eb6ff", 0.55);
fill.position.set(-4, 3, -2);
scene.add(fill);

buildPlatform();
const blob = buildContactShadow();
buildEmotePanel();
setupShell();

const clock = new THREE.Clock();
window.addEventListener("resize", onResize);
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", (event) => keys.delete(event.code));
window.addEventListener("blur", () => keys.clear());
renderer.domElement.addEventListener("pointerdown", onPointerDown);
renderer.domElement.addEventListener("pointermove", onPointerMove);
window.addEventListener("pointerup", () => {
  dragging = false;
});
renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
renderer.domElement.addEventListener("contextmenu", (event) => event.preventDefault());

let dragging = false;
let lastX = 0;
let lastY = 0;

loadCharacter();
loadOre();
loadVeins();
buildStations();
loadPickaxe();
renderer.setAnimationLoop(frame);

function buildPlatform() {
  const soil = new THREE.TextureLoader().load("./textures/soil.png");
  soil.colorSpace = THREE.SRGBColorSpace;
  soil.wrapS = soil.wrapT = THREE.RepeatWrapping;
  soil.repeat.set(SOIL_REPEAT, SOIL_REPEAT);
  soil.anisotropy = 8;
  const top = new THREE.MeshStandardMaterial({
    map: soil,
    // Darkens the texture so the bright scene light doesn't wash it out.
    color: "#a08a76",
    roughness: 1,
    metalness: 0,
  });
  const side = new THREE.MeshStandardMaterial({
    color: "#3b2918",
    roughness: 0.95,
    metalness: 0,
  });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(PLATFORM, 0.28, PLATFORM), [
    side,
    side,
    top,
    side,
    side,
    side,
  ]);
  slab.position.y = -0.14;
  slab.receiveShadow = true;
  slab.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(slab.geometry),
      new THREE.LineBasicMaterial({ color: "#7a5636" })
    )
  );
  scene.add(slab);
}

function buildContactShadow() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const fade = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
  fade.addColorStop(0, "rgba(0,0,0,0.4)");
  fade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, 128, 128);
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 32),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      depthWrite: false,
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.012;
  scene.add(mesh);
  return mesh;
}

function loadCharacter() {
  const status = document.getElementById("status");
  const loader = new GLTFLoader();
  loader.load(
    "./0.glb",
    (gltf) => {
      const model = gltf.scene;
      modelHolder.add(model);
      model.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
          obj.frustumCulled = false;
        }
        if (obj.isBone) bones[obj.name] = obj;
      });

      const missing = BONES.filter((name) => !bones[name]);
      if (missing.length) {
        status.textContent = "Missing bones: " + missing.join(", ");
        return;
      }

      model.updateMatrixWorld(true);
      let box = new THREE.Box3().setFromObject(model);
      let height = box.max.y - box.min.y;
      if (height > 0 && (height < 0.2 || height > 5)) {
        model.scale.setScalar(1.15 / height);
        model.updateMatrixWorld(true);
        box = new THREE.Box3().setFromObject(model);
        height = box.max.y - box.min.y;
      }
      footOffset = box.isEmpty() ? 0 : -box.min.y;
      lookHeight = Math.max(height * 0.62, 0.4);
      modelHolder.position.y = footOffset;
      model.updateMatrixWorld(true);

      for (const name of new Set([...BONES, ...POSE_BONES])) {
        if (!bones[name]) continue;
        restLocal.set(name, bones[name].quaternion.clone());
        restWorld.set(name, bones[name].getWorldQuaternion(new THREE.Quaternion()));
      }
      const hip = bones.thigh_l.getWorldPosition(new THREE.Vector3());
      const knee = bones.calf_l.getWorldPosition(new THREE.Vector3());
      const ankle = bones.foot_l.getWorldPosition(new THREE.Vector3());
      legLength = hip.distanceTo(knee) + knee.distanceTo(ankle);

      // The right hand's rest pose and grip point in character space, for
      // attaching the pickaxe.
      character.updateMatrixWorld(true);
      const toCharacter = character.matrixWorld.clone().invert();
      restHand.hand.multiplyMatrices(toCharacter, bones.hand_r.matrixWorld);
      restHand.grip.setFromMatrixPosition(bones.hand_r.matrixWorld);
      if (bones.middle_metacarpal_r) {
        restHand.grip.lerp(bones.middle_metacarpal_r.getWorldPosition(new THREE.Vector3()), 0.6);
      }
      restHand.grip.applyMatrix4(toCharacter);

      ready = true;
      status.classList.add("hidden");
      attachPickaxe();
      frame(0);
    },
    undefined,
    (error) => {
      status.textContent = "Could not load 0.glb";
      console.error(error);
    }
  );
}

function loadOre() {
  const loader = new FBXLoader();
  loader.load("./tin_orevein.fbx", (fbx) => {
    const drop = [];
    fbx.traverse((obj) => {
      if (obj.isLight || obj.isCamera) drop.push(obj);
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    for (const obj of drop) obj.removeFromParent();

    fbx.updateMatrixWorld(true);
    const size = new THREE.Box3().setFromObject(fbx).getSize(new THREE.Vector3());
    const footprint = Math.max(size.x, size.z, 0.001);
    const height = Math.max(size.y, 0.001);
    const scale = height < footprint * 0.25 ? 1.5 / footprint : 0.72 / height;
    fbx.scale.multiplyScalar(scale);
    fbx.updateMatrixWorld(true);
    const grounded = new THREE.Box3().setFromObject(fbx);
    fbx.position.y = -grounded.min.y;
    fbx.updateMatrixWorld(true);
    const placed = new THREE.Box3().setFromObject(fbx);
    const center = placed.getCenter(new THREE.Vector3());
    fbx.position.x -= center.x;
    fbx.position.z -= center.z;

    for (const ore of ORES) if (ore.model === "tin") placeVeins(fbx, ore);
  }, undefined, (error) => {
    console.error(error);
  });
}

// The copper vein's origin is already at its bottom centre. Every ore with
// model "vein" gets a copy, with its own materials coloured by `look`.
function loadVeins() {
  new GLTFLoader().load("./models/copper_vein.glb", (gltf) => {
    gltf.scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    for (const ore of ORES) {
      if (ore.model !== "vein") continue;
      placeVeins(ore.look ? recolourVein(gltf.scene, ore.look) : gltf.scene, ore);
    }
  }, undefined, (error) => console.error("Could not load the copper vein", error));
}

// The copper vein's materials are Rock_Side (the rock), Rock_Top (its lighter
// top) and Copper (the ore crystals).
function recolourVein(model, look) {
  const copy = model.clone();
  copy.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.material = [].concat(obj.material).map((m) => {
      const mat = m.clone();
      if (mat.name === "Rock_Side") mat.color.set(look.side);
      if (mat.name === "Rock_Top") mat.color.set(look.top);
      if (mat.name === "Copper") {
        mat.color.set(look.ore);
        mat.metalness = look.metal;
        mat.roughness = look.rough;
        if (look.glow) mat.emissive.set(look.glow);
      }
      return mat;
    });
    if (obj.material.length === 1) obj.material = obj.material[0];
  });
  return copy;
}

function placeVeins(model, ore) {
  for (const spot of ore.spots) {
    const vein = new THREE.Group();
    vein.userData.ore = ore;
    vein.add(model.clone());
    vein.position.set(spot.x, 0, spot.z);
    vein.rotation.y = spot.rot;
    vein.scale.setScalar(spot.scale);
    scene.add(vein);
    addRockColliders(vein);
    veins.push(vein);
    addLabel(vein, ore.label, new THREE.Box3().setFromObject(vein).max.y + 0.16);
  }
}

// The furnace and the blacksmith's anvil, built from simple shapes. Each gets
// a round collider tagged with its id, so F opens its menu.
function buildStations() {
  const builders = { furnace: buildFurnace, smith: buildAnvil };
  for (const def of STATIONS) {
    const { group, radius } = builders[def.id]();
    group.position.set(def.x, 0, def.z);
    group.rotation.y = def.rot;
    group.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    scene.add(group);
    colliders.push({ x: def.x, z: def.z, r: radius, station: def.id });
    addLabel(group, def.label, new THREE.Box3().setFromObject(group).max.y + 0.16);
  }
}

function buildFurnace() {
  const group = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: "#6f675e", roughness: 0.95 });
  const dark = new THREE.MeshStandardMaterial({ color: "#3d3732", roughness: 0.95 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.62, 0.78), stone);
  body.position.y = 0.31;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.08, 0.86), dark);
  cap.position.y = 0.66;
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.19, 0.55, 8), stone);
  chimney.position.set(0, 0.97, -0.12);
  const lip = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 8), dark);
  lip.position.set(0, 1.25, -0.12);
  // The fire: a dark arch with a glowing bed of coals inside.
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, 0.06), dark);
  mouth.position.set(0, 0.27, 0.37);
  const fire = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34, 0.22),
    new THREE.MeshStandardMaterial({ color: "#ff8a30", emissive: "#ff5a12", emissiveIntensity: 2.2 })
  );
  fire.position.set(0, 0.25, 0.401);
  const glow = new THREE.PointLight("#ff7a2a", 1.4, 2.6, 2);
  glow.position.set(0, 0.32, 0.65);
  effects.push({
    update() {
      glow.intensity = 1.2 + Math.random() * 0.5;
      return true;
    },
  });
  group.add(body, cap, chimney, lip, mouth, fire, glow);
  return { group, radius: 0.5 };
}

function buildAnvil() {
  const group = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: "#6b4a2c", roughness: 0.9 });
  const iron = new THREE.MeshStandardMaterial({ color: "#3e434b", metalness: 0.85, roughness: 0.38 });
  const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.4, 10), wood);
  stump.position.y = 0.2;
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.24), iron);
  foot.position.y = 0.435;
  const waist = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.13), iron);
  waist.position.y = 0.53;
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.09, 0.2), iron);
  face.position.y = 0.635;
  const horn = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.24, 10), iron);
  horn.rotation.z = -Math.PI / 2;
  horn.position.set(0.35, 0.645, 0);
  // A hammer resting on the stump.
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.3, 6), wood);
  handle.rotation.z = Math.PI / 2;
  handle.rotation.y = 0.5;
  handle.position.set(-0.05, 0.42, 0.2);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.12), iron);
  head.rotation.y = 0.5;
  head.position.set(-0.18, 0.43, 0.27);
  group.add(stump, foot, waist, face, horn, handle, head);
  return { group, radius: 0.32 };
}

// Fills the furnace and blacksmith menus from the inventory.
function renderStations() {
  renderFurnace();
  renderSmith();
}

function iconImg(src) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = "";
  return img;
}

function stationButton(text, enabled, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.disabled = !enabled;
  button.addEventListener("click", onClick);
  return button;
}

function renderFurnace() {
  const list = document.getElementById("furnace-list");
  list.replaceChildren();
  for (const ore of ORES) {
    if (ore.ingot === false) continue;
    const oreId = ore.id + "_ore";
    const have = inventory.get(oreId) || 0;
    const row = document.createElement("div");
    row.className = "station-row";
    const what = document.createElement("div");
    what.className = "what";
    what.append(
      iconImg(ITEMS[oreId].icon),
      `${SMELT_ORE} → 1`,
      iconImg(ITEMS[ore.id + "_ingot"].icon),
      Object.assign(document.createElement("span"), {
        className: "name",
        textContent: `${ore.label} ingot`,
      })
    );
    const owns = Object.assign(document.createElement("span"), {
      className: "have" + (have >= SMELT_ORE ? "" : " short"),
      textContent: `${have} ore`,
    });
    row.append(
      what,
      owns,
      stationButton("Smelt", have >= SMELT_ORE, () => smelt(ore, 1)),
      stationButton("All", have >= SMELT_ORE, () => smelt(ore, Math.floor(have / SMELT_ORE)))
    );
    list.append(row);
  }
}

function smelt(ore, ingots) {
  if ((inventory.get(ore.id + "_ore") || 0) < ingots * SMELT_ORE || ingots < 1) return;
  removeItem(ore.id + "_ore", ingots * SMELT_ORE);
  addItem(ore.id + "_ingot", ingots);
}

function renderSmith() {
  const list = document.getElementById("smith-list");
  list.replaceChildren();
  for (const pick of PICKAXES) {
    if (!pick.cost || !skins[pick.id]) continue;
    const row = document.createElement("div");
    row.className = "station-row";
    const what = document.createElement("div");
    what.className = "what";
    const reach = ORES.find((o) => o.tier === pick.mines).label;
    what.append(
      iconImg(`./${skins[pick.id].sprite}`),
      Object.assign(document.createElement("span"), {
        className: "name",
        innerHTML: `${pickaxeLabel(pick.id)}<small>Mines up to ${reach}</small>`,
      })
    );
    const cost = document.createElement("div");
    cost.className = "cost";
    let affordable = true;
    for (const [id, need] of Object.entries(pick.cost)) {
      const have = inventory.get(id) || 0;
      if (have < need) affordable = false;
      const part = document.createElement("span");
      part.className = have >= need ? "" : "short";
      part.title = ITEMS[id].label;
      part.append(iconImg(ITEMS[id].icon), `${have}/${need}`);
      cost.append(part);
    }
    cost.append(
      Object.assign(document.createElement("span"), {
        className: "hilt",
        title: "TEST: the blacksmith supplies every hilt for now (D-013)",
        textContent: `+ ${pick.hilt}`,
      })
    );
    const done = owned.has(pick.id);
    row.append(
      what,
      cost,
      stationButton(done ? "Owned" : "Craft", !done && affordable, () => craft(pick))
    );
    list.append(row);
  }
}

function craft(pick) {
  if (owned.has(pick.id)) return;
  if (Object.entries(pick.cost).some(([id, need]) => (inventory.get(id) || 0) < need)) return;
  for (const [id, need] of Object.entries(pick.cost)) removeItem(id, need);
  owned.add(pick.id);
  holdPickaxe(pick.id);
  renderStations();
  showLoot({ label: pickaxeLabel(pick.id), icon: `./${skins[pick.id].sprite}` }, true);
}

function loadPickaxe() {
  Promise.all([
    fetch("./models/pickaxe-skins.json").then((res) => res.json()),
    new GLTFLoader().loadAsync("./models/pickaxe.glb"),
  ])
    .then(([json, gltf]) => {
      skins = json;
      pickaxe = gltf.scene;
      pickaxe.traverse((obj) => {
        if (obj.isMesh) obj.castShadow = true;
      });
      holdPickaxe(held);
      attachPickaxe();
      renderStations();
    })
    .catch((error) => console.error("Could not load the pickaxe", error));
}

// Puts the pickaxe in the right hand. In the rest pose the handle points
// forward and up, with the head upright; mining poses swing it from there.
// Works from the hand's rest pose in character space, so it doesn't matter
// where the character is or what it's doing when the pickaxe finishes loading.
function attachPickaxe() {
  if (!ready || !pickaxe || pickaxe.parent) return;
  const { hand: handRest, grip } = restHand;
  const handleDir = new THREE.Vector3(0, 0.6, 0.8);
  const headDir = new THREE.Vector3(0, 0.8, -0.6);
  const basis = new THREE.Matrix4().makeBasis(
    headDir,
    handleDir,
    new THREE.Vector3().crossVectors(headDir, handleDir)
  );
  const placed = new THREE.Matrix4()
    .makeTranslation(grip.x, grip.y, grip.z)
    .multiply(basis)
    .multiply(new THREE.Matrix4().makeScale(PICKAXE_SCALE, PICKAXE_SCALE, PICKAXE_SCALE))
    .multiply(new THREE.Matrix4().makeTranslation(0, -PICKAXE_GRIP, 0));
  bones.hand_r.add(pickaxe);
  pickaxe.matrix.copy(handRest).invert().multiply(placed);
  pickaxe.matrix.decompose(pickaxe.position, pickaxe.quaternion, pickaxe.scale);
}

// Puts an owned pickaxe in the hand: colours or hides each part of the model,
// by its Pick_<Part> material.
function holdPickaxe(id) {
  if (!owned.has(id)) return;
  held = id;
  const skin = skins[id];
  if (!pickaxe || !skin) return;
  pickaxe.traverse((obj) => {
    if (!obj.isMesh) return;
    const part = obj.material.name.replace(/^Pick_/, "");
    const spec = skin.parts[part] || {};
    obj.visible = spec.visible !== false;
    if (!obj.visible) return;
    obj.material.color.set(spec.color || "#ffffff");
    obj.material.metalness = spec.metalness ?? 0;
    obj.material.roughness = spec.roughness ?? 0.8;
  });
  const slotImg = document.querySelector(".pick-icon");
  slotImg.src = `./${skin.sprite}`;
  slotImg.alt = skin.label;
  slotImg.hidden = false;
  renderInventory();
}

// Q: the next pickaxe the player owns, in tier order.
function cycleHeld() {
  const mine = PICKAXES.filter((p) => owned.has(p.id));
  const i = mine.findIndex((p) => p.id === held);
  holdPickaxe(mine[(i + 1) % mine.length].id);
}

function pickaxeDef(id) {
  return PICKAXES.find((p) => p.id === id);
}

function pickaxeLabel(id) {
  return `${skins[id]?.label || id} pickaxe`;
}

// The weakest pickaxe that can mine an ore of this tier (D-006, D-011).
function pickaxeFor(tier) {
  return PICKAXES.find((p) => p.mines >= tier);
}

// The closest rock or station edge in reach, as { vein | station, x, z } (its
// centre), or null.
function targetInReach() {
  const p = character.position;
  let best = null;
  let bestGap = MINE_REACH;
  for (const c of colliders) {
    const gap = Math.hypot(p.x - c.x, p.z - c.z) - c.r - CHAR_RADIUS;
    if (gap < bestGap) {
      bestGap = gap;
      best = c;
    }
  }
  return best && { vein: best.vein, station: best.station, x: best.x, z: best.z };
}

// Why the held pickaxe can't mine this vein right now, or null if it can.
function mineBlocker(vein) {
  const ore = vein.userData.ore;
  if (pickaxeDef(held).mines < ore.tier) return `Needs a ${pickaxeLabel(pickaxeFor(ore.tier).id)}`;
  if (energy < MINE_ENERGY) return "Not enough energy";
  return null;
}

// F: mines the rock in reach, or opens the station in reach.
function interact() {
  if (!ready || airborne || (mining && mining.fadeT < 0)) return;
  const target = targetInReach();
  if (!target) return;
  if (target.station) {
    stopEmote();
    openModal(target.station);
    return;
  }
  if (mineBlocker(target.vein)) return;
  stopEmote();
  mining = { ...target, t: 0, strikes: 0, fadeT: -1 };
}

function stopMining() {
  if (mining && mining.fadeT < 0) mining.fadeT = 0;
}

// Turns to face the rock, counts strikes and breaks the vein on the last one.
// Returns the mining pose's blend weight (0..1).
function updateMining(dt) {
  if (!mining) return 0;
  mining.t += dt;
  let weight = Math.min(1, mining.t / EMOTE_FADE_IN);
  if (mining.fadeT >= 0) {
    mining.fadeT += dt;
    weight *= 1 - mining.fadeT / EMOTE_FADE_OUT;
    if (mining.fadeT >= EMOTE_FADE_OUT) {
      mining = null;
      return 0;
    }
    return Math.max(0, weight);
  }

  const p = character.position;
  const targetYaw = Math.atan2(mining.x - p.x, mining.z - p.z);
  const turn = Math.atan2(Math.sin(targetYaw - yaw), Math.cos(targetYaw - yaw));
  yaw += turn * (1 - Math.exp(-12 * dt));
  character.rotation.y = yaw;

  if (mining.strikes < MINE_SWINGS && mining.t >= (mining.strikes + STRIKE_AT) * SWING_TIME) {
    mining.strikes++;
    if (mining.strikes < MINE_SWINGS) mining.vein.userData.shake = 0.18;
    else breakVein(mining.vein);
  }
  // Let the last swing finish before lowering the arm.
  if (mining.t >= MINE_SWINGS * SWING_TIME) mining.fadeT = 0;
  return weight;
}

// Takes the energy and gives the ore, and sometimes its gem. Removes the vein's
// colliders straight away, shrinks it into the ground, throws out a few rock
// chips and grows it back later.
function breakVein(vein) {
  setEnergy(energy - MINE_ENERGY);
  const ore = vein.userData.ore;
  addItem(ore.id + "_ore");
  showLoot(ITEMS[ore.id + "_ore"]);
  if (Math.random() < ore.gemChance) {
    addItem(ore.gem);
    showLoot(ITEMS[ore.gem], true);
  }

  veins.splice(veins.indexOf(vein), 1);
  for (let i = colliders.length - 1; i >= 0; i--) {
    if (colliders[i].vein === vein) colliders.splice(i, 1);
  }

  const start = vein.scale.x;
  let t = 0;
  effects.push({
    update(dt) {
      t += dt;
      const k = Math.min(1, t / BREAK_TIME);
      vein.scale.setScalar(start * (1 - k * k));
      if (k < 1) return true;
      vein.removeFromParent();
      return false;
    },
  });
  let wait = ORE_RESPAWN;
  effects.push({
    update(dt) {
      wait -= dt;
      if (wait > 0) return true;
      respawnVein(vein, start);
      return false;
    },
  });

  const box = new THREE.Box3().setFromObject(vein);
  const centre = box.getCenter(new THREE.Vector3());
  const geometry = new THREE.DodecahedronGeometry(0.05, 0);
  const material = new THREE.MeshStandardMaterial({ color: "#6f6a64", roughness: 0.95 });
  const chips = 10;
  let chipsLeft = chips;
  for (let i = 0; i < chips; i++) {
    const chip = new THREE.Mesh(geometry, material);
    const angle = (i / chips) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 0.9 + Math.random() * 1.1;
    const vel = new THREE.Vector3(Math.cos(angle) * speed, 1.8 + Math.random() * 1.6, Math.sin(angle) * speed);
    const spin = new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(10);
    const size = 0.6 + Math.random() * 0.9;
    chip.position.copy(centre);
    chip.scale.setScalar(size);
    chip.castShadow = true;
    scene.add(chip);
    let life = 0;
    effects.push({
      update(dt) {
        life += dt;
        vel.y -= GRAVITY * dt;
        chip.position.addScaledVector(vel, dt);
        if (chip.position.y < 0.04) {
          chip.position.y = 0.04;
          vel.set(vel.x * 0.5, Math.abs(vel.y) * 0.3, vel.z * 0.5);
        }
        chip.rotation.x += spin.x * dt;
        chip.rotation.y += spin.y * dt;
        chip.scale.setScalar(size * THREE.MathUtils.clamp((DEBRIS_TIME - life) / 0.25, 0, 1));
        if (life < DEBRIS_TIME) return true;
        chip.removeFromParent();
        if (--chipsLeft === 0) {
          geometry.dispose();
          material.dispose();
        }
        return false;
      },
    });
  }
}

// Colliders are measured at full size, then the vein grows up out of the ground.
function respawnVein(vein, scale) {
  vein.scale.setScalar(scale);
  scene.add(vein);
  addRockColliders(vein);
  veins.push(vein);
  let t = 0;
  vein.scale.setScalar(0.001);
  effects.push({
    update(dt) {
      t += dt;
      const k = Math.min(1, t / BREAK_TIME);
      vein.scale.setScalar(scale * (1 - (1 - k) * (1 - k)));
      return k < 1;
    },
  });
}

// Counts 12-hour blocks on the local clock, so blocks change at local midnight and noon.
function resetPeriod(now) {
  const local = now - new Date(now).getTimezoneOffset() * 60000;
  return Math.floor(local / ENERGY_RESET_MS);
}

// Saved in this browser only, so a reload doesn't refill it before the next reset.
function loadEnergy() {
  energyPeriod = resetPeriod(Date.now());
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(ENERGY_KEY));
  } catch {}
  setEnergy(saved && saved.period === energyPeriod ? saved.value : ENERGY_MAX);
}

function updateEnergy() {
  const now = Date.now();
  const period = resetPeriod(now);
  if (period !== energyPeriod) {
    energyPeriod = period;
    setEnergy(ENERGY_MAX);
  }
  const next = new Date(now);
  next.setHours(next.getHours() < 12 ? 12 : 24, 0, 0, 0);
  const minutes = Math.ceil((next - now) / 60000);
  const title = `Energy refills to ${ENERGY_MAX} in ${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  const stat = document.getElementById("energy-stat");
  if (stat.title !== title) stat.title = title;
}

function setEnergy(value) {
  energy = THREE.MathUtils.clamp(value, 0, ENERGY_MAX);
  document.querySelector("#energy-meter span").style.width = `${(energy / ENERGY_MAX) * 100}%`;
  document.getElementById("energy-meter").setAttribute("aria-label", `Energy ${energy} of ${ENERGY_MAX}`);
  document.getElementById("energy-value").textContent = `${energy} / ${ENERGY_MAX}`;
  try {
    localStorage.setItem(ENERGY_KEY, JSON.stringify({ value: energy, period: energyPeriod }));
  } catch {}
}

function addItem(id, count = 1) {
  inventory.set(id, (inventory.get(id) || 0) + count);
  renderInventory();
  renderStations();
}

function removeItem(id, count) {
  const left = (inventory.get(id) || 0) - count;
  if (left > 0) inventory.set(id, left);
  else inventory.delete(id);
  renderInventory();
  renderStations();
}

// A short "+1 Iron ore" line above the prompt; gems get a highlight.
function showLoot(item, rare = false) {
  const line = document.createElement("div");
  line.className = "loot" + (rare ? " rare" : "");
  const img = document.createElement("img");
  img.src = item.icon;
  img.alt = "";
  line.append(img, `+1 ${item.label}`);
  document.getElementById("loot").append(line);
  setTimeout(() => line.remove(), 2600);
}

function buildInventoryGrid() {
  const grid = document.getElementById("inv-grid");
  for (let i = 0; i < INVENTORY_SLOTS; i++) {
    const slot = document.createElement("button");
    slot.className = "slot";
    slot.type = "button";
    slot.tabIndex = -1;
    slot.addEventListener("mousedown", (event) => event.preventDefault());
    grid.appendChild(slot);
  }
}

// Owned pickaxes first (click one to hold it), then items in pickup order.
function renderInventory() {
  const entries = [
    ...PICKAXES.filter((p) => owned.has(p.id) && skins[p.id]).map((p) => ({
      icon: `./${skins[p.id].sprite}`,
      title: pickaxeLabel(p.id),
      active: p.id === held,
      pick: () => holdPickaxe(p.id),
    })),
    ...[...inventory].map(([id, count]) => ({
      icon: ITEMS[id].icon,
      title: `${ITEMS[id].label} × ${count}`,
      count,
    })),
  ];
  document.querySelectorAll("#inv-grid .slot").forEach((slot, i) => {
    const entry = entries[i];
    slot.replaceChildren();
    slot.title = entry ? entry.title : "";
    slot.classList.toggle("active", !!entry?.active);
    slot.onclick = entry?.pick || null;
    if (!entry) return;
    const img = document.createElement("img");
    img.src = entry.icon;
    img.alt = entry.title;
    slot.append(img);
    if (entry.count) {
      const badge = document.createElement("span");
      badge.className = "count";
      badge.textContent = entry.count;
      slot.append(badge);
    }
  });
}

function updateEffects(dt) {
  updateEnergy();
  for (let i = effects.length - 1; i >= 0; i--) {
    if (!effects[i].update(dt)) effects.splice(i, 1);
  }
  for (const vein of veins) {
    const shake = vein.userData.shake || 0;
    if (!vein.userData.home) vein.userData.home = vein.position.clone();
    vein.position.copy(vein.userData.home);
    if (shake <= 0) continue;
    vein.userData.shake = Math.max(0, shake - dt);
    vein.position.x += (Math.random() - 0.5) * shake * 0.25;
    vein.position.z += (Math.random() - 0.5) * shake * 0.25;
  }
  updateLabels();
  const target = ready && !airborne && !mining && targetInReach();
  const prompt = document.getElementById("prompt");
  prompt.classList.toggle("hidden", !target);
  if (!target) return;
  let html;
  if (target.station) {
    html = `<kbd>F</kbd>${STATIONS.find((s) => s.id === target.station).verb}`;
  } else {
    const blocker = mineBlocker(target.vein);
    html = blocker || `<kbd>F</kbd>Mine ${target.vein.userData.ore.label}`;
  }
  if (prompt.innerHTML !== html) prompt.innerHTML = html;
}

// A name tag that floats over a vein or station, for finding the right one.
function addLabel(parent, text, worldY) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const font = "600 40px system-ui, sans-serif";
  ctx.font = font;
  canvas.width = Math.ceil(ctx.measureText(text).width) + 40;
  canvas.height = 64;
  ctx.font = font;
  ctx.fillStyle = "rgba(10, 12, 18, 0.62)";
  ctx.beginPath();
  ctx.roundRect(0, 0, canvas.width, canvas.height, 18);
  ctx.fill();
  ctx.fillStyle = "#e7edf5";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 0 })
  );
  const height = 0.13;
  sprite.scale.set((height * canvas.width) / canvas.height, height, 1);
  sprite.renderOrder = 2;
  // The parent may be scaled; keep the tag the same size and at `worldY`.
  const s = parent.scale.x;
  sprite.scale.divideScalar(s);
  sprite.position.y = worldY / s;
  parent.add(sprite);
  labels.push(sprite);
}

// Tags fade in as the character walks up to them.
function updateLabels() {
  const p = character.position;
  for (const sprite of labels) {
    const at = sprite.parent;
    if (!at) continue;
    const d = Math.hypot(p.x - at.position.x, p.z - at.position.z);
    sprite.material.opacity = THREE.MathUtils.clamp((LABEL_RANGE - d) / 0.8, 0, 1);
  }
}

// One circle on the ground per rock mesh, sized from its world bounding box.
// The crystal mesh ("metall" material) spans both rocks, so it's skipped or
// it would wall off the gap between them.
function addRockColliders(vein) {
  vein.updateMatrixWorld(true);
  const box = new THREE.Box3();
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  vein.traverse((obj) => {
    if (!obj.isMesh) return;
    if (![].concat(obj.material).some((m) => /rock/i.test(m.name))) return;
    box.setFromObject(obj);
    box.getCenter(center);
    box.getSize(size);
    colliders.push({
      x: center.x,
      z: center.z,
      r: (Math.max(size.x, size.z) / 2) * ROCK_TIGHTEN,
      vein,
    });
  });
}

// Push the character out of any rock it overlaps; it slides around the edge.
function resolveCollisions() {
  const p = character.position;
  for (const c of colliders) {
    const dx = p.x - c.x;
    const dz = p.z - c.z;
    const min = c.r + CHAR_RADIUS;
    const distSq = dx * dx + dz * dz;
    if (distSq >= min * min) continue;
    const dist = Math.sqrt(distSq);
    if (dist < 1e-6) {
      p.x = c.x + min;
      continue;
    }
    p.x = c.x + (dx / dist) * min;
    p.z = c.z + (dz / dist) * min;
  }
}

function down(...codes) {
  return codes.some((code) => keys.has(code));
}

function onKeyDown(event) {
  if (isTyping()) return;
  keys.add(event.code);
  if (
    event.code === "KeyW" ||
    event.code === "KeyA" ||
    event.code === "KeyS" ||
    event.code === "KeyD" ||
    event.code === "Space" ||
    event.code.startsWith("Arrow")
  ) {
    event.preventDefault();
  }
  if (event.repeat) return;
  if (event.code === "Space") jump();
  if (event.code === "KeyE") togglePanel("emotes");
  if (event.code === "KeyI") openModal("inventory");
  if (event.code === "Escape") closeModal();
  if (event.code === "KeyF") interact();
  if (event.code === "KeyQ") cycleHeld();
  const slot = /^Digit([1-9])$/.exec(event.code);
  if (slot && EMOTES[slot[1] - 1]) playEmote(EMOTES[slot[1] - 1]);
}

function isTyping() {
  const el = document.activeElement;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
}

function setupShell() {
  buildInventoryGrid();
  renderInventory();
  renderStations();
  loadEnergy();
  // TEST tools, so a reviewer can try every tier without days of mining.
  document.getElementById("test-energy").addEventListener("click", () => setEnergy(ENERGY_MAX));
  document.getElementById("test-ore").addEventListener("click", () => {
    for (const ore of ORES) addItem(ore.id + "_ore", 20);
  });
  document.getElementById("test-picks").addEventListener("click", () => {
    for (const p of PICKAXES) owned.add(p.id);
    renderInventory();
    renderStations();
  });
  document.getElementById("settings-btn").addEventListener("click", () => openModal("settings"));
  document.getElementById("support-btn").addEventListener("click", () => toggleCard("support-card"));
  document.getElementById("slot-pick").addEventListener("click", () => openModal("inventory"));
  document.getElementById("chat-collapse").addEventListener("click", () => {
    document.getElementById("chat").classList.toggle("collapsed");
  });
  document.getElementById("chat-settings").addEventListener("click", () => openModal("chat"));
  document.getElementById("modal").addEventListener("click", (event) => {
    if (event.target.id === "modal") closeModal();
  });
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;
    appendChat("You", text);
    input.value = "";
  });
}

function toggleCard(id) {
  document.getElementById(id).classList.toggle("hidden");
}

let modalName = null;

function openModal(name) {
  const modal = document.getElementById("modal");
  if (modalName === name) {
    closeModal();
    return;
  }
  modalName = name;
  const titles = {
    settings: "Settings",
    chat: "Chat settings",
    inventory: "Inventory",
    furnace: "Furnace",
    smith: "Blacksmith",
  };
  document.getElementById("modal-title").textContent = titles[name];
  for (const pane of modal.querySelectorAll(".modal-pane")) {
    pane.classList.toggle("open", pane.dataset.pane === name);
  }
  modal.classList.remove("hidden");
}

function closeModal() {
  modalName = null;
  document.getElementById("modal").classList.add("hidden");
}

function togglePanel(id) {
  document.getElementById(id).classList.toggle("hidden");
}

function appendChat(name, text) {
  const log = document.getElementById("chat-log");
  log.querySelector(".empty")?.remove();
  const line = document.createElement("p");
  const who = document.createElement("b");
  who.textContent = name + ": ";
  line.append(who, document.createTextNode(text));
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

function jump() {
  if (!ready || airborne) return;
  stopEmote();
  stopMining();
  airborne = true;
  jumpVel = JUMP_SPEED;
}

function updateJump(dt) {
  if (airborne) {
    jumpVel -= GRAVITY * dt;
    jumpY += jumpVel * dt;
    if (jumpY <= 0) {
      jumpY = 0;
      jumpVel = 0;
      airborne = false;
      landTimer = LAND_TIME;
    }
  }
  landTimer = Math.max(0, landTimer - dt);
  airBlend += ((airborne ? 1 : 0) - airBlend) * (1 - Math.exp(-14 * dt));
  character.position.y = jumpY;
}

function buildEmotePanel() {
  const grid = document.querySelector("#emotes .grid");
  EMOTES.forEach((def, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.tabIndex = -1;
    button.innerHTML = `<span class="icon">${def.icon}</span>${def.label}<kbd>${i + 1}</kbd>`;
    // Keep focus on the page so Space jumps instead of re-clicking the button.
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => playEmote(def));
    grid.appendChild(button);
    emoteButtons.set(def, button);
  });
}

function playEmote(def) {
  if (!ready || airborne) return;
  if (emote && emote.def === def && emote.fadeT < 0) return;
  stopMining();
  emote = { def, t: 0, fadeT: -1 };
  markActiveEmote();
}

function stopEmote() {
  if (emote && emote.fadeT < 0) {
    emote.fadeT = 0;
    markActiveEmote();
  }
}

function markActiveEmote() {
  for (const [def, button] of emoteButtons) {
    button.classList.toggle("active", !!emote && emote.def === def && emote.fadeT < 0);
  }
}

// Advances the current emote and returns its blend weight (0..1).
function updateEmote(dt) {
  if (!emote) return 0;
  emote.t += dt;
  const { duration } = emote.def;
  let weight = Math.min(1, emote.t / EMOTE_FADE_IN);
  if (duration > 0) {
    if (emote.t >= duration) {
      emote = null;
      markActiveEmote();
      return 0;
    }
    weight *= Math.min(1, (duration - emote.t) / EMOTE_FADE_OUT);
  }
  if (emote.fadeT >= 0) {
    emote.fadeT += dt;
    weight *= 1 - emote.fadeT / EMOTE_FADE_OUT;
    if (emote.fadeT >= EMOTE_FADE_OUT) {
      emote = null;
      return 0;
    }
  }
  return Math.max(0, weight);
}

function onPointerDown(event) {
  dragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
}

function onPointerMove(event) {
  if (!dragging) return;
  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  lastX = event.clientX;
  lastY = event.clientY;
  camYaw -= dx * 0.005;
  pitch = THREE.MathUtils.clamp(pitch - dy * 0.0035, 0.16, 1.2);
}

function onWheel(event) {
  event.preventDefault();
  distance = THREE.MathUtils.clamp(distance + event.deltaY * 0.003, 1.7, 8);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function legPose(step, weight) {
  const s = Math.sin(step);
  const lift = Math.max(0, s);
  const back = Math.max(0, -s);
  return {
    thigh: SWING * (lift * THIGH_FORWARD - back * THIGH_BACK) * weight,
    knee: (lift * KNEE_LIFT + back * KNEE_BACK) * weight,
    toe: SWING * lift * TOE_AMP * weight,
    arm: -SWING * s * ARM_AMP * weight,
  };
}

function swingBone(bone, axis, angle) {
  const rest = restLocal.get(bone.name);
  if (Math.abs(angle) < 1e-4) {
    bone.quaternion.copy(rest);
    return;
  }
  const parentQ = bone.parent.getWorldQuaternion(qA);
  qB.setFromAxisAngle(axis, angle);
  qC.copy(parentQ).invert().multiply(qB).multiply(parentQ);
  bone.quaternion.copy(qC).multiply(rest);
}

function setFoot(bone, pitchAngle, axis) {
  const rest = restWorld.get(bone.name);
  const parentQ = bone.parent.getWorldQuaternion(qA);
  qB.setFromAxisAngle(axis, pitchAngle);
  qC.copy(character.quaternion).multiply(rest);
  qB.multiply(qC);
  bone.quaternion.copy(parentQ).invert().multiply(qB);
}

function applyGait() {
  character.updateMatrixWorld(true);
  lateral.set(1, 0, 0).applyQuaternion(character.quaternion);
  const left = legPose(phase, blend);
  const right = legPose(phase + Math.PI, blend);

  swingBone(bones.thigh_l, lateral, left.thigh);
  swingBone(bones.calf_l, lateral, left.knee);
  setFoot(bones.foot_l, left.toe, lateral);

  swingBone(bones.thigh_r, lateral, right.thigh);
  swingBone(bones.calf_r, lateral, right.knee);
  setFoot(bones.foot_r, right.toe, lateral);

  swingBone(bones.upperarm_l, lateral, left.arm);
  swingBone(bones.upperarm_r, lateral, right.arm);

  const split = 1 - Math.abs(Math.cos(phase));
  const idle = Math.sin(clock.elapsedTime * 1.5) * 0.006 * (1 - blend);
  modelHolder.position.y = footOffset - split * STRIDE_DIP * blend + idle;
}

// Adds a character-space rotation to a pose, summing with what's there.
function bend(pose, name, x = 0, y = 0, z = 0) {
  const a = pose[name] || (pose[name] = [0, 0, 0]);
  a[0] += x;
  a[1] += y;
  a[2] += z;
}

// Bends both knees by `angle`, keeping the feet flat and under the hips.
// `drop` lowers the body so the feet stay on the ground; leave it off in the air.
function bendKnees(pose, angle, drop = true) {
  for (const side of ["l", "r"]) {
    bend(pose, "thigh_" + side, -angle);
    bend(pose, "calf_" + side, angle * 2);
    bend(pose, "foot_" + side, -angle);
  }
  if (drop) pose.drop += (1 - Math.cos(angle)) * legLength;
}

function newPose() {
  return { drop: 0 };
}

function wavePose(t) {
  const p = newPose();
  const swing = Math.sin(t * 9);
  bend(p, "upperarm_r", -0.35, 0, -0.85);
  bend(p, "lowerarm_r", 0, 0, -1.2 + swing * 0.45);
  bend(p, "hand_r", 0, 0, swing * 0.2);
  bend(p, "spine_03", 0, 0, 0.06);
  bend(p, "head", 0, -0.15, -0.12);
  return p;
}

function cheerPose(t) {
  const p = newPose();
  const pump = Math.sin(t * 10);
  for (const s of [1, -1]) {
    const side = s > 0 ? "l" : "r";
    // Arms up and forward: straight overhead would sink into the big head.
    bend(p, "upperarm_" + side, -0.5, 0, s * (1.0 + pump * 0.15));
    bend(p, "lowerarm_" + side, 0, 0, s * 0.7);
  }
  bend(p, "head", -0.22);
  // Little hops on the beat.
  p.drop -= Math.abs(Math.sin(t * 5)) * 0.06;
  return p;
}

function dancePose(t) {
  const p = newPose();
  const beat = t * Math.PI * 2 * 1.8;
  const sway = Math.sin(beat);
  bendKnees(p, 0.22 + 0.14 * Math.sin(beat * 2));
  bend(p, "spine_01", 0, sway * 0.22, sway * 0.14);
  bend(p, "upperarm_l", -0.3, 0, 0.5 + Math.max(0, sway) * 1.1);
  bend(p, "upperarm_r", -0.3, 0, -(0.5 + Math.max(0, -sway) * 1.1));
  bend(p, "lowerarm_l", 0, 0, 0.9);
  bend(p, "lowerarm_r", 0, 0, -0.9);
  bend(p, "head", Math.sin(beat * 2) * 0.08, 0, -sway * 0.12);
  return p;
}

function tauntPose(t) {
  const p = newPose();
  // Hands on hips, chest out, head waggling.
  for (const s of [1, -1]) {
    const side = s > 0 ? "l" : "r";
    bend(p, "upperarm_" + side, 0.35, 0, s * 0.3);
    bend(p, "lowerarm_" + side, 0, 0, -s * 1.9);
  }
  bend(p, "spine_03", -0.12);
  bend(p, "head", -0.12, Math.sin(t * 7) * 0.35, Math.sin(t * 7) * 0.08);
  return p;
}

function bowPose(t) {
  const p = newPose();
  const down = THREE.MathUtils.smoothstep(t, 0.1, 0.6) * (1 - THREE.MathUtils.smoothstep(t, 1.3, 1.8));
  bend(p, "spine_01", 0.6 * down);
  bend(p, "neck_01", 0.2 * down);
  bend(p, "upperarm_r", -0.4 * down, 0, 0.45 * down);
  bend(p, "lowerarm_r", -0.3 * down, 0, 1.0 * down);
  return p;
}

function shrugPose(t) {
  const p = newPose();
  const up = THREE.MathUtils.smoothstep(t, 0.05, 0.35) * (1 - THREE.MathUtils.smoothstep(t, 1.2, 1.6));
  for (const s of [1, -1]) {
    const side = s > 0 ? "l" : "r";
    bend(p, "clavicle_" + side, 0, 0, s * 0.28 * up);
    bend(p, "upperarm_" + side, 0, 0, -s * 0.25 * up);
    bend(p, "lowerarm_" + side, -1.1 * up, 0, s * 0.6 * up);
  }
  bend(p, "head", 0, 0, 0.25 * up);
  return p;
}

// A two-handed overhead chop: wind up slowly, strike fast at STRIKE_AT,
// then recover. The wrist stays cocked so the pick points up over the shoulder
// on the wind-up and down into the rock on the strike.
function minePose(t) {
  const p = newPose();
  const u = (t % SWING_TIME) / SWING_TIME;
  const raise =
    u < STRIKE_AT
      ? THREE.MathUtils.smoothstep(u, 0, STRIKE_AT * 0.85)
      : 1 - THREE.MathUtils.smoothstep(u, STRIKE_AT, STRIKE_AT + 0.08);
  const hit = 1 - raise;
  bendKnees(p, 0.18);
  bend(p, "spine_01", 0.3 * hit - 0.12 * raise);
  bend(p, "upperarm_r", -0.7 - 1.7 * raise, 0, -0.25);
  bend(p, "lowerarm_r", -0.5 * raise);
  bend(p, "hand_r", 1.2 * hit + 1.1 * raise);
  bend(p, "upperarm_l", -0.7 - 1.5 * raise, -0.3, 0.2);
  bend(p, "lowerarm_l", -0.5 * raise, 0, 0.4);
  bend(p, "head", -0.15 * raise + 0.15 * hit);
  return p;
}

function jumpPose() {
  const p = newPose();
  bendKnees(p, 0.55 * airBlend, false);
  bend(p, "upperarm_l", 0, 0, 0.7 * airBlend);
  bend(p, "upperarm_r", 0, 0, -0.7 * airBlend);
  if (landTimer > 0) bendKnees(p, 0.45 * Math.sin((landTimer / LAND_TIME) * Math.PI));
  return p;
}

// Layers the jump pose, the current emote and mining on top of the walk cycle.
function applyPose(emoteWeight, mineWeight) {
  for (const name of POSE_BONES) {
    if (bones[name] && !BONES.includes(name)) bones[name].quaternion.copy(restLocal.get(name));
  }
  const pose = jumpPose();
  if (emote && emoteWeight > 0) addPose(pose, emote.def.pose(emote.t), emoteWeight);
  if (mining && mineWeight > 0) addPose(pose, minePose(mining.t), mineWeight);

  qD.copy(character.quaternion).invert();
  for (const name of POSE_BONES) {
    const bone = bones[name];
    const angles = pose[name];
    if (!bone || !angles) continue;
    ePose.set(angles[0], angles[1], angles[2], "ZXY");
    // Character space -> world, then into the bone's parent space.
    qB.setFromEuler(ePose).premultiply(character.quaternion).multiply(qD);
    const parentQ = bone.parent.getWorldQuaternion(qA);
    qC.copy(parentQ).invert().multiply(qB).multiply(parentQ);
    bone.quaternion.premultiply(qC);
  }
  modelHolder.position.y -= pose.drop;
}

function addPose(pose, extra, weight) {
  for (const name of POSE_BONES) {
    if (!extra[name]) continue;
    const [x, y, z] = extra[name];
    bend(pose, name, x * weight, y * weight, z * weight);
  }
  pose.drop += extra.drop * weight;
}

function updateMove(dt) {
  let ix = 0;
  let iz = 0;
  if (down("KeyW", "ArrowUp")) iz += 1;
  if (down("KeyS", "ArrowDown")) iz -= 1;
  if (down("KeyD", "ArrowRight")) ix += 1;
  if (down("KeyA", "ArrowLeft")) ix -= 1;

  const sin = Math.sin(camYaw);
  const cos = Math.cos(camYaw);
  vForward.set(-sin, 0, -cos);
  vRight.set(cos, 0, -sin);

  const len = Math.hypot(ix, iz);
  if (len > 0) {
    stopEmote();
    stopMining();
    ix /= len;
    iz /= len;
    vMove.set(vForward.x * iz + vRight.x * ix, 0, vForward.z * iz + vRight.z * ix);
    character.position.addScaledVector(vMove, MOVE_SPEED * dt);
    resolveCollisions();
    const limit = HALF - EDGE;
    character.position.x = THREE.MathUtils.clamp(character.position.x, -limit, limit);
    character.position.z = THREE.MathUtils.clamp(character.position.z, -limit, limit);
    const targetYaw = Math.atan2(vMove.x, vMove.z);
    const turn = Math.atan2(Math.sin(targetYaw - yaw), Math.cos(targetYaw - yaw));
    yaw += turn * (1 - Math.exp(-12 * dt));
    phase += dt * CYCLE_HZ * Math.PI * 2;
  }

  const moving = len > 0 && !airborne ? 1 : 0;
  blend += (moving - blend) * (1 - Math.exp(-8 * dt));
  character.rotation.y = yaw;
}

function updateCamera(dt, snap) {
  const horiz = Math.cos(pitch) * distance;
  // Follow only half of a jump so the camera doesn't bounce as much.
  const height = lookHeight + jumpY * 0.5;
  desiredCam.set(
    character.position.x + Math.sin(camYaw) * horiz,
    height + Math.sin(pitch) * distance,
    character.position.z + Math.cos(camYaw) * horiz
  );
  if (snap) camera.position.copy(desiredCam);
  else camera.position.lerp(desiredCam, 1 - Math.exp(-8 * dt));
  lookAt.set(character.position.x, height, character.position.z);
  camera.lookAt(lookAt);
}

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (ready) {
    updateMove(dt);
    updateJump(dt);
    const emoteWeight = updateEmote(dt);
    const mineWeight = updateMining(dt);
    applyGait();
    applyPose(emoteWeight, mineWeight);
    blob.position.x = character.position.x;
    blob.position.z = character.position.z;
    blob.scale.setScalar(1 / (1 + jumpY * 1.5));
    blob.material.opacity = 1 - Math.min(0.6, jumpY);
  }
  updateEffects(dt);
  updateCamera(dt, !ready);
  renderer.render(scene, camera);
}
