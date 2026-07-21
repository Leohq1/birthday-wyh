import { initScene, getComposer, getScene, getClock } from './scene.js';
import { initCake, updateCake } from './cake.js';
import { initFlowers, updateFlowers } from './flowers.js';

const { scene, composer } = initScene();
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
