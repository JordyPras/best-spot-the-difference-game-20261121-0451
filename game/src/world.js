// Game state for Milo's Garden: screens, timer, score, hints and marks.
// Screens: 'title' | 'play' | 'level' | 'over' | 'win'.
// A mark is a found difference, shown as a ring on both panels.
import {
  COLORS,
  FIND_BASE_SCORE,
  HINTS_PER_LEVEL,
  HINT_SECONDS,
  HIT_RADIUS,
  MISS_PENALTY_SCORE,
  MISS_PENALTY_SECONDS,
} from './config.js';
import { LEVELS, levelDiffs } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_LEVEL = 'level';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

export class World {
  constructor() {
    this.reset();
  }

  reset() {
    this.screen = SCREEN_TITLE;
    this.levelIndex = 0;
    this.score = 0;
    this.best = 0;
    this.timeLeft = LEVELS[0].time;
    this.found = new Set();
    this.hintsLeft = HINTS_PER_LEVEL;
    this.hintIndex = -1;
    this.hintUntil = 0;
    this.misses = [];
    this.message = '';
    this.messageUntil = 0;
    this.levelBonus = 0;
    this.now = 0;
    this.startedAt = 0;
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  get diffs() {
    return levelDiffs(this.levelIndex);
  }

  get foundCount() {
    return this.found.size;
  }

  get totalCount() {
    return this.diffs.length;
  }

  get remaining() {
    return this.totalCount - this.foundCount;
  }

  startGame() {
    this.score = 0;
    this.levelIndex = 0;
    this.startLevel(0);
  }

  startLevel(index) {
    this.levelIndex = index;
    this.timeLeft = this.level.time;
    this.found = new Set();
    this.hintsLeft = HINTS_PER_LEVEL;
    this.hintIndex = -1;
    this.misses = [];
    this.screen = SCREEN_PLAY;
    this.startedAt = this.now;
    this.say(`Level ${index + 1}: ${this.level.name} — find ${this.totalCount}!`);
  }

  /** Advance the clock by dt seconds; returns true when time runs out. */
  tick(dt) {
    this.now += dt;
    if (this.screen !== SCREEN_PLAY) return false;
    this.timeLeft -= dt;
    if (this.hintIndex >= 0 && this.now > this.hintUntil) this.hintIndex = -1;
    this.misses = this.misses.filter((m) => this.now - m.at < 0.9);
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.screen = SCREEN_OVER;
      this.best = Math.max(this.best, this.score);
      return true;
    }
    return false;
  }

  /** Click at scene coordinates (x, y) on either panel. Returns 'found' | 'miss' | null. */
  clickAt(x, y) {
    if (this.screen !== SCREEN_PLAY) return null;
    // Clicking a difference already found is a no-op, never a penalty:
    // the nearest difference of all decides, found or not.
    let nearest = -1;
    let nearestDist = Infinity;
    for (let i = 0; i < this.diffs.length; i += 1) {
      const d = this.diffs[i];
      const dist = Math.hypot(d.x - x, d.y - y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    }
    if (nearest >= 0 && nearestDist <= HIT_RADIUS && this.found.has(nearest)) return null;
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < this.diffs.length; i += 1) {
      if (this.found.has(i)) continue;
      const d = this.diffs[i];
      const dist = Math.hypot(d.x - x, d.y - y);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    if (best >= 0 && bestDist <= HIT_RADIUS) {
      this.found.add(best);
      const gained = FIND_BASE_SCORE + Math.round(this.timeLeft);
      this.score += gained;
      this.say(`Found: ${this.diffs[best].label}! +${gained}`);
      if (this.found.size === this.diffs.length) this.completeLevel();
      return 'found';
    }
    this.misses.push({ x, y, at: this.now });
    this.timeLeft = Math.max(0, this.timeLeft - MISS_PENALTY_SECONDS);
    this.score = Math.max(0, this.score - MISS_PENALTY_SCORE);
    this.say(`Not there! -${MISS_PENALTY_SECONDS}s`, true);
    return 'miss';
  }

  completeLevel() {
    this.levelBonus = Math.round(this.timeLeft) * 10;
    this.score += this.levelBonus;
    this.best = Math.max(this.best, this.score);
    if (this.levelIndex + 1 >= LEVELS.length) {
      this.screen = SCREEN_WIN;
    } else {
      this.screen = SCREEN_LEVEL;
    }
  }

  nextLevel() {
    this.startLevel(this.levelIndex + 1);
  }

  useHint() {
    if (this.screen !== SCREEN_PLAY || this.hintsLeft <= 0) return false;
    const unfound = [];
    for (let i = 0; i < this.diffs.length; i += 1) {
      if (!this.found.has(i)) unfound.push(i);
    }
    if (unfound.length === 0) return false;
    this.hintsLeft -= 1;
    this.hintIndex = unfound[Math.floor(Math.random() * unfound.length)];
    this.hintUntil = this.now + HINT_SECONDS;
    this.say(`Hint: look near "${this.diffs[this.hintIndex].label}"`);
    return true;
  }

  say(text, bad = false) {
    this.message = text;
    this.messageBad = bad;
    this.messageUntil = this.now + 2.2;
  }

  get messageVisible() {
    return this.message && this.now < this.messageUntil;
  }
}
