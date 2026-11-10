import { test } from 'node:test';
import assert from 'node:assert/strict';
import { circleRectHit, hitsBounds, birdCollides } from '../src/collision.js';
import { createBird } from '../src/bird.js';
import { GROUND_Y, GAP_SIZE, PIPE_WIDTH, BIRD_X } from '../src/config.js';

const rect = { x: 100, y: 100, w: 50, h: 80 };
const r = 10;

test('circleRectHit: círculo dentro do retângulo', () => {
  assert.equal(circleRectHit(120, 140, r, rect), true);
});

test('circleRectHit: tocando exatamente a borda conta como colisão', () => {
  assert.equal(circleRectHit(rect.x - r, 140, r, rect), true);
});

test('circleRectHit: tocando o canto', () => {
  assert.equal(circleRectHit(rect.x - r * 0.7, rect.y - r * 0.7, r, rect), true);
});

test('circleRectHit: perto do canto na diagonal, mas sem tocar', () => {
  assert.equal(circleRectHit(rect.x - r * 0.8, rect.y - r * 0.8, r, rect), false);
});

test('circleRectHit: círculo afastado', () => {
  assert.equal(circleRectHit(10, 10, r, rect), false);
});

test('hitsBounds detecta teto e chão', () => {
  const bird = createBird();
  bird.y = bird.radius;
  assert.equal(hitsBounds(bird), true, 'teto');
  bird.y = GROUND_Y - bird.radius;
  assert.equal(hitsBounds(bird), true, 'chão');
  bird.y = GROUND_Y / 2;
  assert.equal(hitsBounds(bird), false, 'meio');
});

test('birdCollides contra pilares e passando pela abertura', () => {
  const pair = { x: BIRD_X - PIPE_WIDTH / 2, gapY: 260, gapSize: GAP_SIZE, width: PIPE_WIDTH, scored: false };
  const bird = createBird();

  bird.y = 260;
  assert.equal(birdCollides(bird, [pair]), false, 'centro da abertura');

  bird.y = 260 - GAP_SIZE / 2; // na borda do pilar de cima
  assert.equal(birdCollides(bird, [pair]), true, 'pilar de cima');

  bird.y = 260 + GAP_SIZE / 2; // na borda do pilar de baixo
  assert.equal(birdCollides(bird, [pair]), true, 'pilar de baixo');
});
