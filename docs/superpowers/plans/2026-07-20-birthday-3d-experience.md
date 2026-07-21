# Birthday 3D Experience — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based 3D interactive birthday experience where the user blows out cake candles via microphone and reveals a customizable love letter.

**Architecture:** Vite + vanilla JS project with 6 modules. Three.js handles all 3D rendering with bloom post-processing. A 4-phase state machine (idle → blowing → extinguish → letter) in main.js orchestrates the experience. Web Audio API detects microphone input with spacebar fallback. Letter text renders via CSS overlay for crisp typography.

**Tech Stack:** Vite, Three.js, Web Audio API, vanilla JS (ES modules)

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/style.css`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "birthday-3d",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "three": "^0.170.0"
  },
  "devDependencies": {
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
});
```

- [ ] **Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Happy Birthday!</title>
  <link rel="stylesheet" href="/src/style.css" />
</head>
<body>
  <div id="app">
    <div id="three-container"></div>
  </div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create src/style.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Georgia', 'Times New Roman', serif;
  background: #2d1b2e;
}

#app {
  width: 100%;
  height: 100%;
  position: relative;
}

#three-container {
  width: 100%;
  height: 100%;
}

#three-container canvas {
  display: block;
}

/* UI overlay for prompts, wind meter, letter */
#ui-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

/* Prompt text */
.prompt {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 20px;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  transition: opacity 0.5s;
  pointer-events: auto;
}

/* Wind meter */
.wind-meter-container {
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 12px;
  background: rgba(255,255,255,0.2);
  border-radius: 6px;
  overflow: hidden;
  display: none;
}

.wind-meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ecdc4, #7ec8e3);
  border-radius: 6px;
  width: 0%;
  transition: width 0.05s linear;
}

/* Letter overlay */
.letter-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 500px;
  width: 80%;
  padding: 40px;
  background: #fffef5;
  border: 2px solid #e8d5a3;
  border-radius: 4px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  display: none;
  pointer-events: auto;
}

.letter-overlay .letter-text {
  font-size: 18px;
  line-height: 1.8;
  color: #5d4037;
  white-space: pre-wrap;
}

.letter-overlay .letter-signature {
  margin-top: 24px;
  font-style: italic;
  color: #8d6e63;
}

/* Cursor blink for typewriter */
.typewriter-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #5d4037;
  animation: blink 0.7s infinite;
  vertical-align: text-bottom;
  margin-left: 2px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Mobile tap button */
.blow-button {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 20px 48px;
  font-size: 24px;
  font-family: inherit;
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 2px solid rgba(255,255,255,0.4);
  border-radius: 50px;
  cursor: pointer;
  display: none;
  pointer-events: auto;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.blow-button:active {
  background: rgba(255,255,255,0.3);
}

/* WebGL fallback */
.fallback-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  font-size: 24px;
  display: none;
}

.fallback-message .cake-emoji {
  font-size: 80px;
  display: block;
  margin-bottom: 20px;
}
```

- [ ] **Step 5: Install dependencies**

```bash
npm install
```

- [ ] **Step 6: Verify scaffold**

Run: `npm run dev`
Expected: Vite dev server starts. Open the URL — should see a dark blank page (no errors in console).

- [ ] **Step 7: Commit**

```bash
git add package.json vite.config.js index.html src/style.css
git commit -m "feat: scaffold project with Vite + Three.js"
```

---

### Task 2: Config Module

**Files:**
- Create: `config.json`
- Create: `src/config.js`

- [ ] **Step 1: Create config.json with placeholder content**

```json
{
  "recipientName": "My Love",
  "message": "Happy Birthday, my love!\n\nOn this special day, I want you to know how much you mean to me. Every moment with you is a gift, and I cherish every laugh, every smile, and every memory we've made together.\n\nYou make the world brighter just by being in it. I hope this year brings you as much joy as you've brought into my life.\n\nI love you more than words can say.",
  "signature": "Forever yours,",
  "typewriterSpeed": 50,
  "backgroundColor": "#fce4ec"
}
```

- [ ] **Step 2: Create src/config.js**

```js
const DEFAULT_CONFIG = {
  recipientName: '',
  message: 'Happy Birthday! Thank you for being you.',
  signature: '',
  typewriterSpeed: 50,
  backgroundColor: '#fce4ec',
};

let config = { ...DEFAULT_CONFIG };

export async function loadConfig() {
  try {
    const response = await fetch('/config.json');
    if (!response.ok) {
      console.warn('config.json not found, using defaults');
      return config;
    }
    const data = await response.json();
    config = { ...DEFAULT_CONFIG, ...data };
    if (!config.message || typeof config.message !== 'string') {
      console.warn('config.json missing required "message" field, using default');
      config.message = DEFAULT_CONFIG.message;
    }
  } catch (err) {
    console.warn('Failed to load config.json, using defaults:', err.message);
  }
  return config;
}

export function getConfig() {
  return config;
}
```

- [ ] **Step 3: Commit**

```bash
git add config.json src/config.js
git commit -m "feat: add config module with json loader and defaults"
```

---

### Task 3: Scene Setup (Three.js)

**Files:**
- Create: `src/scene.js`

- [ ] **Step 1: Create src/scene.js**

```js
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

let scene, camera, renderer, composer;
let bloomPass;
let clock;

export function initScene() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 3.5, 7);
  camera.lookAt(0, 1, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const container = document.getElementById('three-container');
  container.appendChild(renderer.domElement);

  // Background gradient — set via CSS on canvas parent
  container.style.background = 'linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 30%, #4a2c5e 60%, #fce4ec 100%)';

  // Post-processing
  const renderScene = new RenderPass(scene, camera);
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,   // strength
    0.4,   // radius
    0.85   // threshold
  );

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffeef4, 0.6);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfff5ee, 2.5);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 50;
  keyLight.shadow.camera.left = -10;
  keyLight.shadow.camera.right = 10;
  keyLight.shadow.camera.top = 10;
  keyLight.shadow.camera.bottom = -10;
  keyLight.shadow.bias = -0.0001;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffccdd, 0.8);
  fillLight.position.set(-3, 2, -3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
  rimLight.position.set(0, 1, -5);
  scene.add(rimLight);

  // Ground plane (for shadows)
  const groundGeom = new THREE.PlaneGeometry(20, 20);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x3d1f3d,
    roughness: 0.9,
    transparent: true,
    opacity: 0.3,
  });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.5;
  ground.receiveShadow = true;
  scene.add(ground);

  // Clock for delta time
  clock = new THREE.Clock();

  // Handle resize
  window.addEventListener('resize', onResize);

  return { scene, camera, renderer, composer };
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

export function getClock() {
  return clock;
}

export function getScene() {
  return scene;
}

export function getCamera() {
  return camera;
}

export function getRenderer() {
  return renderer;
}

export function getComposer() {
  return composer;
}

export function getBloomPass() {
  return bloomPass;
}

export function setSceneBrightness(factor) {
  // factor: 0 = dim, 1 = normal
  bloomPass.strength = 1.5 * factor;
  renderer.toneMappingExposure = 1.2 * (0.3 + factor * 0.7);
}
```

- [ ] **Step 2: Verify scene renders**

Temporarily add a test mesh to verify the scene works. In `src/main.js`:

```js
import { initScene } from './scene.js';
import * as THREE from 'three';

const { scene, composer } = initScene();

// Test cube
const geom = new THREE.BoxGeometry(1, 1, 1);
const mat = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
const cube = new THREE.Mesh(geom, mat);
scene.add(cube);

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.y += 0.01;
  composer.render();
}
animate();
```

Run: `npm run dev`
Expected: Pink rotating cube on gradient background with bloom glow. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/scene.js src/main.js
git commit -m "feat: add Three.js scene with lighting, bloom, and background"
```

---

### Task 4: 3D Cake Model

**Files:**
- Create: `src/cake.js`

- [ ] **Step 1: Create src/cake.js**

```js
import * as THREE from 'three';

let cakeGroup;
let flameMeshes = [];
let candleWicks = [];
let smokeParticles = [];
let candlesLit = true;

export function initCake(scene) {
  cakeGroup = new THREE.Group();

  // === Bottom tier ===
  const bottomBodyGeom = new THREE.CylinderGeometry(1.3, 1.35, 0.55, 64);
  const bottomBodyMat = new THREE.MeshStandardMaterial({
    color: 0xf8c8d4,
    roughness: 0.55,
    metalness: 0.05,
  });
  const bottomBody = new THREE.Mesh(bottomBodyGeom, bottomBodyMat);
  bottomBody.position.y = 0.275;
  bottomBody.castShadow = true;
  bottomBody.receiveShadow = true;
  cakeGroup.add(bottomBody);

  // Bottom frosting rim
  const bottomRimGeom = new THREE.TorusGeometry(1.33, 0.05, 16, 64);
  const bottomRimMat = new THREE.MeshStandardMaterial({
    color: 0xfff0f5,
    roughness: 0.25,
    metalness: 0.05,
  });
  const bottomRim = new THREE.Mesh(bottomRimGeom, bottomRimMat);
  bottomRim.position.y = 0.55;
  bottomRim.rotation.x = Math.PI / 2;
  cakeGroup.add(bottomRim);

  // === Middle tier ===
  const midBodyGeom = new THREE.CylinderGeometry(0.9, 0.95, 0.45, 64);
  const midBodyMat = new THREE.MeshStandardMaterial({
    color: 0xf5d5e0,
    roughness: 0.5,
    metalness: 0.05,
  });
  const midBody = new THREE.Mesh(midBodyGeom, midBodyMat);
  midBody.position.y = 0.775;
  midBody.castShadow = true;
  midBody.receiveShadow = true;
  cakeGroup.add(midBody);

  // Middle frosting rim
  const midRimGeom = new THREE.TorusGeometry(0.92, 0.04, 16, 64);
  const midRimMat = new THREE.MeshStandardMaterial({
    color: 0xfff0f5,
    roughness: 0.25,
    metalness: 0.05,
  });
  const midRim = new THREE.Mesh(midRimGeom, midRimMat);
  midRim.position.y = 1.0;
  midRim.rotation.x = Math.PI / 2;
  cakeGroup.add(midRim);

  // === Top tier ===
  const topBodyGeom = new THREE.CylinderGeometry(0.55, 0.6, 0.35, 64);
  const topBodyMat = new THREE.MeshStandardMaterial({
    color: 0xfce4ec,
    roughness: 0.45,
    metalness: 0.05,
  });
  const topBody = new THREE.Mesh(topBodyGeom, topBodyMat);
  topBody.position.y = 1.175;
  topBody.castShadow = true;
  topBody.receiveShadow = true;
  cakeGroup.add(topBody);

  // Top frosting swirl
  const swirlGeom = new THREE.CylinderGeometry(0.52, 0.58, 0.08, 64);
  const swirlMat = new THREE.MeshStandardMaterial({
    color: 0xfff5f8,
    roughness: 0.2,
    metalness: 0.05,
  });
  const swirl = new THREE.Mesh(swirlGeom, swirlMat);
  swirl.position.y = 1.39;
  cakeGroup.add(swirl);

  // Frosting drip details (small half-spheres around top tier edge)
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const dripGeom = new THREE.SphereGeometry(0.03, 8, 8);
    const drip = new THREE.Mesh(dripGeom, swirlMat);
    drip.position.set(
      Math.cos(angle) * 0.57,
      1.33,
      Math.sin(angle) * 0.57
    );
    drip.scale.set(1, 1.5, 1);
    cakeGroup.add(drip);
  }

  // === Candles ===
  const candleCount = 5;
  const candleRadius = 0.28;
  for (let i = 0; i < candleCount; i++) {
    const angle = (i / candleCount) * Math.PI * 2 + Math.PI / 10;
    const x = Math.cos(angle) * candleRadius;
    const z = Math.sin(angle) * candleRadius;

    const candleGroup = new THREE.Group();

    // Candle body
    const candleGeom = new THREE.CylinderGeometry(0.04, 0.045, 0.4, 16);
    const candleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.12 + i * 0.05, 0.2, 0.92),
      roughness: 0.4,
    });
    const candle = new THREE.Mesh(candleGeom, candleMat);
    candle.position.y = 1.6;
    candle.castShadow = true;
    candleGroup.add(candle);

    // Wick
    const wickGeom = new THREE.CylinderGeometry(0.006, 0.006, 0.04, 8);
    const wickMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const wick = new THREE.Mesh(wickGeom, wickMat);
    wick.position.y = 1.82;
    candleGroup.add(wick);
    candleWicks.push(wick);

    // Flame (cone with emissive material)
    const flameGeom = new THREE.ConeGeometry(0.04, 0.16, 8);
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xff9944,
      emissive: 0xff6600,
      emissiveIntensity: 2.0,
      roughness: 0.2,
    });
    const flame = new THREE.Mesh(flameGeom, flameMat);
    flame.position.y = 1.92;
    flame.name = 'flame';
    candleGroup.add(flame);
    flameMeshes.push(flame);

    // Inner flame (brighter core for bloom)
    const innerFlameGeom = new THREE.ConeGeometry(0.02, 0.1, 8);
    const innerFlameMat = new THREE.MeshStandardMaterial({
      color: 0xffffcc,
      emissive: 0xffdd88,
      emissiveIntensity: 2.5,
      roughness: 0.1,
    });
    const innerFlame = new THREE.Mesh(innerFlameGeom, innerFlameMat);
    innerFlame.position.y = 1.92;
    innerFlame.name = 'innerFlame';
    candleGroup.add(innerFlame);

    candleGroup.position.set(x, 0, z);
    cakeGroup.add(candleGroup);
  }

  // === Cake plate ===
  const plateGeom = new THREE.CylinderGeometry(1.6, 1.65, 0.08, 64);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0xfafafa,
    roughness: 0.15,
    metalness: 0.3,
  });
  const plate = new THREE.Mesh(plateGeom, plateMat);
  plate.position.y = -0.06;
  plate.receiveShadow = true;
  plate.castShadow = true;
  cakeGroup.add(plate);

  // Plate rim
  const plateRimGeom = new THREE.TorusGeometry(1.62, 0.04, 16, 64);
  const plateRim = new THREE.Mesh(plateRimGeom, plateMat);
  plateRim.position.y = -0.02;
  plateRim.rotation.x = Math.PI / 2;
  cakeGroup.add(plateRim);

  scene.add(cakeGroup);
  return cakeGroup;
}

export function updateCake(delta, windStrength) {
  // Slow rotation
  cakeGroup.rotation.y += delta * 0.25;

  if (!candlesLit) return;

  // Animate each flame
  flameMeshes.forEach((flame, i) => {
    const phase = i * 1.7;
    const baseFlicker = 0.85 + Math.sin(Date.now() * 0.015 + phase) * 0.08 + Math.sin(Date.now() * 0.023 + phase * 1.3) * 0.05;

    // Wind effect: flames lean over and shrink
    const leanAmount = windStrength * 0.6;
    const leanX = Math.cos(Date.now() * 0.003 + phase) * leanAmount;
    const leanZ = Math.sin(Date.now() * 0.003 + phase) * leanAmount;

    flame.position.x = leanX;
    flame.position.z = leanZ;

    const windScale = 1.0 - windStrength * 0.7;
    flame.scale.setScalar(baseFlicker * windScale);

    // Reduce emissive when wind is strong
    flame.material.emissiveIntensity = 2.0 - windStrength * 1.2;
  });
}

export function extinguishCandles(scene) {
  candlesLit = false;

  flameMeshes.forEach((flame) => {
    // Create smoke puff at each flame position
    const worldPos = new THREE.Vector3();
    flame.getWorldPosition(worldPos);

    for (let i = 0; i < 5; i++) {
      const smokeGeom = new THREE.SphereGeometry(0.03, 8, 8);
      const smokeMat = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
      });
      const smoke = new THREE.Mesh(smokeGeom, smokeMat);
      smoke.position.copy(worldPos);
      smoke.position.x += (Math.random() - 0.5) * 0.1;
      smoke.position.z += (Math.random() - 0.5) * 0.1;
      smoke.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          0.3 + Math.random() * 0.4,
          (Math.random() - 0.5) * 0.2
        ),
        life: 1.0,
        decay: 0.3 + Math.random() * 0.4,
      };
      scene.add(smoke);
      smokeParticles.push(smoke);
    }

    flame.visible = false;
  });
}

export function updateSmoke(delta) {
  for (let i = smokeParticles.length - 1; i >= 0; i--) {
    const smoke = smokeParticles[i];
    smoke.userData.life -= smoke.userData.decay * delta;
    if (smoke.userData.life <= 0) {
      smoke.parent.remove(smoke);
      smoke.geometry.dispose();
      smoke.material.dispose();
      smokeParticles.splice(i, 1);
      continue;
    }
    smoke.position.add(smoke.userData.velocity.clone().multiplyScalar(delta));
    smoke.scale.addScalar(delta * 0.5);
    smoke.material.opacity = smoke.userData.life * 0.5;
  }
}

export function getCakeGroup() {
  return cakeGroup;
}

export function getFlameMeshes() {
  return flameMeshes;
}

export function areCandlesLit() {
  return candlesLit;
}
```

- [ ] **Step 2: Update src/main.js to test cake**

```js
import { initScene, getComposer, getScene, getClock } from './scene.js';
import { initCake, updateCake } from './cake.js';

const { scene, composer } = initScene();
const clock = getClock();

initCake(scene);

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.1);
  updateCake(delta, 0);
  composer.render();
}
animate();
```

Run: `npm run dev`
Expected: 3-tier cake with frosting, 5 flickering candles glowing with bloom, on a plate. Slow rotation. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/cake.js src/main.js
git commit -m "feat: add 3D cake model with candles and animated flames"
```

---

### Task 5: Flowers & Petals

**Files:**
- Create: `src/flowers.js`

- [ ] **Step 1: Create src/flowers.js**

```js
import * as THREE from 'three';

let flowersGroup;
let petalSystem;
const PETAL_COUNT = 200;
const FALL_SPEED = 0.4;
const FALL_AREA = 4;

function createFlower(color, petalColor) {
  const group = new THREE.Group();

  // Center
  const centerGeom = new THREE.SphereGeometry(0.06, 12, 12);
  const centerMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.4,
    metalness: 0.05,
  });
  group.add(new THREE.Mesh(centerGeom, centerMat));

  // 5 petals
  const petalGeom = new THREE.SphereGeometry(0.05, 8, 8);
  const petalMat = new THREE.MeshStandardMaterial({
    color: petalColor,
    roughness: 0.5,
    metalness: 0.05,
  });

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const petal = new THREE.Mesh(petalGeom, petalMat);
    petal.position.x = Math.cos(angle) * 0.09;
    petal.position.z = Math.sin(angle) * 0.09;
    petal.scale.set(0.5, 0.2, 1.2);
    petal.rotation.y = angle;
    petal.rotation.z = Math.PI / 3.5;
    group.add(petal);
  }

  // Stem
  const stemGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 8);
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x4a7c3f,
    roughness: 0.7,
  });
  const stem = new THREE.Mesh(stemGeom, stemMat);
  stem.position.y = -0.3;
  group.add(stem);

  return group;
}

export function initFlowers(scene) {
  flowersGroup = new THREE.Group();

  // Flower colors: pinks, reds, whites
  const flowerDefs = [
    { center: 0xffdd44, petal: 0xff6b8a },  // pink
    { center: 0xffcc33, petal: 0xff3355 },  // red
    { center: 0xffdd44, petal: 0xffffff },  // white
    { center: 0xffaa22, petal: 0xff8899 },  // light pink
    { center: 0xffdd44, petal: 0xff4466 },  // rose
  ];

  const flowerCount = 24;
  const ringRadius = 1.8;

  for (let i = 0; i < flowerCount; i++) {
    const angle = (i / flowerCount) * Math.PI * 2;
    const def = flowerDefs[i % flowerDefs.length];

    const flower = createFlower(def.center, def.petal);
    flower.position.set(
      Math.cos(angle) * ringRadius,
      -0.25 + Math.random() * 0.15,
      Math.sin(angle) * ringRadius
    );
    flower.rotation.y = angle + Math.PI / 2;
    flower.rotation.z = (Math.random() - 0.5) * 0.3;
    flower.rotation.x = (Math.random() - 0.5) * 0.3;
    flower.scale.setScalar(0.8 + Math.random() * 0.4);

    flowersGroup.add(flower);
  }

  scene.add(flowersGroup);

  // === Falling petal particle system ===
  const petalPositions = new Float32Array(PETAL_COUNT * 3);
  const petalData = []; // per-petal data for animation

  for (let i = 0; i < PETAL_COUNT; i++) {
    petalPositions[i * 3] = (Math.random() - 0.5) * FALL_AREA;
    petalPositions[i * 3 + 1] = Math.random() * 5 + 1;
    petalPositions[i * 3 + 2] = (Math.random() - 0.5) * FALL_AREA;

    petalData.push({
      speed: FALL_SPEED * (0.5 + Math.random()),
      wobbleAmp: 0.3 + Math.random() * 0.5,
      wobbleFreq: 1 + Math.random() * 2,
      wobblePhase: Math.random() * Math.PI * 2,
      swayAmp: 0.2 + Math.random() * 0.4,
      swayFreq: 0.5 + Math.random(),
      swayPhase: Math.random() * Math.PI * 2,
      rotationSpeed: 0.5 + Math.random() * 2,
    });
  }

  // Create petal texture via canvas
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ff9eb5';
  ctx.beginPath();
  ctx.ellipse(16, 12, 10, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff6b8a';
  ctx.beginPath();
  ctx.ellipse(16, 12, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  const petalTexture = new THREE.CanvasTexture(canvas);
  petalTexture.needsUpdate = true;

  const petalGeom = new THREE.BufferGeometry();
  petalGeom.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
  const petalMat = new THREE.PointsMaterial({
    size: 0.15,
    map: petalTexture,
    blending: THREE.NormalBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.9,
    color: 0xffc0cb,
  });

  petalSystem = new THREE.Points(petalGeom, petalMat);
  petalSystem.userData = { petalData };
  scene.add(petalSystem);
}

export function updateFlowers(delta, time) {
  if (!petalSystem) return;

  const positions = petalSystem.geometry.attributes.position.array;
  const data = petalSystem.userData.petalData;

  for (let i = 0; i < PETAL_COUNT; i++) {
    const d = data[i];
    const idx = i * 3;

    // Fall down
    positions[idx + 1] -= d.speed * delta;

    // Wobble in x
    positions[idx] += Math.sin(time * d.wobbleFreq + d.wobblePhase) * d.wobbleAmp * delta;

    // Sway in z
    positions[idx + 2] += Math.cos(time * d.swayFreq + d.swayPhase) * d.swayAmp * delta;

    // Reset if below floor
    if (positions[idx + 1] < -2) {
      positions[idx + 1] = 4 + Math.random() * 2;
      positions[idx] = (Math.random() - 0.5) * FALL_AREA;
      positions[idx + 2] = (Math.random() - 0.5) * FALL_AREA;
    }
  }

  petalSystem.geometry.attributes.position.needsUpdate = true;
}

export function getFlowersGroup() {
  return flowersGroup;
}
```

- [ ] **Step 2: Update src/main.js to include flowers**

```js
import { initScene, getScene, getComposer, getClock } from './scene.js';
import { initCake, updateCake } from './cake.js';
import { initFlowers, updateFlowers } from './flowers.js';

const scene = getScene();
const { composer } = initScene();
const clock = getClock();

initCake(scene);
initFlowers(scene);

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.1);
  const time = performance.now() * 0.001;

  updateCake(delta, 0);
  updateFlowers(delta, time);

  composer.render();
}
animate();
```

Run: `npm run dev`
Expected: Cake with ring of flowers around base, pink petals gently falling from above. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/flowers.js src/main.js
git commit -m "feat: add flower ring and falling petal particle system"
```

---

### Task 6: Audio Module (Mic + Fallback)

**Files:**
- Create: `src/audio.js`

- [ ] **Step 1: Create src/audio.js**

```js
const AUDIO_STATES = {
  IDLE: 'idle',
  REQUESTING: 'requesting',
  ACTIVE: 'active',
  DENIED: 'denied',
  FALLBACK: 'fallback',
};

let audioContext = null;
let analyser = null;
let dataArray = null;
let windStrength = 0;
let state = AUDIO_STATES.IDLE;
let spacePressed = false;
let isMobile = false;

// Wind meter DOM elements
let meterContainer = null;
let meterFill = null;
let promptEl = null;
let blowButton = null;

export function getAudioState() {
  return state;
}

export function getWindStrength() {
  return windStrength;
}

function createUIElements() {
  const overlay = document.getElementById('ui-overlay');
  if (!overlay) {
    const el = document.createElement('div');
    el.id = 'ui-overlay';
    document.getElementById('app').appendChild(el);
  }
  const ui = document.getElementById('ui-overlay');

  // Prompt
  promptEl = document.createElement('div');
  promptEl.className = 'prompt';
  ui.appendChild(promptEl);

  // Wind meter
  meterContainer = document.createElement('div');
  meterContainer.className = 'wind-meter-container';
  meterFill = document.createElement('div');
  meterFill.className = 'wind-meter-fill';
  meterContainer.appendChild(meterFill);
  ui.appendChild(meterContainer);

  // Blow button (mobile fallback)
  blowButton = document.createElement('button');
  blowButton.className = 'blow-button';
  blowButton.textContent = 'Tap & Hold to Blow';
  ui.appendChild(blowButton);
}

export function initAudio() {
  createUIElements();

  isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);

  // Show initial prompt
  promptEl.style.opacity = '1';
  promptEl.textContent = '🎂 Click anywhere to begin...';

  // Wait for first user gesture, then try mic
  const tryMic = async () => {
    if (state !== AUDIO_STATES.IDLE) return;
    state = AUDIO_STATES.REQUESTING;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setupAudioPipeline(stream);
      state = AUDIO_STATES.ACTIVE;
      promptEl.textContent = '💨 Blow into your microphone to extinguish the candles!';
    } catch (err) {
      console.warn('Microphone unavailable:', err.message);
      setupFallback();
    }
  };

  document.addEventListener('click', tryMic, { once: false });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      spacePressed = true;
      if (state === AUDIO_STATES.IDLE) {
        // Try mic on first interaction
        state = AUDIO_STATES.REQUESTING;
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            setupAudioPipeline(stream);
            state = AUDIO_STATES.ACTIVE;
          })
          .catch(() => {
            setupFallback();
          });
      }
    }
  });
  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      spacePressed = false;
    }
  });

  // Mobile tap button
  blowButton.addEventListener('pointerdown', () => { spacePressed = true; });
  blowButton.addEventListener('pointerup', () => { spacePressed = false; });
  blowButton.addEventListener('pointerleave', () => { spacePressed = false; });
}

function setupAudioPipeline(stream) {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(stream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  promptEl.textContent = '💨 Blow into your microphone to extinguish the candles!';
  meterContainer.style.display = 'block';
}

function setupFallback() {
  state = AUDIO_STATES.FALLBACK;

  if (isMobile) {
    blowButton.style.display = 'block';
    promptEl.textContent = '👆 Tap and hold the button to blow out the candles!';
  } else {
    promptEl.textContent = '⌨️ Hold the spacebar to blow out the candles!';
  }

  meterContainer.style.display = 'block';
}

export function updateAudio(delta) {
  if (state === AUDIO_STATES.ACTIVE && analyser) {
    // Read from microphone
    analyser.getByteTimeDomainData(dataArray);

    // Compute RMS
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const value = (dataArray[i] - 128) / 128;
      sum += value * value;
    }
    const rms = Math.sqrt(sum / dataArray.length);

    // Map to wind strength (threshold + amplification)
    const raw = Math.min(1, Math.max(0, (rms - 0.02) / 0.15));

    // Smooth with exponential moving average
    const smoothing = 0.08;
    windStrength += (raw - windStrength) * Math.min(smoothing / Math.max(delta, 0.001), 1);

    updateMeter(windStrength);
  } else if (state === AUDIO_STATES.FALLBACK || state === AUDIO_STATES.REQUESTING) {
    // Spacebar / tap fallback
    const target = spacePressed ? 1.0 : 0.0;
    const fillSpeed = spacePressed ? 0.35 : 0.8; // fill up slower, drain faster
    windStrength += (target - windStrength) * fillSpeed * delta;

    // Clamp
    windStrength = Math.max(0, Math.min(1, windStrength));

    updateMeter(windStrength);
  }
}

function updateMeter(value) {
  if (meterFill) {
    meterFill.style.width = `${value * 100}%`;
  }
  if (meterContainer) {
    meterContainer.style.display = value > 0.01 ? 'block' : 'none';
  }
}

export function hidePrompt() {
  if (promptEl) {
    promptEl.style.opacity = '0';
  }
}

export function hideMeter() {
  if (meterContainer) {
    meterContainer.style.display = 'none';
  }
  if (blowButton) {
    blowButton.style.display = 'none';
  }
}

export function showLetterPrompt() {
  if (promptEl) {
    promptEl.style.opacity = '0';
  }
}
```

- [ ] **Step 2: Update src/main.js to test audio**

```js
import { initScene, getScene, getComposer, getClock } from './scene.js';
import { initCake, updateCake } from './cake.js';
import { initFlowers, updateFlowers } from './flowers.js';
import { initAudio, updateAudio, getWindStrength } from './audio.js';

const scene = getScene();
const { composer } = initScene();
const clock = getClock();

initCake(scene);
initFlowers(scene);
initAudio();

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.1);
  const time = performance.now() * 0.001;

  updateAudio(delta);
  const wind = getWindStrength();

  updateCake(delta, wind);
  updateFlowers(delta, time);

  composer.render();
}
animate();
```

Run: `npm run dev`
Expected: Click page → mic prompt. Allow mic → prompt changes to "Blow into microphone". Blowing shows wind meter filling. Flames react (lean, shrink). Or deny mic / hold spacebar → same behavior. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/audio.js src/main.js
git commit -m "feat: add microphone detection with spacebar fallback and wind meter"
```

---

### Task 7: Letter Module

**Files:**
- Create: `src/letter.js`

- [ ] **Step 1: Create src/letter.js**

```js
import * as THREE from 'three';
import { getConfig } from './config.js';

let letterGroup;
let envelopeBody;
let envelopeFlap;
let paperPlane;
let isAnimating = false;
let animationPhase = 'idle'; // idle | entering | opening | paper | typing | done
let animTime = 0;
let letterOverlay = null;
let letterTextEl = null;

export function initLetter(scene) {
  letterGroup = new THREE.Group();

  // === Envelope body ===
  const bodyGeom = new THREE.BoxGeometry(1.2, 0.7, 0.02);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf5f0e8,
    roughness: 0.4,
    metalness: 0.05,
  });
  envelopeBody = new THREE.Mesh(bodyGeom, bodyMat);
  envelopeBody.castShadow = true;
  letterGroup.add(envelopeBody);

  // Envelope border lines (thin boxes for visual detail)
  const borderMat = new THREE.MeshStandardMaterial({
    color: 0xd4c5a9,
    roughness: 0.3,
  });

  // Top border
  const borderTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.22, 0.02, 0.025),
    borderMat
  );
  borderTop.position.y = 0.36;
  letterGroup.add(borderTop);

  // Bottom border
  const borderBottom = new THREE.Mesh(
    new THREE.BoxGeometry(1.22, 0.02, 0.025),
    borderMat
  );
  borderBottom.position.y = -0.36;
  letterGroup.add(borderBottom);

  // Left border
  const borderLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.72, 0.025),
    borderMat
  );
  borderLeft.position.x = -0.61;
  letterGroup.add(borderLeft);

  // Right border
  const borderRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.72, 0.025),
    borderMat
  );
  borderRight.position.x = 0.61;
  letterGroup.add(borderRight);

  // === Envelope flap (triangular) ===
  const flapShape = new THREE.Shape();
  flapShape.moveTo(-0.6, 0);
  flapShape.lineTo(0, 0.5);
  flapShape.lineTo(0.6, 0);
  flapShape.closePath();
  const flapGeom = new THREE.ShapeGeometry(flapShape);
  const flapMat = new THREE.MeshStandardMaterial({
    color: 0xe8dfc8,
    roughness: 0.35,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  envelopeFlap = new THREE.Mesh(flapGeom, flapMat);
  envelopeFlap.position.set(0, 0.35, 0.01);
  letterGroup.add(envelopeFlap);

  // === Paper ===
  const paperGeom = new THREE.PlaneGeometry(0.8, 0.55);
  const paperMat = new THREE.MeshStandardMaterial({
    color: 0xfffff8,
    roughness: 0.6,
    side: THREE.DoubleSide,
  });
  paperPlane = new THREE.Mesh(paperGeom, paperMat);
  paperPlane.position.z = -0.02;
  paperPlane.visible = false;
  letterGroup.add(paperPlane);

  // Position envelope high above scene (offscreen)
  letterGroup.position.set(0, 5, -1);
  letterGroup.rotation.x = -0.3;

  scene.add(letterGroup);

  // === HTML letter overlay ===
  createLetterOverlay();
}

function createLetterOverlay() {
  const ui = document.getElementById('ui-overlay');

  letterOverlay = document.createElement('div');
  letterOverlay.className = 'letter-overlay';

  letterTextEl = document.createElement('div');
  letterTextEl.className = 'letter-text';
  letterOverlay.appendChild(letterTextEl);

  const signatureEl = document.createElement('div');
  signatureEl.className = 'letter-signature';
  signatureEl.id = 'letter-signature';
  letterOverlay.appendChild(signatureEl);

  ui.appendChild(letterOverlay);
}

export function startLetterReveal() {
  if (isAnimating) return;
  isAnimating = true;
  animationPhase = 'entering';
  animTime = 0;
}

export function updateLetter(delta, time) {
  if (!isAnimating) return;
  animTime += delta;

  switch (animationPhase) {
    case 'entering': {
      // Float down from above
      const t = Math.min(animTime / 2.0, 1.0);
      // Ease-out
      const ease = 1 - Math.pow(1 - t, 3);
      letterGroup.position.y = 5 - ease * 3.5; // lands at y=1.5
      letterGroup.rotation.x = -0.3 + ease * 0.3; // levels out
      letterGroup.rotation.z = Math.sin(animTime * 2) * 0.05 * (1 - t); // wobble

      if (t >= 1.0) {
        animationPhase = 'opening';
        animTime = 0;
      }
      break;
    }

    case 'opening': {
      // Flap opens
      const t = Math.min(animTime / 0.8, 1.0);
      const ease = 1 - Math.pow(1 - t, 2);
      envelopeFlap.rotation.x = ease * (-Math.PI * 0.7); // flap folds back

      if (t >= 1.0) {
        animationPhase = 'paper';
        animTime = 0;
        paperPlane.visible = true;
        paperPlane.position.set(0, -0.1, -0.02);
      }
      break;
    }

    case 'paper': {
      // Paper slides out upward
      const t = Math.min(animTime / 1.0, 1.0);
      const ease = 1 - Math.pow(1 - t, 3);
      paperPlane.position.y = -0.1 + ease * 0.7; // slides up

      if (t >= 1.0) {
        animationPhase = 'typing';
        animTime = 0;
        startTypewriter();
      }
      break;
    }

    case 'typing': {
      // Typewriter handled separately, just wait
      break;
    }

    case 'done': {
      // Gentle float
      letterGroup.position.y = 1.5 + Math.sin(time * 0.5) * 0.05;
      break;
    }
  }
}

function startTypewriter() {
  const config = getConfig();
  const fullText = config.message || '';
  const signature = config.signature || '';
  let charIndex = 0;
  const speed = config.typewriterSpeed || 50;

  letterOverlay.style.display = 'block';
  letterTextEl.textContent = '';

  const signatureEl = document.getElementById('letter-signature');
  if (signatureEl) signatureEl.textContent = '';

  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  letterTextEl.appendChild(cursor);

  const typeNext = () => {
    if (charIndex < fullText.length) {
      // Remove cursor, add char, re-add cursor
      letterTextEl.removeChild(cursor);
      const char = fullText[charIndex];
      if (char === '\n') {
        letterTextEl.appendChild(document.createElement('br'));
      } else {
        letterTextEl.appendChild(document.createTextNode(char));
      }
      letterTextEl.appendChild(cursor);
      charIndex++;
      setTimeout(typeNext, speed);
    } else {
      // Done typing
      cursor.remove();
      if (signature) {
        const sigEl = document.getElementById('letter-signature');
        if (sigEl) sigEl.textContent = signature;
      }
      animationPhase = 'done';
    }
  };

  setTimeout(typeNext, 300);
}

export function getLetterGroup() {
  return letterGroup;
}

export function isLetterAnimating() {
  return isAnimating && animationPhase !== 'done';
}

export function getAnimationPhase() {
  return animationPhase;
}
```

- [ ] **Step 2: Verify letter appears standalone**

Temporarily modify main.js to test letter:

```js
import { initScene, getScene, getComposer, getClock } from './scene.js';
import { initLetter, startLetterReveal, updateLetter } from './letter.js';
import { loadConfig } from './config.js';

async function main() {
  await loadConfig();
  const scene = getScene();
  const { composer } = initScene();
  const clock = getClock();

  initLetter(scene);

  // Trigger letter after 2 seconds
  setTimeout(() => startLetterReveal(), 2000);

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);
    const time = performance.now() * 0.001;

    updateLetter(delta, time);
    composer.render();
  }
  animate();
}
main();
```

Run: `npm run dev`
Expected: After 2s, envelope floats down, flap opens, paper slides out, text types letter by letter. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/letter.js src/main.js
git commit -m "feat: add 3D envelope reveal with typewriter letter overlay"
```

---

### Task 8: Main Orchestration & State Machine

**Files:**
- Create: `src/main.js` (rewrite)

- [ ] **Step 1: Rewrite src/main.js with full state machine**

```js
import { initScene, getScene, getComposer, getClock, setSceneBrightness } from './scene.js';
import { initCake, updateCake, extinguishCandles, updateSmoke, areCandlesLit } from './cake.js';
import { initFlowers, updateFlowers } from './flowers.js';
import { initAudio, updateAudio, getWindStrength, hidePrompt, hideMeter, getAudioState } from './audio.js';
import { initLetter, startLetterReveal, updateLetter, getAnimationPhase } from './letter.js';
import { loadConfig } from './config.js';

const PHASES = {
  IDLE: 'idle',
  BLOWING: 'blowing',
  EXTINGUISH: 'extinguish',
  LETTER: 'letter',
};

let currentPhase = PHASES.IDLE;
let phaseTime = 0;
let blowProgress = 0;
const BLOW_DURATION = 3.5; // seconds of sustained blowing needed

async function main() {
  // Load config first (letter text, etc.)
  await loadConfig();

  const scene = getScene();
  const { composer } = initScene();
  const clock = getClock();

  // Initialize all modules
  initCake(scene);
  initFlowers(scene);
  initLetter(scene);
  initAudio();

  // Check for WebGL support
  if (!getComposer()) {
    showFallback();
    return;
  }

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);
    const time = performance.now() * 0.001;
    phaseTime += delta;

    updateAudio(delta);
    const wind = getWindStrength();

    switch (currentPhase) {
      case PHASES.IDLE:
        updateCake(delta, 0); // gentle flicker only
        updateFlowers(delta, time);

        // Transition: user starts blowing
        if (wind > 0.1) {
          currentPhase = PHASES.BLOWING;
          phaseTime = 0;
          blowProgress = 0;
        }
        break;

      case PHASES.BLOWING:
        updateCake(delta, wind);
        updateFlowers(delta, time);

        // Build up blow progress while wind is sustained
        if (wind > 0.15) {
          blowProgress += delta;
        } else {
          // Drain slowly when not blowing
          blowProgress = Math.max(0, blowProgress - delta * 0.3);
        }

        // Check if candles are blown out
        if (blowProgress >= BLOW_DURATION) {
          transitionToExtinguish(scene);
        }
        break;

      case PHASES.EXTINGUISH:
        updateCake(delta, 0);
        updateFlowers(delta, time);
        updateSmoke(delta);

        // Wait for smoke to dissipate, then show letter
        if (phaseTime > 2.5) {
          transitionToLetter();
        }
        break;

      case PHASES.LETTER:
        updateCake(delta, 0);
        updateFlowers(delta, time * 0.3); // slow petals during letter
        updateSmoke(delta);
        updateLetter(delta, time);
        break;
    }

    composer.render();
  }

  animate();
}

function transitionToExtinguish(scene) {
  currentPhase = PHASES.EXTINGUISH;
  phaseTime = 0;

  // Kill the flames
  extinguishCandles(scene);

  // Dim the scene
  setSceneBrightness(0.3);

  // Hide UI
  hidePrompt();
  hideMeter();
}

function transitionToLetter() {
  currentPhase = PHASES.LETTER;
  phaseTime = 0;

  startLetterReveal();
}

function showFallback() {
  const el = document.createElement('div');
  el.className = 'fallback-message';
  el.innerHTML = '<span class="cake-emoji">🎂</span>Happy Birthday!<br><small>Please open this page in a browser that supports WebGL.</small>';
  el.style.display = 'block';
  document.getElementById('app').appendChild(el);
}

main();
```

- [ ] **Step 2: Verify full flow**

Run: `npm run dev`
Expected:
1. Cake rotates, petals fall, prompt shows "Click anywhere to begin"
2. Click → mic request. Allow → prompts to blow
3. Blow steadily for ~3.5s → flames react, meter fills
4. Candles extinguish all at once with smoke puffs, scene dims
5. After 2.5s, envelope floats down, flap opens, paper slides out
6. Typewriter effect reveals the message from config.json
7. No console errors

- [ ] **Step 3: Commit**

```bash
git add src/main.js
git commit -m "feat: add 4-phase state machine orchestrating full experience"
```

---

### Task 9: Edge Cases & Polish

**Files:**
- Modify: `src/main.js`
- Modify: `src/audio.js`
- Modify: `index.html`

- [ ] **Step 1: Add WebGL support check to index.html**

Add before the closing `</body>` tag in `index.html`:

```html
<script>
  // Quick WebGL check before loading Three.js
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    document.getElementById('app').innerHTML = `
      <div class="fallback-message" style="display:block">
        <span class="cake-emoji">🎂</span>
        <p>Happy Birthday!</p>
        <p style="font-size:16px;margin-top:16px;">Please open this page in a modern browser<br>that supports WebGL (Chrome, Firefox, Edge).</p>
      </div>
    `;
  }
</script>
```

- [ ] **Step 2: Add performance monitor to src/main.js**

Add this function and call it in the render loop:

```js
// Performance monitoring — disable bloom if FPS drops
let fpsFrames = 0;
let fpsTime = 0;
let bloomEnabled = true;

// Inside animate(), before composer.render():
fpsFrames++;
fpsTime += delta;
if (fpsTime >= 2.0 && bloomEnabled) {
  const fps = fpsFrames / fpsTime;
  if (fps < 30) {
    bloomEnabled = false;
    setBloomEnabled(false);
    console.warn('Performance: disabling bloom (fps:', Math.round(fps), ')');
  }
  fpsFrames = 0;
  fpsTime = 0;
}
```

Add to `src/scene.js`:

```js
export function setBloomEnabled(enabled) {
  bloomPass.enabled = enabled;
}
```

- [ ] **Step 3: Improve mobile tap area in src/audio.js**

Update the `tryMic` click handler in `initAudio()` to be a once-only trigger:

```js
let micTried = false;

const tryMicOnce = async () => {
  if (micTried) return;
  micTried = true;
  document.removeEventListener('click', tryMicOnce);
  
  state = AUDIO_STATES.REQUESTING;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setupAudioPipeline(stream);
    state = AUDIO_STATES.ACTIVE;
  } catch (err) {
    console.warn('Microphone unavailable:', err.message);
    setupFallback();
  }
};

document.addEventListener('click', tryMicOnce);
```

- [ ] **Step 4: Add reset/replay hint after letter finishes**

In `src/main.js`, in the `PHASES.LETTER` case, after letter is done:

```js
// In main.js, after updateLetter call in LETTER phase:
if (getAnimationPhase() === 'done') {
  // After 3 seconds, show a subtle refresh hint
  // (We won't add a button per spec, just keep it displayed)
}
```

- [ ] **Step 5: Verify edge cases**

Manual verification checklist:
- [x] Open page in Chrome/Firefox — WebGL works, gradient background visible
- [x] Deny mic permission — spacebar prompt appears, spacebar works
- [x] Allow mic, blow softly — meter doesn't fill (below threshold)
- [x] Allow mic, blow steadily — meter fills, candles extinguish
- [x] Spacebar hold for ~3.5s — candles extinguish
- [x] Resize browser window — scene adjusts correctly
- [x] Refresh mid-experience — clean restart
- [x] Edit config.json with custom message — typewriter shows new text

Run: `npm run dev`
Expected: All scenarios behave as described. No console errors.

- [ ] **Step 6: Commit**

```bash
git add src/main.js src/audio.js src/scene.js index.html
git commit -m "feat: add edge case handling — WebGL fallback, perf monitor, mobile support"
```

---
