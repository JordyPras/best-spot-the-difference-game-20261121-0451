// Procedural garden scenes for Milo's Garden.
// Every scene is drawn twice: the left panel (variant=false, the base scene)
// and the right panel (variant=true, every difference applied). A difference
// is one entry in a level's `diffs` list: a position in scene coordinates,
// a short label, and the visual change the painter applies when variant is
// true. Nothing is loaded from disk: all art is canvas paths in this file.
//
// Scene space is 560 x 440 (PANEL_W x PANEL_H from config.js).
import { mulberry32 } from './random.js';

export const SCENE_W = 560;
export const SCENE_H = 440;

// ---------------------------------------------------------------- helpers

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function petal(ctx, x, y, angle, len, wid, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, -len / 2, wid / 2, len / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

export function drawFlower(ctx, x, y, petalColor, centerColor = '#ffcf3d') {
  for (let i = 0; i < 6; i += 1) petal(ctx, x, y, (i * Math.PI) / 3, 16, 9, petalColor);
  circle(ctx, x, y, 6, centerColor);
  ctx.strokeStyle = '#3f7d3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + 8);
  ctx.lineTo(x, y + 26);
  ctx.stroke();
}

function drawCloud(ctx, x, y, scale = 1) {
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  circle(ctx, x, y, 18 * scale, 'rgba(255,255,255,0.95)');
  circle(ctx, x + 20 * scale, y + 4 * scale, 14 * scale, 'rgba(255,255,255,0.95)');
  circle(ctx, x - 20 * scale, y + 5 * scale, 13 * scale, 'rgba(255,255,255,0.95)');
  ctx.fillRect(x - 30 * scale, y, 60 * scale, 12 * scale);
}

function drawSun(ctx, x, y, withGlasses) {
  ctx.strokeStyle = '#f5a623';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * 44, y + Math.sin(a) * 44);
    ctx.lineTo(x + Math.cos(a) * 56, y + Math.sin(a) * 56);
    ctx.stroke();
  }
  circle(ctx, x, y, 38, '#ffd94d');
  circle(ctx, x - 12, y - 4, 4, '#7a5a1d');
  circle(ctx, x + 12, y - 4, 4, '#7a5a1d');
  ctx.strokeStyle = '#7a5a1d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y + 6, 14, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  if (withGlasses) {
    ctx.fillStyle = '#20242b';
    ctx.fillRect(x - 26, y - 12, 24, 13);
    ctx.fillRect(x + 2, y - 12, 24, 13);
    ctx.strokeStyle = '#20242b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 2, y - 6);
    ctx.lineTo(x + 2, y - 6);
    ctx.moveTo(x - 26, y - 6);
    ctx.lineTo(x - 34, y - 10);
    ctx.moveTo(x + 26, y - 6);
    ctx.lineTo(x + 34, y - 10);
    ctx.stroke();
  }
}

function drawButterfly(ctx, x, y, scale = 1, flap = 0) {
  const wing = 14 * scale * (1 - flap * 0.35);
  ctx.fillStyle = '#ffcf3d';
  ctx.beginPath();
  ctx.ellipse(x - wing / 2, y - 6 * scale, wing / 2, 10 * scale, -0.5, 0, Math.PI * 2);
  ctx.ellipse(x + wing / 2, y - 6 * scale, wing / 2, 10 * scale, 0.5, 0, Math.PI * 2);
  ctx.ellipse(x - wing / 2, y + 7 * scale, wing / 2 - 2, 8 * scale, 0.5, 0, Math.PI * 2);
  ctx.ellipse(x + wing / 2, y + 7 * scale, wing / 2 - 2, 8 * scale, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a4a12';
  circle(ctx, x - 6 * scale, y - 8 * scale, 3, '#7a4a12');
  circle(ctx, x + 6 * scale, y - 8 * scale, 3, '#7a4a12');
  ctx.fillStyle = '#5b3a1e';
  ctx.fillRect(x - 2.5 * scale, y - 10 * scale, 5 * scale, 20 * scale);
}

function drawBird(ctx, x, y, bodyColor = '#5aa9e6', facing = 1) {
  ellipse(ctx, x, y, 16, 12, bodyColor);
  circle(ctx, x + 12 * facing, y - 8, 9, bodyColor);
  ctx.fillStyle = '#20242b';
  circle(ctx, x + 14 * facing, y - 10, 2, '#20242b');
  ctx.fillStyle = '#ff9f1c';
  ctx.beginPath();
  ctx.moveTo(x + 20 * facing, y - 8);
  ctx.lineTo(x + 28 * facing, y - 5);
  ctx.lineTo(x + 20 * facing, y - 3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 4);
  ctx.lineTo(x - 22, y - 4);
  ctx.stroke();
}

function drawMushroom(ctx, x, y, scale = 1) {
  ctx.fillStyle = '#f3ead8';
  ctx.fillRect(x - 4 * scale, y, 8 * scale, 14 * scale);
  ctx.fillStyle = '#e5484d';
  ctx.beginPath();
  ctx.arc(x, y + 2 * scale, 16 * scale, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  circle(ctx, x - 7 * scale, y - 6 * scale, 3, '#fff');
  circle(ctx, x + 5 * scale, y - 10 * scale, 2.5, '#fff');
  circle(ctx, x + 9 * scale, y - 3 * scale, 2, '#fff');
}

// Milo the kitten: orange body, big green eyes, tiny red scarf.
// `opts` may override scarf color, add a hat, or make him sleep.
export function drawMilo(ctx, x, y, s = 1, opts = {}) {
  const scarf = opts.scarf || '#d9382b';
  const sleeping = !!opts.sleeping;
  // tail
  ctx.strokeStyle = '#f59e42';
  ctx.lineWidth = 10 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 34 * s, y + 18 * s);
  ctx.quadraticCurveTo(x - 58 * s, y + 8 * s, x - 52 * s, y - 14 * s);
  ctx.stroke();
  // body
  ellipse(ctx, x, y + 16 * s, 36 * s, 26 * s, '#f59e42');
  ellipse(ctx, x, y + 26 * s, 26 * s, 12 * s, '#ffe3b3');
  // stripes
  ctx.strokeStyle = '#d97b1e';
  ctx.lineWidth = 3 * s;
  for (const dx of [-16, 0, 16]) {
    ctx.beginPath();
    ctx.moveTo(x + dx * s - 4 * s, y - 2 * s);
    ctx.lineTo(x + dx * s + 4 * s, y + 10 * s);
    ctx.stroke();
  }
  // ears
  ctx.fillStyle = '#f59e42';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * 26 * s, y - 12 * s);
    ctx.lineTo(x + side * 14 * s, y - 34 * s);
    ctx.lineTo(x + side * 34 * s, y - 30 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f7b8c4';
    ctx.beginPath();
    ctx.moveTo(x + side * 23 * s, y - 16 * s);
    ctx.lineTo(x + side * 16 * s, y - 28 * s);
    ctx.lineTo(x + side * 28 * s, y - 26 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f59e42';
  }
  // head
  circle(ctx, x, y - 8 * s, 30 * s, '#f59e42');
  // eyes
  if (sleeping) {
    ctx.strokeStyle = '#5b3a1e';
    ctx.lineWidth = 2.5 * s;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x + side * 12 * s, y - 10 * s, 5 * s, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }
  } else {
    circle(ctx, x - 12 * s, y - 12 * s, 7 * s, '#fff');
    circle(ctx, x + 12 * s, y - 12 * s, 7 * s, '#fff');
    circle(ctx, x - 12 * s, y - 12 * s, 4.5 * s, '#2f7d32');
    circle(ctx, x + 12 * s, y - 12 * s, 4.5 * s, '#2f7d32');
    circle(ctx, x - 10.5 * s, y - 13.5 * s, 1.8 * s, '#10240f');
    circle(ctx, x + 13.5 * s, y - 13.5 * s, 1.8 * s, '#10240f');
  }
  // nose + mouth
  ctx.fillStyle = '#e86a7a';
  ctx.beginPath();
  ctx.moveTo(x - 5 * s, y - 2 * s);
  ctx.lineTo(x + 5 * s, y - 2 * s);
  ctx.lineTo(x, y + 3 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5b3a1e';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(x, y + 3 * s);
  ctx.lineTo(x, y + 8 * s);
  ctx.moveTo(x, y + 8 * s);
  ctx.quadraticCurveTo(x - 6 * s, y + 12 * s, x - 10 * s, y + 8 * s);
  ctx.moveTo(x, y + 8 * s);
  ctx.quadraticCurveTo(x + 6 * s, y + 12 * s, x + 10 * s, y + 8 * s);
  ctx.stroke();
  // whiskers
  ctx.strokeStyle = 'rgba(91,58,30,0.7)';
  ctx.lineWidth = 1.5 * s;
  for (const side of [-1, 1]) {
    for (const wy of [-4, 2]) {
      ctx.beginPath();
      ctx.moveTo(x + side * 22 * s, y + wy * s);
      ctx.lineTo(x + side * 38 * s, y + (wy - 3) * s);
      ctx.stroke();
    }
  }
  // scarf
  ctx.strokeStyle = scarf;
  ctx.lineWidth = 9 * s;
  ctx.beginPath();
  ctx.arc(x, y + 14 * s, 24 * s, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = scarf;
  ctx.beginPath();
  ctx.moveTo(x + 14 * s, y + 34 * s);
  ctx.lineTo(x + 26 * s, y + 34 * s);
  ctx.lineTo(x + 20 * s, y + 48 * s);
  ctx.lineTo(x + 10 * s, y + 46 * s);
  ctx.closePath();
  ctx.fill();
  // hat
  if (opts.hat) {
    ctx.fillStyle = opts.hat;
    ctx.beginPath();
    ctx.ellipse(x, y - 32 * s, 34 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y - 34 * s, 20 * s, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
  }
}

function drawFence(ctx, y, missingPost) {
  ctx.fillStyle = '#b98a56';
  ctx.fillRect(0, y, SCENE_W, 8);
  ctx.fillRect(0, y + 22, SCENE_W, 8);
  for (let i = 0; i < 6; i += 1) {
    if (i === missingPost) continue;
    const x = 20 + i * 104;
    ctx.fillStyle = '#c99a63';
    ctx.fillRect(x, y - 14, 16, 62);
    ctx.beginPath();
    ctx.moveTo(x, y - 14);
    ctx.lineTo(x + 8, y - 26);
    ctx.lineTo(x + 16, y - 14);
    ctx.closePath();
    ctx.fill();
  }
}

function drawTree(ctx, x, y, withBird, birdColor) {
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(x - 10, y, 20, 90);
  ctx.fillStyle = '#4e9b47';
  circle(ctx, x, y - 20, 52, '#4e9b47');
  circle(ctx, x - 38, y + 6, 36, '#5cab54');
  circle(ctx, x + 38, y + 4, 38, '#57a24e');
  circle(ctx, x, y - 58, 34, '#66b35c');
  if (withBird) drawBird(ctx, x + 44, y - 46, birdColor || '#5aa9e6', -1);
}

function grassTufts(ctx, rng, groundY, color = '#3f8f3a') {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let i = 0; i < 26; i += 1) {
    const x = 8 + rng() * (SCENE_W - 16);
    const y = groundY + rng() * (SCENE_H - groundY - 8);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y - 8);
    ctx.moveTo(x + 2, y);
    ctx.lineTo(x + 2, y - 9);
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 7, y - 7);
    ctx.stroke();
  }
}

function skyGradient(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
}

function ground(ctx, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, y, SCENE_W, SCENE_H - y);
}

// ------------------------------------------------------------ level painters

function paintSunnyGarden(ctx, v) {
  skyGradient(ctx, '#7ec8f7', '#dff3ff');
  drawSun(ctx, 92, 72, v);
  drawCloud(ctx, 250, 66, 1);
  drawCloud(ctx, 420, 44, 0.8);
  if (v) drawCloud(ctx, 480, 96, 0.7);
  ground(ctx, 300, '#7cc46a');
  ctx.fillStyle = '#6db45e';
  ctx.beginPath();
  ctx.ellipse(280, 310, 300, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  drawFence(ctx, 268, v ? 3 : -1);
  drawTree(ctx, 492, 236, !v, '#5aa9e6');
  drawMilo(ctx, 280, 330, 1.15, { scarf: v ? '#2fae5f' : '#d9382b' });
  if (!v) drawButterfly(ctx, 432, 128, 1, 0);
  drawFlower(ctx, 96, 392, '#e5484d');
  drawFlower(ctx, 150, 372, v ? '#3d7bd6' : '#e5484d');
  drawFlower(ctx, 470, 396, '#ff9f1c');
  drawFlower(ctx, 420, 366, '#c86dd7');
  drawFlower(ctx, 60, 350, '#ff9f1c');
  if (v) drawMushroom(ctx, 92, 402, 1);
  const rng = mulberry32(11);
  grassTufts(ctx, rng, 316);
}

function paintPondParty(ctx, v) {
  skyGradient(ctx, '#8fd0f5', '#e8f7ff');
  drawSun(ctx, 470, 64, false);
  drawCloud(ctx, 140, 58, 1);
  drawCloud(ctx, 330, 40, 0.75);
  ground(ctx, 296, '#79c468');
  // pond
  ctx.fillStyle = '#5fb7e8';
  ctx.beginPath();
  ctx.ellipse(280, 372, 230, 52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(220, 356, 70, 12, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // lily pads + flowers (the right-hand pad drifts in the variant)
  ctx.fillStyle = '#3f9e4d';
  ctx.beginPath();
  ctx.ellipse(180, 380, 34, 12, 0.2, 0, Math.PI * 2);
  ctx.ellipse(v ? 396 : 360, v ? 398 : 392, 30, 11, -0.15, 0, Math.PI * 2);
  ctx.ellipse(300, 352, 26, 10, 0.1, 0, Math.PI * 2);
  ctx.fill();
  drawFlower(ctx, 180, 372, v ? '#ff9f1c' : '#ff7fb0', '#fff3c4');
  drawFlower(ctx, v ? 396 : 360, v ? 390 : 384, '#ff7fb0', '#fff3c4');
  // duck (faces left in base, right in variant)
  const duckX = 250;
  const duckY = 386;
  const dir = v ? 1 : -1;
  ellipse(ctx, duckX, duckY, 22, 14, '#fff');
  circle(ctx, duckX + 16 * dir, duckY - 12, 11, '#fff');
  ctx.fillStyle = '#20242b';
  circle(ctx, duckX + 18 * dir, duckY - 14, 2, '#20242b');
  ctx.fillStyle = '#ff9f1c';
  ctx.beginPath();
  ctx.moveTo(duckX + 26 * dir, duckY - 12);
  ctx.lineTo(duckX + 36 * dir, duckY - 8);
  ctx.lineTo(duckX + 26 * dir, duckY - 6);
  ctx.closePath();
  ctx.fill();
  // fish jumping (variant only)
  if (v) {
    ctx.fillStyle = '#ff8c42';
    ctx.beginPath();
    ctx.ellipse(430, 330, 14, 7, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(442, 326);
    ctx.lineTo(452, 320);
    ctx.lineTo(450, 332);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(430, 352, 12, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  // frog on a pad (base only)
  if (!v) {
    circle(ctx, 300, 344, 12, '#57a24e');
    circle(ctx, 292, 334, 5, '#57a24e');
    circle(ctx, 308, 334, 5, '#57a24e');
    ctx.fillStyle = '#fff';
    circle(ctx, 292, 333, 2.5, '#fff');
    circle(ctx, 308, 333, 2.5, '#fff');
    ctx.fillStyle = '#20242b';
    circle(ctx, 292, 333, 1.2, '#20242b');
    circle(ctx, 308, 333, 1.2, '#20242b');
  }
  // reeds
  ctx.strokeStyle = '#3f7d3a';
  ctx.lineWidth = 4;
  for (const [rx, rh] of [[70, 46], [86, 60], [500, 52], [516, 40], [470, 44]]) {
    ctx.beginPath();
    ctx.moveTo(rx, 330);
    ctx.lineTo(rx, 330 - rh);
    ctx.stroke();
  }
  if (v) {
    ctx.beginPath();
    ctx.moveTo(120, 330);
    ctx.lineTo(120, 282);
    ctx.stroke();
  }
  // Milo fishing on the bank, bucket beside him
  drawMilo(ctx, 120, 300, 0.95, { scarf: '#d9382b', hat: v ? '#2f7dc2' : undefined });
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(150, 296);
  ctx.quadraticCurveTo(210, 270, 250, 330);
  ctx.stroke();
  ctx.strokeStyle = '#5b3a1e';
  ctx.lineWidth = 1.5;
  if (!v) {
    ctx.beginPath();
    ctx.moveTo(250, 330);
    ctx.lineTo(250, 352);
    ctx.stroke();
  }
  ctx.fillStyle = v ? '#2f7dc2' : '#e5484d';
  ctx.fillRect(168, 316, 22, 18);
  ctx.fillRect(164, 312, 30, 6);
  const rng = mulberry32(22);
  grassTufts(ctx, rng, 306);
}

function paintStarryNight(ctx, v) {
  skyGradient(ctx, '#101a3a', '#2c4a7a');
  const rng = mulberry32(33);
  ctx.fillStyle = '#fff';
  for (let i = 0; i < (v ? 46 : 38); i += 1) {
    const x = rng() * SCENE_W;
    const y = rng() * 210;
    const r = 1 + rng() * 1.8;
    ctx.globalAlpha = 0.5 + rng() * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // a small star cluster only the variant sky has
  if (v) {
    ctx.fillStyle = '#fff';
    for (const [sx, sy] of [[270, 108], [286, 124], [264, 130]]) {
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // moon: crescent in base, full in variant
  if (v) {
    circle(ctx, 470, 74, 34, '#ffe9a8');
    circle(ctx, 458, 66, 5, '#e8c96a');
    circle(ctx, 478, 82, 4, '#e8c96a');
  } else {
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.arc(470, 74, 34, 0, Math.PI * 2);
    ctx.arc(486, 64, 30, 0, Math.PI * 2);
    ctx.fill('evenodd');
  }
  // shooting star (variant only)
  if (v) {
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(150, 52);
    ctx.lineTo(196, 82);
    ctx.stroke();
    circle(ctx, 196, 82, 3.5, '#fff');
  }
  ground(ctx, 300, '#2e5d3a');
  // little house with a window
  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(60, 236, 90, 64);
  ctx.fillStyle = '#a33d2e';
  ctx.beginPath();
  ctx.moveTo(50, 238);
  ctx.lineTo(105, 196);
  ctx.lineTo(160, 238);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = v ? '#ffe9a8' : '#2c2c34';
  ctx.fillRect(92, 258, 26, 26);
  ctx.strokeStyle = '#5b3a1e';
  ctx.lineWidth = 2;
  ctx.strokeRect(92, 258, 26, 26);
  // a roof tile slipped off in the variant
  if (v) {
    ctx.fillStyle = '#5b2d1e';
    ctx.beginPath();
    ctx.moveTo(98, 214);
    ctx.lineTo(112, 214);
    ctx.lineTo(105, 226);
    ctx.closePath();
    ctx.fill();
  }
  // tree + owl (base only)
  drawTree(ctx, 470, 236, false);
  if (!v) {
    ellipse(ctx, 448, 172, 13, 17, '#6b4a2f');
    circle(ctx, 442, 158, 4.5, '#fff');
    circle(ctx, 454, 158, 4.5, '#fff');
    ctx.fillStyle = '#20242b';
    circle(ctx, 442, 158, 2, '#20242b');
    circle(ctx, 454, 158, 2, '#20242b');
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath();
    ctx.moveTo(448, 162);
    ctx.lineTo(444, 168);
    ctx.lineTo(452, 168);
    ctx.closePath();
    ctx.fill();
  }
  // lantern on a post
  ctx.fillStyle = '#5b3a1e';
  ctx.fillRect(238, 250, 6, 50);
  ctx.fillStyle = v ? '#ff5a3c' : '#ffc53d';
  ctx.beginPath();
  ctx.arc(241, 244, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,197,61,0.25)';
  ctx.beginPath();
  ctx.arc(241, 244, 26, 0, Math.PI * 2);
  ctx.fill();
  // Milo asleep on a blanket
  ctx.fillStyle = v ? '#3d7bd6' : '#c86dd7';
  ctx.beginPath();
  ctx.ellipse(330, 372, 92, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  drawMilo(ctx, 330, 330, 1.05, { scarf: '#d9382b', sleeping: true });
  // fireflies (3 base, 5 variant)
  const flies = v
    ? [[180, 330], [210, 300], [400, 320], [430, 290], [90, 320]]
    : [[180, 330], [210, 300], [400, 320]];
  for (const [fx, fy] of flies) {
    ctx.fillStyle = 'rgba(190,255,120,0.35)';
    circle(ctx, fx, fy, 10, 'rgba(190,255,120,0.35)');
    circle(ctx, fx, fy, 3, '#d8ff7a');
  }
  // glowing mushroom (variant only)
  if (v) {
    drawMushroom(ctx, 500, 400, 1);
    ctx.fillStyle = 'rgba(120,255,160,0.3)';
    circle(ctx, 500, 392, 22, 'rgba(120,255,160,0.3)');
  }
  const rng2 = mulberry32(44);
  grassTufts(ctx, rng2, 316, '#2a6b32');
}

// ------------------------------------------------------------------ levels

const PAINTERS = [paintSunnyGarden, paintPondParty, paintStarryNight];

export const LEVELS = [
  {
    name: "Milo's Sunny Garden",
    time: 90,
    paint: 0,
    diffs: [
      { x: 92, y: 72, label: 'Sunglasses on the sun' },
      { x: 432, y: 128, label: 'The butterfly is gone' },
      { x: 150, y: 372, label: 'A flower changed colour' },
      { x: 280, y: 330, label: "Milo's scarf changed colour" },
      { x: 480, y: 96, label: 'An extra cloud' },
      { x: 332, y: 272, label: 'A fence post is missing' },
      { x: 92, y: 402, label: 'A mushroom appeared' },
      { x: 536, y: 190, label: 'The bird flew away' },
    ],
  },
  {
    name: "Milo's Pond Party",
    time: 75,
    paint: 1,
    diffs: [
      { x: 266, y: 380, label: 'The duck turned around' },
      { x: 180, y: 372, label: 'A lily flower changed colour' },
      { x: 430, y: 330, label: 'A fish jumped out' },
      { x: 300, y: 340, label: 'The frog hopped away' },
      { x: 120, y: 262, label: 'Milo is wearing a hat' },
      { x: 120, y: 300, label: 'An extra reed grew' },
      { x: 179, y: 325, label: "The bucket changed colour" },
      { x: 396, y: 398, label: 'A lily pad drifted away' },
      { x: 250, y: 330, label: 'The fishing line is gone' },
    ],
  },
  {
    name: "Milo's Starry Night",
    time: 60,
    paint: 2,
    diffs: [
      { x: 470, y: 74, label: 'The moon is full now' },
      { x: 173, y: 67, label: 'A shooting star' },
      { x: 105, y: 271, label: 'The window light is on' },
      { x: 448, y: 168, label: 'The owl flew away' },
      { x: 241, y: 244, label: 'The lantern changed colour' },
      { x: 330, y: 372, label: "Milo's blanket changed colour" },
      { x: 430, y: 290, label: 'More fireflies' },
      { x: 500, y: 392, label: 'A glowing mushroom' },
      { x: 105, y: 214, label: 'The roof lost a tile' },
      { x: 280, y: 120, label: 'More stars in the sky' },
    ],
  },
];

/** Draw one panel of a level: variant=false is the left picture, true the right. */
export function drawScene(ctx, levelIndex, variant) {
  const level = LEVELS[levelIndex];
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  ctx.clip();
  PAINTERS[level.paint](ctx, variant);
  ctx.restore();
}

/** The right panel's differences, for hit-testing and hints. */
export function levelDiffs(levelIndex) {
  return LEVELS[levelIndex].diffs;
}
