// All drawing of Milo's Garden: the HUD, the two panels, found markers,
// hint rings, buttons and the title / level / over / win screens.
// The renderer fills `buttons` each frame with the live button rectangles
// the input layer reads.
import {
  BAR_Y,
  COLORS,
  HINTS_PER_LEVEL,
  LEFT_X,
  MARK_RADIUS,
  PANEL_H,
  PANEL_W,
  PANEL_Y,
  RIGHT_X,
  STAGE_H,
  STAGE_W,
} from './config.js';
import { SCENE_H, SCENE_W, drawScene } from './scenes.js';
import { SCREEN_LEVEL, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = 700, align = 'left') {
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function drawButton(ctx, b, label, enabled = true) {
  ctx.save();
  ctx.globalAlpha = enabled ? 1 : 0.45;
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fillStyle = enabled ? COLORS.accent : '#8a7a66';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, label, b.x + b.w / 2, b.y + b.h / 2 + 1, 20, '#fff', 800, 'center');
  ctx.restore();
}

function drawFoundMark(ctx, px, py, x, y, t) {
  const pulse = 1 + 0.06 * Math.sin(t * 3);
  const r = MARK_RADIUS * pulse;
  ctx.save();
  ctx.strokeStyle = COLORS.good;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(px + x, py + y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px + x, py + y, r - 4, 0, Math.PI * 2);
  ctx.stroke();
  // check mark
  ctx.strokeStyle = COLORS.good;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(px + x - 10, py + y);
  ctx.lineTo(px + x - 3, py + y + 8);
  ctx.lineTo(px + x + 11, py + y - 8);
  ctx.stroke();
  ctx.restore();
}

function drawHintRing(ctx, px, py, x, y, t) {
  const r = MARK_RADIUS + 8 * Math.sin(t * 5);
  ctx.save();
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(px + x, py + y, Math.max(18, r), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawPanels(ctx, world, t) {
  // panel frames
  for (const px of [LEFT_X, RIGHT_X]) {
    roundRect(ctx, px - 6, PANEL_Y - 6, PANEL_W + 12, PANEL_H + 12, 14);
    ctx.fillStyle = COLORS.panelEdge;
    ctx.fill();
  }
  // left picture: base scene
  ctx.save();
  ctx.beginPath();
  ctx.rect(LEFT_X, PANEL_Y, PANEL_W, PANEL_H);
  ctx.clip();
  ctx.translate(LEFT_X, PANEL_Y);
  drawScene(ctx, world.levelIndex, false);
  ctx.restore();
  // right picture: every difference applied
  ctx.save();
  ctx.beginPath();
  ctx.rect(RIGHT_X, PANEL_Y, PANEL_W, PANEL_H);
  ctx.clip();
  ctx.translate(RIGHT_X, PANEL_Y);
  drawScene(ctx, world.levelIndex, true);
  ctx.restore();
  // labels
  text(ctx, 'A', LEFT_X + 14, PANEL_Y + 18, 18, 'rgba(255,255,255,0.9)', 800);
  text(ctx, 'B', RIGHT_X + 14, PANEL_Y + 18, 18, 'rgba(255,255,255,0.9)', 800);
  // found markers on both panels
  for (const i of world.found) {
    const d = world.diffs[i];
    drawFoundMark(ctx, LEFT_X, PANEL_Y, d.x, d.y, t);
    drawFoundMark(ctx, RIGHT_X, PANEL_Y, d.x, d.y, t);
  }
  // hint ring on both panels
  if (world.hintIndex >= 0) {
    const d = world.diffs[world.hintIndex];
    drawHintRing(ctx, LEFT_X, PANEL_Y, d.x, d.y, t);
    drawHintRing(ctx, RIGHT_X, PANEL_Y, d.x, d.y, t);
  }
  // fading miss crosses
  for (const m of world.misses) {
    const age = world.now - m.at;
    const alpha = Math.max(0, 1 - age / 0.9);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = COLORS.bad;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (const px of [LEFT_X, RIGHT_X]) {
      ctx.beginPath();
      ctx.moveTo(px + m.x - 10, PANEL_Y + m.y - 10);
      ctx.lineTo(px + m.x + 10, PANEL_Y + m.y + 10);
      ctx.moveTo(px + m.x + 10, PANEL_Y + m.y - 10);
      ctx.lineTo(px + m.x - 10, PANEL_Y + m.y + 10);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawHud(ctx, world) {
  ctx.fillStyle = COLORS.hud;
  ctx.fillRect(0, 0, STAGE_W, 96);
  text(ctx, "Milo's Garden", 36, 34, 30, COLORS.cream, 800);
  text(ctx, `Level ${world.levelIndex + 1}/3 · ${world.level.name}`, 36, 66, 17, '#d8c9a8', 600);
  // counter
  const cx = 640;
  text(ctx, `Found ${world.foundCount} / ${world.totalCount}`, cx, 34, 26, '#fff', 800, 'center');
  // counter pips
  const pipW = 22;
  const startX = cx - (world.totalCount * pipW) / 2;
  for (let i = 0; i < world.totalCount; i += 1) {
    const px = startX + i * pipW + pipW / 2;
    ctx.beginPath();
    ctx.arc(px, 66, 7, 0, Math.PI * 2);
    ctx.fillStyle = world.found.has(i) ? COLORS.good : 'rgba(255,255,255,0.25)';
    ctx.fill();
    if (world.found.has(i)) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px - 3.5, 66);
      ctx.lineTo(px - 1, 69);
      ctx.lineTo(px + 4, 62.5);
      ctx.stroke();
    }
  }
  // timer bar
  const barX = 980;
  const barW = 200;
  const frac = Math.max(0, world.timeLeft / world.level.time);
  roundRect(ctx, barX, 22, barW, 20, 10);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fill();
  if (frac > 0) {
    roundRect(ctx, barX, 22, barW * frac, 20, 10);
    ctx.fillStyle = frac < 0.25 ? COLORS.timerLow : COLORS.timer;
    ctx.fill();
  }
  text(ctx, `${Math.ceil(world.timeLeft)}s`, barX + barW / 2, 32, 15, '#fff', 800, 'center');
  text(ctx, `Score ${world.score}`, 1100, 66, 20, COLORS.gold, 800, 'right');
  text(ctx, `Best ${world.best}`, 1244, 66, 15, '#d8c9a8', 600, 'right');
}

function drawBar(ctx, world, buttons) {
  text(ctx, 'Click a difference in either picture — the same spot counts on both.', 36, BAR_Y + 16, 17, COLORS.ink, 600);
  const hintLabel = `Hint (H) · ${world.hintsLeft} left`;
  buttons.hint = { x: 760, y: BAR_Y + 2, w: 170, h: 40 };
  drawButton(ctx, buttons.hint, hintLabel, world.hintsLeft > 0 && world.screen === SCREEN_PLAY);
  buttons.restart = { x: 946, y: BAR_Y + 2, w: 150, h: 40 };
  drawButton(ctx, buttons.restart, 'Restart (R)', world.screen === SCREEN_PLAY);
  const msg = world.messageVisible ? world.message : '';
  if (msg) {
    text(ctx, msg, 640, BAR_Y + 52, 18, world.messageBad ? COLORS.bad : COLORS.good, 700, 'center');
  } else {
    text(ctx, `${world.remaining} difference${world.remaining === 1 ? '' : 's'} still hiding…`, 640, BAR_Y + 52, 18, '#7a6a55', 600, 'center');
  }
}

function overlay(ctx) {
  ctx.fillStyle = 'rgba(24,18,10,0.55)';
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
}

function drawTitle(ctx, world, buttons) {
  drawPanels(ctx, world, 0);
  overlay(ctx);
  roundRect(ctx, 340, 150, 600, 380, 20);
  ctx.fillStyle = COLORS.cream;
  ctx.fill();
  ctx.strokeStyle = COLORS.panelEdge;
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, "Milo's Garden", 640, 210, 46, COLORS.ink, 800, 'center');
  text(ctx, 'Spot the Difference', 640, 256, 26, '#b06a1e', 700, 'center');
  text(ctx, 'Two garden pictures, side by side.', 640, 308, 18, COLORS.ink, 600, 'center');
  text(ctx, 'Some things changed in picture B — find them all!', 640, 336, 18, COLORS.ink, 600, 'center');
  text(ctx, 'Click a difference · H for a hint · R to restart', 640, 364, 18, COLORS.ink, 600, 'center');
  text(ctx, 'A wrong click costs 3 seconds. 3 levels, faster each time.', 640, 392, 18, COLORS.ink, 600, 'center');
  buttons.start = { x: 520, y: 430, w: 240, h: 56 };
  drawButton(ctx, buttons.start, '▶  Start playing');
  text(ctx, 'Press Enter to start', 640, 508, 15, '#7a6a55', 600, 'center');
}

function drawLevelComplete(ctx, world, buttons) {
  drawPanels(ctx, world, 0);
  overlay(ctx);
  roundRect(ctx, 380, 190, 520, 300, 20);
  ctx.fillStyle = COLORS.cream;
  ctx.fill();
  ctx.strokeStyle = COLORS.panelEdge;
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'Level complete!', 640, 246, 38, COLORS.good, 800, 'center');
  text(ctx, `You found all ${world.totalCount} differences in ${world.level.name}.`, 640, 296, 18, COLORS.ink, 600, 'center');
  text(ctx, `Time bonus +${world.levelBonus}  ·  Score ${world.score}`, 640, 330, 20, COLORS.ink, 700, 'center');
  buttons.next = { x: 520, y: 380, w: 240, h: 56 };
  drawButton(ctx, buttons.next, world.levelIndex + 1 < 3 ? 'Next level ▶' : 'See results ▶');
  text(ctx, 'Press Enter to continue', 640, 462, 15, '#7a6a55', 600, 'center');
}

function drawGameOver(ctx, world, buttons) {
  drawPanels(ctx, world, 0);
  overlay(ctx);
  roundRect(ctx, 380, 190, 520, 300, 20);
  ctx.fillStyle = COLORS.cream;
  ctx.fill();
  ctx.strokeStyle = COLORS.panelEdge;
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, "Time's up!", 640, 246, 38, COLORS.bad, 800, 'center');
  text(ctx, `You found ${world.foundCount} of ${world.totalCount} differences in ${world.level.name}.`, 640, 296, 18, COLORS.ink, 600, 'center');
  text(ctx, `Score ${world.score}  ·  Best ${world.best}`, 640, 330, 20, COLORS.ink, 700, 'center');
  buttons.retry = { x: 520, y: 380, w: 240, h: 56 };
  drawButton(ctx, buttons.retry, '↻  Try again');
  text(ctx, 'Press R or Enter to retry', 640, 462, 15, '#7a6a55', 600, 'center');
}

function drawWin(ctx, world, buttons) {
  drawPanels(ctx, world, 0);
  overlay(ctx);
  roundRect(ctx, 340, 160, 600, 360, 20);
  ctx.fillStyle = COLORS.cream;
  ctx.fill();
  ctx.strokeStyle = COLORS.panelEdge;
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'You found them all!', 640, 222, 40, COLORS.good, 800, 'center');
  text(ctx, 'Milo thanks you — every garden is tidy again.', 640, 272, 19, COLORS.ink, 600, 'center');
  text(ctx, `Final score ${world.score}`, 640, 318, 26, COLORS.ink, 800, 'center');
  text(ctx, `Best ${world.best}`, 640, 352, 18, '#7a6a55', 600, 'center');
  buttons.retry = { x: 520, y: 400, w: 240, h: 56 };
  drawButton(ctx, buttons.retry, '↻  Play again');
  text(ctx, 'Press R or Enter to play again', 640, 482, 15, '#7a6a55', 600, 'center');
}

export function render(ctx, world, buttons, t) {
  ctx.fillStyle = '#f7e8c8';
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  const screen = world.screen;
  if (screen === SCREEN_TITLE) {
    drawTitle(ctx, world, buttons);
    return;
  }
  drawHud(ctx, world);
  drawPanels(ctx, world, t);
  drawBar(ctx, world, buttons);
  if (screen === SCREEN_LEVEL) drawLevelComplete(ctx, world, buttons);
  else if (screen === SCREEN_OVER) drawGameOver(ctx, world, buttons);
  else if (screen === SCREEN_WIN) drawWin(ctx, world, buttons);
}
