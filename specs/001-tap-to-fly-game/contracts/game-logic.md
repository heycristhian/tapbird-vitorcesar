# Contract: Game logic modules (pure, no DOM)

These modules can be imported in the browser and in Node (tests). They MUST NOT access `window`,
`document`, `localStorage`, or the clock (`Date.now`/`performance.now`). Time always comes in
through the `dt` parameter.

## `src/config.js`

Exports named constants (see the table in [research.md](../research.md)): `WIDTH`, `HEIGHT`,
`GROUND_HEIGHT`, `GRAVITY`, `FLAP_VELOCITY`, `MAX_FALL_SPEED`, `BIRD_X`, `BIRD_RADIUS`,
`PIPE_SPEED`, `PIPE_WIDTH`, `GAP_SIZE`, `GAP_MARGIN`, `SPAWN_INTERVAL`, `RESTART_DELAY`,
`FIXED_DT`, `MAX_FRAME_DT`, `BIRD_START_Y`, `IDLE_BOB_AMPLITUDE`, `IDLE_BOB_SPEED`, and the
derived `GROUND_Y`.

## `src/rng.js`

| Function | Signature | Guarantee |
|---|---|---|
| `createRng` | `(seed: number) => () => number` | Same seed ⇒ same sequence; values in [0, 1). |

## `src/bird.js`

| Function | Signature | Guarantee |
|---|---|---|
| `createBird` | `() => Bird` | Initial position defined in [data-model.md](../data-model.md). |
| `flap` | `(bird) => void` | `bird.vy === FLAP_VELOCITY`. |
| `updateBird` | `(bird, dt) => void` | Applies gravity with a speed limit, then position. |

## `src/obstacles.js`

| Function | Signature | Guarantee |
|---|---|---|
| `createObstacle` | `(rng) => ObstaclePair` | `x === WIDTH`; `gapY` inside the margins. |
| `updateObstacles` | `(list, dt) => ObstaclePair[]` | Moves them and removes those off screen. |
| `obstacleRects` | `(pair) => [Rect, Rect]` | Top and bottom rectangles. |

## `src/collision.js`

| Function | Signature | Guarantee |
|---|---|---|
| `circleRectHit` | `(cx, cy, r, rect) => boolean` | `true` when they overlap (touching counts). |
| `hitsBounds` | `(bird) => boolean` | Ceiling (`y - r ≤ 0`) or ground (`y + r ≥ HEIGHT - GROUND_HEIGHT`). |
| `birdCollides` | `(bird, obstacles) => boolean` | Bounds or any pillar. |

## `src/game.js` (orchestration and state machine)

| Function | Signature | Guarantee |
|---|---|---|
| `createGame` | `({ seed, best }) => Game` | `state === 'ready'`, `score === 0`. |
| `action` | `(game) => void` | Applies the transitions in the data-model table. |
| `pause` | `(game) => void` | `playing → paused`; no-op in any other state. |
| `step` | `(game, dt) => { scored: boolean, died: boolean }` | Advances exactly `dt` of logic (call with `FIXED_DT`). |
| `advance` | `(game, frameDt, acc) => { acc: number, died: boolean }` | Fixed-timestep accumulator: clamps `frameDt` to `MAX_FRAME_DT`, adds it to `acc`, calls `step(game, FIXED_DT)` while `acc ≥ FIXED_DT`, returns the leftover `acc` and whether any step returned `died`. The same total time split into frames of different sizes MUST give the same state (FR-013). |

`step` while `playing` does, in this order: update the bird → spawn/move obstacles → score →
check collision. On collision: `state = 'over'`, update `best`/`newBest`. Saving the best score is
the caller's job (`main.js`), done when `died === true`.

## Side-effect modules (browser only)

| Module | Responsibility |
|---|---|
| `src/storage.js` | `loadBest(): number`, `saveBest(n): void` with `try/catch`. |
| `src/render.js` | `render(ctx, game)`: draws background, obstacles, ground, bird, HUD and screens. |
| `src/input.js` | `bindInput(canvas, onAction, onPause)`: pointer, keyboard, visibility/blur. |
| `src/main.js` | Scaling, `requestAnimationFrame` loop calling `advance`, glue between modules, `?seed=` from the URL. |
