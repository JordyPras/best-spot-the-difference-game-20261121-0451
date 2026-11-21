// Tiny procedural sounds: WebAudio beeps, no audio files.
// The context is created on the first user gesture; every call is guarded
// so a browser without audio never breaks the game.
let ctx = null;

function audio() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  } catch {
    return null;
  }
  return ctx;
}

function tone(freq, at, dur, type = 'sine', vol = 0.12) {
  const ac = audio();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ac.currentTime + at);
    gain.gain.linearRampToValueAtTime(vol, ac.currentTime + at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + at + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + at);
    osc.stop(ac.currentTime + at + dur + 0.05);
  } catch {
    // ignore: sound is decoration
  }
}

/** A bright two-note chime when a difference is found. */
export function playFound() {
  tone(660, 0, 0.16, 'sine', 0.14);
  tone(990, 0.09, 0.24, 'sine', 0.14);
}

/** A low buzz when a click misses. */
export function playMiss() {
  tone(160, 0, 0.18, 'square', 0.05);
}

/** A soft pop when a hint is used. */
export function playHint() {
  tone(520, 0, 0.1, 'triangle', 0.1);
  tone(780, 0.08, 0.14, 'triangle', 0.1);
}

/** A little fanfare when a level is cleared. */
export function playWin() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.28, 'triangle', 0.12));
}
