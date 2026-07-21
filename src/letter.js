import * as THREE from 'three';
import { getConfig } from './config.js';

let letterGroup;
let envelopeBody;
let envelopeFlap;
let envelopeFrontFace;
let paperPlane;
let isAnimating = false;
let animationPhase = 'idle'; // idle | entering | opening | paper | typing | done
let animTime = 0;
let letterOverlay = null;
let letterTextEl = null;

export function initLetter(scene) {
  letterGroup = new THREE.Group();

  // === Envelope body ===
  const bodyGeom = new THREE.BoxGeometry(1.2, 0.7, 0.02);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf5f0e8,
    roughness: 0.4,
    metalness: 0.05,
  });
  envelopeBody = new THREE.Mesh(bodyGeom, bodyMat);
  envelopeBody.castShadow = true;
  letterGroup.add(envelopeBody);

  // Envelope border lines (thin boxes for visual detail)
  const borderMat = new THREE.MeshStandardMaterial({
    color: 0xd4c5a9,
    roughness: 0.3,
  });

  // Top border
  const borderTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.22, 0.02, 0.025),
    borderMat
  );
  borderTop.position.y = 0.36;
  letterGroup.add(borderTop);

  // Bottom border
  const borderBottom = new THREE.Mesh(
    new THREE.BoxGeometry(1.22, 0.02, 0.025),
    borderMat
  );
  borderBottom.position.y = -0.36;
  letterGroup.add(borderBottom);

  // Left border
  const borderLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.72, 0.025),
    borderMat
  );
  borderLeft.position.x = -0.61;
  letterGroup.add(borderLeft);

  // Right border
  const borderRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.72, 0.025),
    borderMat
  );
  borderRight.position.x = 0.61;
  letterGroup.add(borderRight);

  // === Envelope flap (upside-down triangle, hinged at top) ===
  const flapShape = new THREE.Shape();
  flapShape.moveTo(-0.6, 0);
  flapShape.lineTo(0, -0.5);
  flapShape.lineTo(0.6, 0);
  flapShape.closePath();
  const flapGeom = new THREE.ShapeGeometry(flapShape);
  const flapMat = new THREE.MeshStandardMaterial({
    color: 0xe8dfc8,
    roughness: 0.35,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  envelopeFlap = new THREE.Mesh(flapGeom, flapMat);
  envelopeFlap.position.set(0, 0.35, 0.01);
  letterGroup.add(envelopeFlap);

  // === Envelope front face (pocket — paper slides out from behind this) ===
  const frontFaceGeom = new THREE.PlaneGeometry(1.18, 0.52);
  const frontFaceMat = new THREE.MeshStandardMaterial({
    color: 0xf5f0e8,
    roughness: 0.4,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  envelopeFrontFace = new THREE.Mesh(frontFaceGeom, frontFaceMat);
  envelopeFrontFace.position.set(0, -0.09, 0.025);
  letterGroup.add(envelopeFrontFace);

  // === Paper ===
  const paperGeom = new THREE.PlaneGeometry(0.8, 0.55);
  const paperMat = new THREE.MeshStandardMaterial({
    color: 0xfffff8,
    roughness: 0.6,
    side: THREE.DoubleSide,
  });
  paperPlane = new THREE.Mesh(paperGeom, paperMat);
  paperPlane.position.z = 0.015;
  paperPlane.visible = false;
  letterGroup.add(paperPlane);

  // Position envelope high above scene (offscreen)
  letterGroup.position.set(0, 5, 2);
  letterGroup.rotation.x = -0.3;

  scene.add(letterGroup);

  // === HTML letter overlay ===
  createLetterOverlay();
}

function createLetterOverlay() {
  const ui = document.getElementById('ui-overlay');

  letterOverlay = document.createElement('div');
  letterOverlay.className = 'letter-overlay';

  letterTextEl = document.createElement('div');
  letterTextEl.className = 'letter-text';
  letterOverlay.appendChild(letterTextEl);

  const signatureEl = document.createElement('div');
  signatureEl.className = 'letter-signature';
  signatureEl.id = 'letter-signature';
  letterOverlay.appendChild(signatureEl);

  ui.appendChild(letterOverlay);
}

export function startLetterReveal() {
  if (isAnimating) return;
  isAnimating = true;
  animationPhase = 'entering';
  animTime = 0;
}

export function updateLetter(delta, time) {
  if (!isAnimating) return;
  animTime += delta;

  switch (animationPhase) {
    case 'entering': {
      // Float down from above
      const t = Math.min(animTime / 2.0, 1.0);
      // Ease-out
      const ease = 1 - Math.pow(1 - t, 3);
      letterGroup.position.y = 5 - ease * 3.5; // lands at y=1.5
      letterGroup.rotation.x = -0.3 + ease * 0.3; // levels out
      letterGroup.rotation.z = Math.sin(animTime * 2) * 0.05 * (1 - t); // wobble

      if (t >= 1.0) {
        animationPhase = 'opening';
        animTime = 0;
      }
      break;
    }

    case 'opening': {
      // Flap opens
      const t = Math.min(animTime / 0.8, 1.0);
      const ease = 1 - Math.pow(1 - t, 2);
      envelopeFlap.rotation.x = ease * (-Math.PI); // full 180-degree flap open toward viewer

      if (t >= 1.0) {
        animationPhase = 'paper';
        animTime = 0;
        paperPlane.visible = true;
        paperPlane.position.set(0, -0.1, 0.015);
      }
      break;
    }

    case 'paper': {
      // Paper slides out upward and forward from behind the pocket
      const t = Math.min(animTime / 1.0, 1.0);
      const ease = 1 - Math.pow(1 - t, 3);
      paperPlane.position.y = -0.1 + ease * 0.7; // slides up
      paperPlane.position.z = 0.015 + ease * 0.025; // emerges forward

      if (t >= 1.0) {
        animationPhase = 'typing';
        animTime = 0;
        startTypewriter();
      }
      break;
    }

    case 'typing': {
      // Typewriter handled separately, just wait
      break;
    }

    case 'done': {
      // Gentle float
      letterGroup.position.y = 1.5 + Math.sin(time * 0.5) * 0.05;
      break;
    }
  }
}

function startTypewriter() {
  const config = getConfig();
  const fullText = config.message || '';
  const signature = config.signature || '';
  let charIndex = 0;
  const speed = config.typewriterSpeed || 50;

  letterOverlay.style.display = 'block';
  letterTextEl.textContent = '';

  const signatureEl = document.getElementById('letter-signature');
  if (signatureEl) signatureEl.textContent = '';

  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  letterTextEl.appendChild(cursor);

  const typeNext = () => {
    if (charIndex < fullText.length) {
      // Remove cursor, add char, re-add cursor
      letterTextEl.removeChild(cursor);
      const char = fullText[charIndex];
      if (char === '\n') {
        letterTextEl.appendChild(document.createElement('br'));
      } else {
        letterTextEl.appendChild(document.createTextNode(char));
      }
      letterTextEl.appendChild(cursor);
      charIndex++;
      setTimeout(typeNext, speed);
    } else {
      // Done typing
      cursor.remove();
      if (signature) {
        const sigEl = document.getElementById('letter-signature');
        if (sigEl) sigEl.textContent = signature;
      }
      animationPhase = 'done';
    }
  };

  setTimeout(typeNext, 300);
}

export function getLetterGroup() {
  return letterGroup;
}

export function isLetterAnimating() {
  return isAnimating && animationPhase !== 'done';
}

export function getAnimationPhase() {
  return animationPhase;
}
