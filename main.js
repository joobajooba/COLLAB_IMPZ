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

const keys = new Set();
const colliders = [];
const restLocal = new Map();
const restWorld = new Map();
const bones = {};

const qA = new THREE.Quaternion();
const qB = new THREE.Quaternion();
const qC = new THREE.Quaternion();
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

      for (const name of BONES) {
        restLocal.set(name, bones[name].quaternion.clone());
        restWorld.set(name, bones[name].getWorldQuaternion(new THREE.Quaternion()));
      }

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
    event.code.startsWith("Arrow")
  ) {
    event.preventDefault();
  }
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

  const moving = len > 0 ? 1 : 0;
  blend += (moving - blend) * (1 - Math.exp(-8 * dt));
  character.rotation.y = yaw;
}

function updateCamera(dt, snap) {
  const horiz = Math.cos(pitch) * distance;
  desiredCam.set(
    character.position.x + Math.sin(camYaw) * horiz,
    lookHeight + Math.sin(pitch) * distance,
    character.position.z + Math.cos(camYaw) * horiz
  );
  if (snap) camera.position.copy(desiredCam);
  else camera.position.lerp(desiredCam, 1 - Math.exp(-8 * dt));
  lookAt.set(character.position.x, lookHeight, character.position.z);
  camera.lookAt(lookAt);
}

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (ready) {
    updateMove(dt);
    applyGait();
    blob.position.x = character.position.x;
    blob.position.z = character.position.z;
  }
  updateCamera(dt, !ready);
  renderer.render(scene, camera);
}
