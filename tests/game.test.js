import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, action, pause, step, advance } from '../src/game.js';
import {
  FIXED_DT, FLAP_VELOCITY, SPAWN_INTERVAL, BIRD_START_Y, IDLE_BOB_AMPLITUDE, MAX_FRAME_DT,
  RESTART_DELAY, BIRD_X, PIPE_WIDTH, GAP_SIZE,
} from '../src/config.js';

/** Executa `step` por `seconds` segundos e devolve os resultados de cada passo. */
function run(game, seconds, beforeStep) {
  const results = [];
  const steps = Math.round(seconds / FIXED_DT);
  for (let i = 0; i < steps; i++) {
    if (beforeStep) beforeStep(game);
    results.push(step(game, FIXED_DT));
  }
  return results;
}

/** Mantém o pássaro vivo: parado na altura da passagem do próximo par (ajuda de teste). */
function keepAlive(game) {
  const bird = game.bird;
  const next = game.obstacles.find((p) => p.x + p.width >= bird.x - bird.radius);
  bird.y = next ? next.gapY : BIRD_START_Y;
  bird.vy = 0;
}

/** Leva o jogo até 'over' sem ações. */
function dieNow(game) {
  if (game.state === 'ready') action(game);
  run(game, 3);
  assert.equal(game.state, 'over');
}

describe('US1 – voar e desviar', () => {
  test('começa na tela de início', () => {
    const game = createGame({ seed: 1 });
    assert.equal(game.state, 'ready');
    assert.equal(game.score, 0);
  });

  test('na tela de início o pássaro só flutua', () => {
    const game = createGame({ seed: 1 });
    run(game, 2);
    assert.ok(Math.abs(game.bird.y - BIRD_START_Y) <= IDLE_BOB_AMPLITUDE);
    assert.ok(Math.abs(game.time - 2) < 1e-6);
    assert.equal(game.state, 'ready');
  });

  test('a primeira ação começa a partida com impulso', () => {
    const game = createGame({ seed: 1 });
    action(game);
    assert.equal(game.state, 'playing');
    assert.equal(game.bird.vy, FLAP_VELOCITY);
  });

  test('sem ações o pássaro cai e a partida termina uma única vez', () => {
    const game = createGame({ seed: 1 });
    action(game);
    const results = run(game, 3);
    assert.equal(game.state, 'over');
    assert.equal(results.filter((r) => r.died).length, 1);
  });

  test('obstáculos surgem após o intervalo', () => {
    const game = createGame({ seed: 1 });
    action(game);
    run(game, SPAWN_INTERVAL + 0.05, keepAlive);
    assert.ok(game.obstacles.length >= 1);
  });

  test('mesma semente e mesmas ações geram os mesmos obstáculos', () => {
    const a = createGame({ seed: 5 });
    const b = createGame({ seed: 5 });
    action(a);
    action(b);
    run(a, 6, keepAlive);
    run(b, 6, keepAlive);
    assert.ok(a.obstacles.length > 0);
    assert.deepEqual(a.obstacles.map((p) => p.gapY), b.obstacles.map((p) => p.gapY));
  });

  test('advance: mesmo resultado com 60 quadros de 1/60 s e 120 de 1/120 s', () => {
    const a = createGame({ seed: 3 });
    const b = createGame({ seed: 3 });
    action(a);
    action(b);
    let accA = 0;
    let accB = 0;
    for (let i = 0; i < 60; i++) ({ acc: accA } = advance(a, 1 / 60, accA));
    for (let i = 0; i < 120; i++) ({ acc: accB } = advance(b, 1 / 120, accB));
    assert.ok(Math.abs(a.bird.y - b.bird.y) < 1e-9);
    assert.ok(Math.abs(a.bird.vy - b.bird.vy) < 1e-9);
    assert.ok(Math.abs(a.time - b.time) < 1e-9);
    assert.equal(a.state, b.state);
    assert.deepEqual(a.obstacles, b.obstacles);
  });

  test('advance limita quadros muito longos', () => {
    const game = createGame({ seed: 1 });
    advance(game, 5, 0);
    assert.ok(game.time <= MAX_FRAME_DT + 1e-9);
  });
});

describe('US2 – pontuação', () => {
  test('cada par ultrapassado vale 1 ponto, contado uma vez', () => {
    const game = createGame({ seed: 1 });
    action(game);
    assert.equal(game.score, 0);

    game.spawnTimer = 1000; // impede novos pares durante o teste
    game.obstacles.push({
      x: BIRD_X + 20, gapY: BIRD_START_Y, gapSize: GAP_SIZE, width: PIPE_WIDTH, scored: false,
    });

    const results = run(game, 1.5, keepAlive);
    assert.equal(game.state, 'playing');
    assert.equal(game.score, 1);
    assert.equal(results.filter((r) => r.scored).length, 1);

    run(game, 1, keepAlive);
    assert.equal(game.score, 1);
  });

  test('a pontuação volta a 0 numa nova partida', () => {
    const game = createGame({ seed: 1 });
    action(game);
    game.score = 4;
    run(game, 3);
    run(game, RESTART_DELAY);
    action(game);
    assert.equal(game.score, 0);
  });
});

describe('US3 – telas e recorde', () => {
  test('o recorde inicial vem de createGame', () => {
    assert.equal(createGame({ seed: 1, best: 5 }).best, 5);
  });

  test('bater o recorde atualiza best e newBest', () => {
    const game = createGame({ seed: 1, best: 5 });
    action(game);
    game.score = 7;
    dieNow(game);
    assert.equal(game.best, 7);
    assert.equal(game.newBest, true);
  });

  test('sem bater o recorde, best não muda', () => {
    const game = createGame({ seed: 1, best: 5 });
    action(game);
    game.score = 3;
    dieNow(game);
    assert.equal(game.best, 5);
    assert.equal(game.newBest, false);
  });

  test('reinício só após o atraso e direto para uma nova partida', () => {
    const game = createGame({ seed: 1, best: 5 });
    action(game);
    game.score = 9;
    dieNow(game);
    game.overTime = 0;

    action(game);
    assert.equal(game.state, 'over', 'ação antes do atraso é ignorada');

    run(game, RESTART_DELAY);
    action(game);
    assert.equal(game.state, 'playing');
    assert.equal(game.score, 0);
    assert.equal(game.obstacles.length, 0);
    assert.equal(game.bird.vy, FLAP_VELOCITY);
    assert.equal(game.best, 9);
    assert.equal(game.newBest, false);
  });
});

describe('Pausa', () => {
  test('pause congela a partida e action retoma sem impulso', () => {
    const game = createGame({ seed: 1 });
    action(game);
    run(game, 0.2);
    pause(game);
    assert.equal(game.state, 'paused');

    const snapshot = JSON.stringify({
      y: game.bird.y, vy: game.bird.vy, obstacles: game.obstacles, scroll: game.scroll, time: game.time,
    });
    run(game, 1);
    assert.equal(
      JSON.stringify({
        y: game.bird.y, vy: game.bird.vy, obstacles: game.obstacles, scroll: game.scroll, time: game.time,
      }),
      snapshot,
    );

    const vyBefore = game.bird.vy;
    action(game);
    assert.equal(game.state, 'playing');
    assert.equal(game.bird.vy, vyBefore);
  });

  test('pause não faz nada fora de uma partida', () => {
    const ready = createGame({ seed: 1 });
    pause(ready);
    assert.equal(ready.state, 'ready');

    const over = createGame({ seed: 1 });
    dieNow(over);
    pause(over);
    assert.equal(over.state, 'over');
  });
});
