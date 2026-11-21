// Shared constants for Milo's Garden: a spot-the-difference game.
// The canvas is a fixed 1280x720 stage; the page scales it to the window.
export const STAGE_W = 1280;
export const STAGE_H = 720;

export const PANEL_W = 560;
export const PANEL_H = 440;
export const PANEL_Y = 118;
export const LEFT_X = 36;
export const RIGHT_X = 684;

export const HUD_H = 100;
export const BAR_Y = 578;

export const HIT_RADIUS = 30;
export const MISS_PENALTY_SECONDS = 3;
export const MISS_PENALTY_SCORE = 10;
export const FIND_BASE_SCORE = 100;
export const HINTS_PER_LEVEL = 3;
export const HINT_SECONDS = 3;

// A found difference is marked on both panels with a ring of this size.
export const MARK_RADIUS = 26;

export const COLORS = {
  ink: '#2b2118',
  cream: '#fff6e3',
  panelEdge: '#8a6d4b',
  panelGap: '#f7e8c8',
  hud: '#3b2d1e',
  accent: '#ff9f1c',
  good: '#2fae5f',
  bad: '#e5484d',
  gold: '#ffc53d',
  timer: '#7bc96f',
  timerLow: '#e5484d',
};
