// Bootstrap for Milo's Garden: size the canvas, run the loop, wire input.
// With ?shot=start|play|end the game stages one frozen frame instead of
// playing, so screenshots are deterministic renders of the real game.
import { STAGE_H, STAGE_W } from './config.js';
import { attachInput } from './input.js';
import { render } from './render.js';
import { stageShot } from './shots.js';
import { World } from './world.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');
canvas.width = STAGE_W;
canvas.height = STAGE_H;

const world = new World();
const buttons = {};
attachInput(canvas, world, buttons);

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

function draw(t) {
  render(ctx, world, buttons, t);
  if (world.screen === 'play') {
    status.textContent = `Level ${world.levelIndex + 1}: found ${world.foundCount} of ${world.totalCount}, ${Math.ceil(world.timeLeft)} seconds left, score ${world.score}.`;
  } else if (world.screen === 'title') {
    status.textContent = "Milo's Garden, spot the difference. Press Enter to start.";
  }
}

if (shot) {
  stageShot(shot, world);
  draw(0);
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    world.tick(dt);
    draw(now / 1000);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
