# Research: Jogo "Toque para Voar" (MVP TapBird)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-11-10

Input from the user: "use javascript para rodar no navegador". No item in Technical Context was
left as NEEDS CLARIFICATION. The decisions below settle each technology choice.

## 1. Language and runtime

- **Decision**: Plain JavaScript (ES2020+) using native ES modules, running in a modern browser.
  No framework, no bundler, no transpiler.
- **Rationale**: This is what the user asked for. It also fits constitution principle II
  (minimal dependencies, readable code), and there is no build step that would hide how the game works.
- **Alternatives considered**: TypeScript (needs a build step, more friction for study);
  Phaser/PixiJS (an engine hides the game loop, which is the subject being studied).

## 2. Rendering

- **Decision**: Canvas 2D API with a fixed logical resolution of 400×600 units, scaled to fit the
  window while keeping the aspect ratio (letterbox) and centered.
- **Rationale**: Canvas 2D is enough for simple shapes and gradients. A fixed logical resolution
  keeps the difficulty the same on any screen size (spec edge case).
- **Alternatives considered**: DOM/CSS elements (awkward collision and frame timing);
  WebGL (too complex for an MVP).

## 3. Game loop and frame-rate independence (FR-013)

- **Decision**: `requestAnimationFrame` drives the loop. Logic advances in a **fixed timestep**
  of 1/120 s using an accumulator. The real elapsed time per frame is clamped to 0.25 s so the
  game does not "jump" after the tab was hidden.
- **Rationale**: A fixed timestep gives the same physics at 30, 60 or 144 Hz and makes the
  logic deterministic, so tests can replay it (principle IV).
- **Alternatives considered**: a variable delta passed straight to physics (simpler, but the
  results depend on the frame rate and are hard to test).

## 4. Seeded randomness (FR-014)

- **Decision**: A small PRNG, `mulberry32` (about 10 lines), created from a numeric seed. By
  default the seed comes from `Date.now()`; tests pass a fixed seed, and so does the URL with `?seed=123`.
- **Rationale**: `Math.random()` does not accept a seed. Mulberry32 is short, easy to understand
  and good enough for a game.
- **Alternatives considered**: a seedrandom library (an unnecessary dependency).

## 5. Collision

- **Decision**: The bird uses a circular hitbox; each pillar is a rectangle (AABB). The test is
  circle vs. rectangle (nearest point on the rectangle). The ceiling is `y - r <= 0`; the ground
  is `y + r >= groundY`.
- **Rationale**: A circle fits the bird's shape better, avoids unfair collisions at the corners,
  and the math stays simple and good for learning.
- **Alternatives considered**: AABB vs. AABB (unfair at the corners); pixel-perfect (complex).

## 6. Persisting the high score (FR-010)

- **Decision**: `localStorage` under the key `tapbird.best`. Every read and write is wrapped in
  `try/catch`; on failure the high score lives only in memory for the session.
- **Rationale**: Native, synchronous and enough for a single number. It covers the "storage
  blocked" edge case.

## 7. Input (FR-002)

- **Decision**: `pointerdown` on the canvas (covers mouse and touch) plus `keydown` for
  `Space`/`ArrowUp`, with `preventDefault` so the page does not scroll. Auto-repeat is ignored
  (`event.repeat`). All inputs feed one "action" handler.
- **Rationale**: Pointer Events unify mouse and touch, so there is no duplicated logic.

## 8. Pause (FR-011)

- **Decision**: Listen to `visibilitychange` and `blur`. While playing, switch to the `paused`
  state; the next action resumes the game (without applying a flap).

## 9. Automated tests (principle IV, SC-006)

- **Decision**: The built-in Node.js test runner (`node --test`, available in the installed Node
  18.20) with `node:assert`. Tests import the pure logic modules (which have no DOM access).
- **Rationale**: Zero dependencies to install; ES modules work with `"type": "module"` in
  `package.json`.
- **Alternatives considered**: Jest/Vitest (dependencies and configuration that are not needed).

## 10. Running locally (SC-007)

- **Decision**: A small static server written with Node's `http` module only (`serve.js`, about
  30 lines), started with `npm start` (equivalent to `node serve.js`) at `http://localhost:8080`.
- **Rationale**: Browsers block ES modules loaded over `file://`, so an HTTP server is needed.
  A server with no dependencies keeps "one command" (SC-007) and adds no packages. VS Code Live
  Server also works as an alternative.
- **Alternatives considered**: `npx serve` (downloads a package); classic non-module scripts
  (would work over `file://`, but lose clean imports for the tests).

## 11. Original art (FR-012, principle III)

- **Decision**: Everything is drawn in code:
  - a sky with a sunset gradient;
  - two layers of canyon silhouettes with parallax (speeds 0.2× and 0.5×);
  - a scrolling sand floor with stripes;
  - pillars of reddish-orange rock with a darker cap;
  - the bird: a turquoise circle body, a wing that changes angle when flapping, an eye, an orange
    beak, and a rotation that follows the vertical speed.
- **Rationale**: No external assets, no licensing problems, and the style is unique.

## Initial gameplay constants (adjustable in `config.js`)

| Constant | Value | Unit |
|---|---|---|
| Logical width × height | 400 × 600 | units |
| Ground height | 80 | units |
| Gravity | 1500 | units/s² |
| Flap velocity | -420 | units/s |
| Maximum fall speed | 600 | units/s |
| Bird radius / fixed X | 14 / 110 | units |
| Pillar speed | 150 | units/s |
| Pillar width | 64 | units |
| Gap size | 150 | units |
| Interval between pillars | 1.5 | s |
| Minimum margin of the gap center | 90 | units from top/ground |
| Restart delay | 0.5 | s |
| Fixed timestep | 1/120 | s |
| Maximum frame time (clamp) | 0.25 | s |
| Bird start Y | `HEIGHT / 2 - 40` (= 260) | units |
| Idle bob amplitude / speed | 6 / 4 | units / rad/s |
