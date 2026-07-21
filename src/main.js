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
