# Data Model: Jogo "Toque para Voar" (MVP TapBird)

All entities are plain JavaScript objects (no classes), changed by pure logic functions. Units are
logical units of the 400×600 world, and time is in seconds.

## Bird

| Field | Type | Description / Rule |
|---|---|---|
| `x` | number | Fixed horizontal position (`BIRD_X`). |
| `y` | number | Vertical center. Starts at `BIRD_START_Y`. |
| `vy` | number | Vertical speed (positive = down). Limited to `MAX_FALL_SPEED`. |
| `radius` | number | Hitbox radius (`BIRD_RADIUS`). |
| `flapTime` | number | Time since the last flap (wing animation only). |

**Rules**: each step does `vy = min(vy + GRAVITY·dt, MAX_FALL_SPEED)` and then `y += vy·dt`.
A flap sets `vy = FLAP_VELOCITY` (it replaces the speed, it does not add to it).

## Obstacle (`ObstaclePair`)

| Field | Type | Description / Rule |
|---|---|---|
| `x` | number | Left edge of the pair. Starts at `WIDTH`. |
| `gapY` | number | Center of the gap. `GAP_MARGIN ≤ gapY ≤ groundY - GAP_MARGIN`. |
| `gapSize` | number | Gap height (`GAP_SIZE`). |
| `width` | number | Width (`PIPE_WIDTH`). |
| `scored` | boolean | `true` once the pair has been counted (counts only once, FR-006). |

**Derived rectangles**:
- Top pillar: `{x, y: 0, w: width, h: gapY - gapSize/2}`.
- Bottom pillar: `{x, y: gapY + gapSize/2, w: width, h: groundY - (gapY + gapSize/2)}`.

**Rules**:
- Moves `x -= PIPE_SPEED·dt`.
- Scores when `!scored && x + width < bird.x - bird.radius`.
- Removed when `x + width < 0` (FR-004).

## Game

| Field | Type | Description |
|---|---|---|
| `state` | `'ready' \| 'playing' \| 'paused' \| 'over'` | Current state (FR-008). |
| `bird` | Bird | The character. |
| `obstacles` | ObstaclePair[] | Active pairs, ordered by `x`. |
| `score` | number (int ≥ 0) | Score of the current game. |
| `best` | number (int ≥ 0) | Best score loaded from storage. |
| `newBest` | boolean | Whether this game beat the best score (for the end screen). |
| `spawnTimer` | number | Time until the next pair. |
| `overTime` | number | Time since the game ended (restart delay). |
| `scroll` | number | Accumulated horizontal offset (ground/background parallax). |
| `time` | number | Logic time accumulated by `step` in every state except `paused` (drives the idle bob on the start screen). |
| `rng` | () => number | Seeded PRNG in [0, 1). |

## Best score

- Key: `tapbird.best` in `localStorage`. Value: a string with a non-negative integer.
- Invalid or missing value → 0. Storage error → keep the value in memory only.

## State transitions

```text
          action                    collision
 ready ──────────────▶ playing ─────────────────▶ over
                        │   ▲ ▲                    │
                        │   │ │                    │ action AND overTime ≥ RESTART_DELAY
           blur/hidden  ▼   │ └────────────────────┘ (reset + first flap)
                       paused
                 action (no flap)
```

`ready` is only the first screen after opening the game. Restarting from `over` goes straight
to a new game (a single action, SC-005).

| From | Event | To | Effects |
|---|---|---|---|
| ready | action | playing | applies the first flap; `spawnTimer = SPAWN_INTERVAL` |
| ready | step | ready | the bird floats in place: `y = BIRD_START_Y + sin(time · IDLE_BOB_SPEED) · IDLE_BOB_AMPLITUDE`, no gravity |
| playing | action | playing | flap |
| playing | collision | over | updates `best`/`newBest`, `overTime = 0` (the caller saves the best score) |
| playing | blur/hidden | paused | freezes the logic |
| paused | action | playing | resumes without a flap |
| over | action (`overTime < RESTART_DELAY`) | over | ignored |
| over | action (`overTime ≥ RESTART_DELAY`) | playing | reset (new bird, `obstacles = []`, `score = 0`, `newBest = false`, keeps `best` and `rng`), then first flap and `spawnTimer = SPAWN_INTERVAL` |
