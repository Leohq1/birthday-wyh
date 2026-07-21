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
  let micTried = false;

  const tryMicOnce = async () => {
    if (micTried) return;
    micTried = true;
    document.removeEventListener('click', tryMicOnce);

    state = AUDIO_STATES.REQUESTING;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: false,
          echoCancellation: false,
          autoGainControl: false,
        },
      });
      setupAudioPipeline(stream);
      state = AUDIO_STATES.ACTIVE;
      promptEl.textContent = '💨 Blow into your microphone to extinguish the candles!';
    } catch (err) {
      console.warn('Microphone unavailable:', err.message);
      setupFallback();
    }
  };

  document.addEventListener('click', tryMicOnce);
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      spacePressed = true;
      if (state === AUDIO_STATES.IDLE) {
        // Try mic on first interaction
        micTried = true;
        state = AUDIO_STATES.REQUESTING;
        navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: false,
            echoCancellation: false,
            autoGainControl: false,
          },
        })
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
  analyser.fftSize = 1024;
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

    // Map to wind strength — lower threshold for better blow detection
    const raw = Math.min(1, Math.max(0, (rms - 0.008) / 0.12));

    // Smooth with exponential moving average
    const smoothing = Math.min(delta * 12, 1); // ~90% response in ~100ms
    windStrength += (raw - windStrength) * smoothing;

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
