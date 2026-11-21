// Screenshot scenes behind ?shot=start|play|end.
// Each scene is a real game state reached through the world's own methods,
// frozen in time, so the frame is exactly what a player would see.
//   start — the title screen over level 1's garden
//   play  — level 1 mid-hunt: 3 found (ringed on both panels), 5 still
//           hiding, counter at 3/8, timer at 47s
//   end   — level 1 complete: all 8 found, time bonus shown
import { SCREEN_LEVEL, SCREEN_PLAY, SCREEN_TITLE } from './world.js';

/** Stage `world` for the named shot and return its screen. */
export function stageShot(name, world) {
  world.reset();
  if (name === 'play') {
    world.startGame();
    world.timeLeft = 47;
    world.score = 100 + 137 + 124;
    for (const i of [0, 2, 4]) world.found.add(i);
    world.say('Found: A flower changed colour! +124');
    world.messageUntil = world.now + 2.2;
    world.screen = SCREEN_PLAY;
    return SCREEN_PLAY;
  }
  if (name === 'end') {
    world.startGame();
    world.timeLeft = 41;
    for (let i = 0; i < world.totalCount; i += 1) world.found.add(i);
    world.completeLevel();
    world.screen = SCREEN_LEVEL;
    return SCREEN_LEVEL;
  }
  world.screen = SCREEN_TITLE;
  return SCREEN_TITLE;
}
