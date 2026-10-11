import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const PLATFORM = 10;
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

// Where copies of the ore vein are placed; the first is the original spot.
const ORE_SPOTS = [
  { x: 1.55, z: -1.05, rot: 0, scale: 1 },
  { x: -2.6, z: -2.4, rot: 1.9, scale: 0.85 },
  { x: -3.2, z: 1.8, rot: 4.1, scale: 1.1 },
  { x: 3.1, z: 2.7, rot: 2.7, scale: 0.9 },
  { x: 0.4, z: 3.4, rot: 5.3, scale: 0.75 },
];

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
sun.shadow.camera.far = 24;
sun.shadow.camera.left = -8;
sun.shadow.camera.right = 8;
sun.shadow.camera.top = 8;
sun.shadow.camera.bottom = -8;
sun.shadow.bias = -0.0004;
scene.add(sun);
scene.add(sun.target);

const fill = new THREE.DirectionalLight("#9eb6ff", 0.55);
fill.position.set(-4, 3, -2);
scene.add(fill);

buildPlatform();
const blob = buildContactShadow();
buildEmotePanel();

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
renderer.setAnimationLoop(frame);

function buildPlatform() {
  const top = new THREE.MeshStandardMaterial({
    map: gridTexture(),
    roughness: 0.92,
    metalness: 0,
  });
  const side = new THREE.MeshStandardMaterial({
    color: "#1b2330",
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
      new THREE.LineBasicMaterial({ color: "#93a6c0" })
    )
  );
  scene.add(slab);
}

function gridTexture() {
  const size = 1024;
  const cells = 10;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#2a3344";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(176, 196, 220, 0.55)";
  ctx.lineWidth = 3;
  for (let i = 0; i <= cells; i++) {
    const p = (i / cells) * size + 1.5;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
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

      ready = true;
      status.classList.add("hidden");
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

    for (const spot of ORE_SPOTS) {
      const vein = new THREE.Group();
      vein.add(fbx.clone());
      vein.position.set(spot.x, 0, spot.z);
      vein.rotation.y = spot.rot;
      vein.scale.setScalar(spot.scale);
      scene.add(vein);
      addRockColliders(vein);
    }
  }, undefined, (error) => {
    console.error(error);
  });
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
  if (event.code === "KeyE") toggleEmotePanel();
  const slot = /^Digit([1-9])$/.exec(event.code);
  if (slot && EMOTES[slot[1] - 1]) playEmote(EMOTES[slot[1] - 1]);
}

function jump() {
  if (!ready || airborne) return;
  stopEmote();
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

function toggleEmotePanel() {
  document.getElementById("emotes").classList.toggle("collapsed");
}

function playEmote(def) {
  if (!ready || airborne) return;
  if (emote && emote.def === def && emote.fadeT < 0) return;
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

function jumpPose() {
  const p = newPose();
  bendKnees(p, 0.55 * airBlend, false);
  bend(p, "upperarm_l", 0, 0, 0.7 * airBlend);
  bend(p, "upperarm_r", 0, 0, -0.7 * airBlend);
  if (landTimer > 0) bendKnees(p, 0.45 * Math.sin((landTimer / LAND_TIME) * Math.PI));
  return p;
}

// Layers the jump pose and the current emote on top of the walk cycle.
function applyPose(emoteWeight) {
  for (const name of POSE_BONES) {
    if (bones[name] && !BONES.includes(name)) bones[name].quaternion.copy(restLocal.get(name));
  }
  const pose = jumpPose();
  if (emote && emoteWeight > 0) {
    const extra = emote.def.pose(emote.t);
    for (const name of POSE_BONES) {
      if (!extra[name]) continue;
      const [x, y, z] = extra[name];
      bend(pose, name, x * emoteWeight, y * emoteWeight, z * emoteWeight);
    }
    pose.drop += extra.drop * emoteWeight;
  }

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
    applyGait();
    applyPose(emoteWeight);
    blob.position.x = character.position.x;
    blob.position.z = character.position.z;
    blob.scale.setScalar(1 / (1 + jumpY * 1.5));
    blob.material.opacity = 1 - Math.min(0.6, jumpY);
  }
  updateCamera(dt, !ready);
  renderer.render(scene, camera);
}
