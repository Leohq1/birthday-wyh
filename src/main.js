import { initScene, getComposer, getClock, setSceneBrightness, setBloomEnabled } from './scene.js';
import { initCake, updateCake, extinguishCandles, updateSmoke } from './cake.js';
import { initFlowers, updateFlowers } from './flowers.js';
import { initAudio, updateAudio, getWindStrength, hidePrompt, hideMeter } from './audio.js';
import { initLetter, startLetterReveal, updateLetter } from './letter.js';
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
let fpsFrames = 0;
let fpsTime = 0;
let bloomEnabled = true;
const BLOW_DURATION = 1.0; // seconds of sustained blowing needed

async function main() {
  // Load config first (letter text, etc.)
  await loadConfig();

  // Check WebGL support before initializing Three.js
  if (!window.__webglOk) {
    showFallback();
    return;
  }

  const { scene, composer } = initScene();
  const clock = getClock();

  // Initialize all modules
  initCake(scene);
  initFlowers(scene);
  initLetter(scene);
  initAudio();

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
        if (wind > 0.05) {
          currentPhase = PHASES.BLOWING;
          phaseTime = 0;
          blowProgress = 0;
        }
        break;

      case PHASES.BLOWING:
        updateCake(delta, wind);
        updateFlowers(delta, time);

        // Build up blow progress while wind is sustained
        if (wind > 0.08) {
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

      default:
        console.warn('Unknown phase:', currentPhase);
        break;
    }

    // Performance monitoring — disable bloom if FPS drops
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
