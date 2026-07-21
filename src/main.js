import { initScene, getComposer, getScene, getClock } from './scene.js';
import { initCake, updateCake } from './cake.js';
import { initFlowers, updateFlowers } from './flowers.js';
import { initAudio, updateAudio, getWindStrength } from './audio.js';

const { scene, composer } = initScene();
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
