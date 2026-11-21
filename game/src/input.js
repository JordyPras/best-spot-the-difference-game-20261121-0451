// Mouse and keyboard input for Milo's Garden.
// Clicks are translated from page pixels into stage coordinates, then into
// scene coordinates of whichever panel was clicked. Keys: H hint, R restart
// level, Enter/Space start or advance, M mute (sound is off by default in
// headless play, so M only matters in a real browser).
import {
  BAR_Y,
  LEFT_X,
  PANEL_H,
  PANEL_W,
  PANEL_Y,
  RIGHT_X,
  STAGE_H,
  STAGE_W,
} from './config.js';
import { playFound, playHint, playMiss, playWin } from './audio.js';
import { SCREEN_LEVEL, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';

export function panelAt(stageX, stageY) {
  if (stageY < PANEL_Y || stageY > PANEL_Y + PANEL_H) return null;
  if (stageX >= LEFT_X && stageX <= LEFT_X + PANEL_W) {
    return { panel: 0, x: stageX - LEFT_X, y: stageY - PANEL_Y };
  }
  if (stageX >= RIGHT_X && stageX <= RIGHT_X + PANEL_W) {
    return { panel: 1, x: stageX - RIGHT_X, y: stageY - PANEL_Y };
  }
  return null;
}

function inButton(stageX, stageY, b) {
  return stageX >= b.x && stageX <= b.x + b.w && stageY >= b.y && stageY <= b.y + b.h;
}

/**
 * Wire the canvas and keyboard to the world. `buttons` is a live object the
 * renderer fills each frame with the current button rectangles:
 * { hint, restart, start, next, retry }.
 */
export function attachInput(canvas, world, buttons, onSound) {
  function toStage(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * STAGE_W,
      y: ((event.clientY - rect.top) / rect.height) * STAGE_H,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const { x, y } = toStage(event);
    const screen = world.screen;
    if (screen === SCREEN_TITLE) {
      if (buttons.start && inButton(x, y, buttons.start)) world.startGame();
      return;
    }
    if (screen === SCREEN_LEVEL) {
      if (buttons.next && inButton(x, y, buttons.next)) world.nextLevel();
      return;
    }
    if (screen === SCREEN_OVER || screen === SCREEN_WIN) {
      if (buttons.retry && inButton(x, y, buttons.retry)) world.startGame();
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    if (buttons.hint && inButton(x, y, buttons.hint)) {
      if (world.useHint()) {
        playHint();
        onSound?.('hint');
      }
      return;
    }
    if (buttons.restart && inButton(x, y, buttons.restart)) {
      world.startLevel(world.levelIndex);
      return;
    }
    const hit = panelAt(x, y);
    if (!hit) return;
    const result = world.clickAt(hit.x, hit.y);
    if (result === 'found') {
      playFound();
      onSound?.('found');
      if (world.screen === SCREEN_LEVEL || world.screen === SCREEN_WIN) playWin();
    } else if (result === 'miss') {
      playMiss();
      onSound?.('miss');
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') {
      if (world.screen === SCREEN_PLAY && world.useHint()) playHint();
    } else if (key === 'r') {
      if (world.screen === SCREEN_PLAY) world.startLevel(world.levelIndex);
      else if (world.screen === SCREEN_OVER || world.screen === SCREEN_WIN) world.startGame();
    } else if (key === 'enter' || key === ' ') {
      event.preventDefault();
      if (world.screen === SCREEN_TITLE) world.startGame();
      else if (world.screen === SCREEN_LEVEL) world.nextLevel();
      else if (world.screen === SCREEN_OVER || world.screen === SCREEN_WIN) world.startGame();
    }
  });
}
