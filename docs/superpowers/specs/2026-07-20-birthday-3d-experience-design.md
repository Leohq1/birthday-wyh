# Birthday 3D Experience — Design Spec

**Date:** 2026-07-20
**Status:** Approved

## Overview

A browser-based 3D interactive birthday experience built with Three.js. The user sees a semi-realistic 3D cake surrounded by flowers and falling petals. They blow into a microphone (or hold spacebar) to extinguish the candles. After the candles go out, a 3D envelope flies in, opens, and reveals a customizable love letter with a typewriter effect.

## User Flow

1. **Idle Scene** — Cake rotates slowly, candles flicker, flower petals drift down. On-screen prompt: "Blow into your microphone..."
2. **Blowing Phase** — User blows into mic (or holds spacebar). A wind-strength meter fills up. Candle flames react to audio intensity in real time — leaning, flickering harder. Meter fills over ~3-4 seconds of sustained blowing.
3. **Extinguish** — Meter full → all candles go out at once with smoke particle puffs rising from each wick. Scene dims slightly. Brief ~2-second pause for dramatic effect.
4. **Letter Reveal** — A 3D envelope floats down from above. Flap opens. Paper slides out and unfolds. Message text from `config.json` appears letter-by-letter with typewriter effect. Cake scene stays dimmed and visible in background.

## Visual Style

- **Cake & flowers:** Semi-realistic — textured frosting, soft lighting, some material detail, but not photoreal. Warm, romantic feel.
- **Flowers:** Ring of 3D flowers circling the cake base + falling petal particle system (petals gently drifting down).
- **Background:** Simple gradient (soft pink to lavender) with gentle ambient lighting. Clean and elegant, keeps focus on the cake.
- **Lighting:** Soft ambient + warm directional light. Bloom/glow post-processing on candle flames.

## Interaction Mechanics

- **Primary input:** Microphone via Web Audio API. `AnalyserNode` computes RMS volume, smoothed to produce a "wind strength" value.
- **Blow behavior:** Sustained blow — user must maintain blowing for ~3-4 seconds. Wind meter fills continuously. All candles extinguish together in one dramatic moment.
- **Fallback input:** Hold spacebar to simulate blowing. Same meter-fill behavior.
- **Input flow:** On page load, prompt user to click/tap (browser requires user gesture for AudioContext). Request microphone access. If denied or unavailable, show spacebar instructions.

## Tech Stack

- **Build:** Vite (vanilla JS, no framework)
- **3D:** Three.js (WebGL renderer)
- **Post-processing:** Three.js EffectComposer with UnrealBloomPass for candle glow
- **Audio:** Web Audio API (native browser API, no library)
- **Text rendering:** CSS overlay HTML div (not rendered inside Three.js) — better typography, easier styling
- **Particles:** Three.js BufferGeometry point clouds (petals) + sprite-based particles (smoke)

## Project Structure

```
birthday/
├── config.json              ← User-editable: letter text, name, settings
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.js              ← Entry point, orchestrates phases & state machine
    ├── scene.js             ← Three.js scene, renderer, lighting, background gradient
    ├── cake.js              ← 3D cake model (layers, frosting, candles, flame shaders)
    ├── flowers.js           ← Ring of flowers + falling petal particle system
    ├── audio.js             ← Mic detection, wind meter UI, spacebar fallback
    ├── letter.js            ← 3D envelope + paper animation + typewriter effect
    └── config.js            ← Loads and parses config.json
```

## Module Responsibilities

### main.js
- Initializes all modules
- Manages the 4-phase state machine (idle → blowing → extinguish → letter)
- Coordinates transitions between phases
- Handles the render loop via `requestAnimationFrame`

### scene.js
- Creates Three.js scene, perspective camera, WebGL renderer
- Sets background gradient (CSS on canvas parent or scene background)
- Configures lighting: ambient light + warm directional light + optional point light near cake
- Sets up EffectComposer with UnrealBloomPass for candle glow
- Handles window resize
- Subtle auto-rotation of camera orbit (disabled during blowing phase)
- Exports scene, camera, renderer, composer

### cake.js
- Builds 3D cake from geometric primitives:
  - 2-3 tiered cylinders with rounded edges (TorusGeometry or lathed shape for frosting)
  - Frosting drips along edges
  - 5 candles (thin cylinders) on top tier
  - Each candle has an animated flame (custom shader or sprite with flicker animation)
- Exports cake group and flame objects (for audio reactivity)
- Slow rotation animation

### flowers.js
- Creates a ring of 3D flower models around the cake base (simple geometric flowers: petal shapes from scaled spheres/ellipsoids, colored pink/red/white)
- Petal particle system: semi-transparent petal sprites falling slowly from above, looping
- Both systems are GPU-efficient (instanced meshes or point clouds)

### audio.js
- Requests microphone access on user gesture
- Sets up AudioContext → MediaStreamSource → AnalyserNode
- Computes smoothed RMS volume each frame
- Maps volume to wind strength (0–1) with configurable threshold
- Renders wind meter UI element (HTML/CSS overlay)
- Spacebar fallback: keydown starts filling, keyup drains
- Exposes `getWindStrength()` and state (requesting/granted/denied/fallback)

### letter.js
- Creates 3D envelope geometry (box with folded flap)
- Entrance animation: envelope floats down from above, slight wobble
- Opening animation: flap rotates open
- Paper extraction: flat plane slides out, slight bend
- Typewriter effect: HTML overlay div, text from config appears character-by-character
- Speed configurable via config.json

### config.js
- Fetches and parses `config.json`
- Validates required fields (message at minimum)
- Exports config object with defaults for missing optional fields

## config.json Schema

```json
{
  "recipientName": "string — displayed in greeting",
  "message": "string — the love letter body text (supports \\n for newlines)",
  "signature": "string — sign-off at end of letter",
  "typewriterSpeed": "number — ms per character (default: 50)",
  "backgroundColor": "string — CSS color for background gradient (default: '#fce4ec')"
}
```

Only `message` is required. All other fields have sensible defaults.

## Edge Cases & Error Handling

| Scenario | Behavior |
|----------|----------|
| Mic permission denied | Fall back to spacebar; show "Hold spacebar to blow" UI |
| No mic hardware | Same as denied — detect via `enumerateDevices` or catch error |
| Browser doesn't support Web Audio | Fall back to spacebar mode |
| Browser doesn't support WebGL | Show a static HTML fallback: cake emoji + letter in plain HTML/CSS |
| Mobile device | Spacebar fallback won't work; show a large "Tap & Hold to Blow" button instead |
| config.json missing | Show default placeholder message; log warning to console |
| config.json malformed | Show error in console; fall back to placeholder text |
| Window resize | Scene and camera adjust; letter overlay re-centers |
| User refreshes mid-experience | Experience restarts from idle phase |
| GPU too slow for bloom | Detect frame rate; disable bloom if below 30fps sustained for 2 seconds |

## Performance Targets

- 60fps on mid-range devices (integrated GPU)
- 30fps minimum on low-end devices (bloom disabled)
- Total draw calls under 200
- No physics engine — all animations are keyframed or simple parametric loops

## Non-Goals (Out of Scope)

- No background music or sound effects (can be added later)
- No mobile responsive layout beyond basic centering
- No deployment pipeline — user opens locally or hosts static files
- No animation replay or "restart" button (refresh the page)
- No multi-language support

## Future Enhancements (Not Implementing Now)

- Background music toggle
- Confetti burst after letter reveal
- Photo upload on the cake (texture on a plane)
- Multiple letter "pages"
- Social media sharing
