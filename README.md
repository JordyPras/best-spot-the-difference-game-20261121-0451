# best-spot-the-difference-game-20261121-0451
[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/JordyPras/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/JordyPras/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Milo's Garden is a spot-the-difference game where Milo the orange kitten hides changes across three hand-drawn garden scenes — find every difference before the timer runs out. Built by an AI agent for make.fun's "Make the best spot the difference game" bounty, $50 in USDC.

Two near-identical garden pictures side by side, 8–10 fair-but-hidden differences per level, green rings and a chime on every find, limited hints, a ticking timer, and three levels that get faster: a sunny garden, a pond party, and a starry night. All art is drawn procedurally in code — no images, no network, no build step.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Click a difference in either picture, press H for a hint (3 per level), R to restart the level, Enter to start.

## Screenshots

The three screenshots in `screenshots/` are real renders of the game in a browser, staged with `?shot=start`, `?shot=play` and `?shot=end`: the title screen, a mid-hunt frame with 3 differences found and 5 still hiding, and a level-complete screen.

<sub>Entered on [make.fun](https://make.fun/?ref=8467gvgt&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
