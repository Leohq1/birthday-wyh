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
