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
  renderer.toneMappingExposure = 0.85;

  const container = document.getElementById('three-container');
  container.appendChild(renderer.domElement);

  // Background gradient — set via CSS on canvas parent
  container.style.background = 'linear-gradient(180deg, #ffffff 0%, #fefefe 50%, #fff0f0 100%)';

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
  const ambient = new THREE.AmbientLight(0xffeef4, 0.35);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfff5ee, 1.5);
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
    color: 0xeeeeee,
    roughness: 0.9,
    transparent: true,
    opacity: 0.15,
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
  renderer.toneMappingExposure = 0.85 * (0.3 + factor * 0.7);
}

export function setBloomEnabled(enabled) {
  bloomPass.enabled = enabled;
}
