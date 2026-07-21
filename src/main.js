import { initScene, getScene, getComposer, getClock } from './scene.js';
import { initLetter, startLetterReveal, updateLetter } from './letter.js';
import { loadConfig } from './config.js';

async function main() {
  await loadConfig();
  const { scene, composer } = initScene();
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
