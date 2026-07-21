import * as THREE from 'three';

let cakeGroup;
let flameMeshes = [];
let innerFlameMeshes = [];
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
    roughness: 0.7,
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
    roughness: 0.7,
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
      color: 0xcc2233,
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
    innerFlameMeshes.push(innerFlame);

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

  innerFlameMeshes.forEach((flame) => {
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
