import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createObstacle, updateObstacles, obstacleRects } from '../src/obstacles.js';
import { createRng } from '../src/rng.js';
import { WIDTH, PIPE_WIDTH, PIPE_SPEED, GAP_SIZE, GAP_MARGIN, GROUND_Y } from '../src/config.js';

test('createObstacle nasce na borda direita com a passagem dentro das margens', () => {
  const rng = createRng(7);
  for (let i = 0; i < 1000; i++) {
    const pair = createObstacle(rng);
    assert.equal(pair.x, WIDTH);
    assert.equal(pair.width, PIPE_WIDTH);
    assert.equal(pair.gapSize, GAP_SIZE);
    assert.equal(pair.scored, false);
    assert.ok(pair.gapY >= GAP_MARGIN && pair.gapY <= GROUND_Y - GAP_MARGIN, `gapY ${pair.gapY}`);
  }
});

test('mesma semente gera as mesmas passagens', () => {
  const a = createRng(99);
  const b = createRng(99);
  for (let i = 0; i < 20; i++) {
    assert.equal(createObstacle(a).gapY, createObstacle(b).gapY);
  }
});

test('updateObstacles move para a esquerda e remove os que saíram da tela', () => {
  const rng = createRng(1);
  const visible = createObstacle(rng);
  const leaving = { ...createObstacle(rng), x: -PIPE_WIDTH + 1 };
  const list = updateObstacles([visible, leaving], 0.1);
  assert.equal(list.length, 1);
  assert.equal(list[0], visible);
  assert.equal(visible.x, WIDTH - PIPE_SPEED * 0.1);
});

test('obstacleRects retorna os retângulos de cima e de baixo', () => {
  const pair = { x: 50, gapY: 250, gapSize: GAP_SIZE, width: PIPE_WIDTH, scored: false };
  const [top, bottom] = obstacleRects(pair);
  assert.deepEqual(top, { x: 50, y: 0, w: PIPE_WIDTH, h: 250 - GAP_SIZE / 2 });
  assert.deepEqual(bottom, {
    x: 50,
    y: 250 + GAP_SIZE / 2,
    w: PIPE_WIDTH,
    h: GROUND_Y - (250 + GAP_SIZE / 2),
  });
});
