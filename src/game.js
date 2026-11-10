// Estado da partida e máquina de estados. Lógica pura: sem DOM e sem relógio.
//
//   ready ──ação──▶ playing ──colisão──▶ over ──ação (após RESTART_DELAY)──▶ playing
//                    │   ▲
//        blur/oculto ▼   │ ação (sem impulso)
//                   paused
import {
  PIPE_SPEED, SPAWN_INTERVAL, RESTART_DELAY, FIXED_DT, MAX_FRAME_DT,
  BIRD_START_Y, IDLE_BOB_AMPLITUDE, IDLE_BOB_SPEED,
} from './config.js';
import { createRng } from './rng.js';
import { createBird, flap, updateBird } from './bird.js';
import { createObstacle, updateObstacles } from './obstacles.js';
import { birdCollides } from './collision.js';

export function createGame({ seed = 0, best = 0 } = {}) {
  return {
    state: 'ready',
    bird: createBird(),
    obstacles: [],
    score: 0,
    best,
    newBest: false,
    spawnTimer: 0,
    overTime: 0,
    scroll: 0,
    time: 0,
    rng: createRng(seed),
  };
}

function startPlaying(game) {
  game.state = 'playing';
  flap(game.bird);
  game.spawnTimer = SPAWN_INTERVAL;
}

function resetRound(game) {
  game.bird = createBird();
  game.obstacles = [];
  game.score = 0;
  game.newBest = false;
  game.overTime = 0;
}

/** A única ação do jogador (toque, clique ou espaço). O efeito depende do estado. */
export function action(game) {
  switch (game.state) {
    case 'ready':
      startPlaying(game);
      break;
    case 'playing':
      flap(game.bird);
      break;
    case 'paused':
      game.state = 'playing'; // retoma sem impulso
      break;
    case 'over':
      if (game.overTime >= RESTART_DELAY) {
        resetRound(game);
        startPlaying(game);
      }
      break;
  }
}

/** Pausa a partida (só tem efeito durante 'playing'). */
export function pause(game) {
  if (game.state === 'playing') game.state = 'paused';
}

/** Avança exatamente `dt` segundos de lógica. */
export function step(game, dt) {
  const result = { scored: false, died: false };
  if (game.state === 'paused') return result;

  game.time += dt;

  if (game.state === 'over') {
    game.overTime += dt;
    return result;
  }

  game.scroll += PIPE_SPEED * dt;

  if (game.state === 'ready') {
    // Flutua suavemente, sem gravidade, enquanto espera a primeira ação.
    game.bird.y = BIRD_START_Y + Math.sin(game.time * IDLE_BOB_SPEED) * IDLE_BOB_AMPLITUDE;
    return result;
  }

  // --- playing ---
  const bird = game.bird;
  updateBird(bird, dt);

  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0) {
    game.obstacles.push(createObstacle(game.rng));
    game.spawnTimer += SPAWN_INTERVAL;
  }
  game.obstacles = updateObstacles(game.obstacles, dt);

  for (const pair of game.obstacles) {
    if (!pair.scored && pair.x + pair.width < bird.x - bird.radius) {
      pair.scored = true;
      game.score += 1;
      result.scored = true;
    }
  }

  if (birdCollides(bird, game.obstacles)) {
    game.state = 'over';
    game.overTime = 0;
    if (game.score > game.best) {
      game.best = game.score;
      game.newBest = true;
    }
    result.died = true;
  }

  return result;
}

/**
 * Acumulador de passo fixo: recebe o tempo real do quadro e executa quantos
 * passos de FIXED_DT couberem. Assim a física é igual em 30, 60 ou 144 Hz.
 */
export function advance(game, frameDt, acc) {
  acc += Math.min(Math.max(frameDt, 0), MAX_FRAME_DT);
  let died = false;
  while (acc >= FIXED_DT) {
    if (step(game, FIXED_DT).died) died = true;
    acc -= FIXED_DT;
  }
  return { acc, died };
}
