# Quickstart: Validating the TapBird MVP

## Prerequisites

- Node.js 18 or newer (`node --version`).
- A modern browser (Chrome, Edge, Firefox).
- Nothing to install: the project has no npm dependencies.

## Run

```powershell
npm start          # same as: node serve.js
```

Open `http://localhost:8080`. To get the same obstacles on every run, use
`http://localhost:8080/?seed=42`.

## Automated tests

```powershell
npm test           # same as: node --test tests/
```

Expected result: every test passes (SC-006). The tests cover the contracts in
[contracts/game-logic.md](./contracts/game-logic.md):

| Scenario | Expected |
|---|---|
| Same seed, 100 values | Identical sequences; all in [0, 1) |
| Bird with no action for 2 s | Hits the ground → `over` |
| `flap` | `vy === FLAP_VELOCITY` no matter the previous `vy` |
| `advance` with 60 frames of 1/60 s vs. 120 frames of 1/120 s | Identical game state (frame-rate independence) |
| Generated pair | `gapY` inside the margins; leaves the list after crossing `x < -width` |
| Bird passes a pair | `score` goes up by 1 exactly once |
| Circle touching the edge of a rectangle | Collision `true` |
| Bird above the ceiling | `hitsBounds === true` |
| `action` in `over` before 0.5 s | Ignored; after 0.5 s → `playing` with `score 0`, no obstacles and a flap |
| `pause` in `playing`, then `action` | `paused` → `playing` without a flap |

## Manual validation (user stories)

1. **US3 – Start**: when the page opens, the start screen shows the title and the instructions;
   the bird floats and does not fall.
2. **US1 – Flight**: click, touch or press space → the game starts with a flap. With no input,
   the bird falls to the ground and the game ends.
3. **US1 – Obstacles**: rock pillars appear every ~1.5 s with gaps at different heights.
4. **US2 – Score**: pass 3 pairs → the score shows 3.
5. **US1 – Collision**: hit a pillar → the game stops right away.
6. **US3 – End screen**: shows the score and the best score; clicking right away does nothing;
   after ~0.5 s, a single click starts a new game right away with score 0.
7. **Best score**: beat the best score, reload the page (F5) → the best score is kept.
8. **Pause**: during a game, switch tabs and come back → the game is paused with the score still
   visible; clicking resumes it without a jump.
9. **Screen size**: resize the window or open in phone mode (DevTools) → the game area keeps its
   proportion and stays centered.
10. **Fluidity**: in DevTools → Performance/FPS, the game stays close to 60 FPS (SC-003).
