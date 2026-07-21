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
