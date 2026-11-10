import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBird, flap, updateBird } from '../src/bird.js';
import {
  BIRD_X, BIRD_START_Y, BIRD_RADIUS, FLAP_VELOCITY, GRAVITY, MAX_FALL_SPEED, FIXED_DT,
} from '../src/config.js';

test('createBird posiciona o pássaro parado na posição inicial', () => {
  const bird = createBird();
  assert.equal(bird.x, BIRD_X);
  assert.equal(bird.y, BIRD_START_Y);
  assert.equal(bird.vy, 0);
  assert.equal(bird.radius, BIRD_RADIUS);
});

test('flap substitui a velocidade, independente da anterior', () => {
  for (const vy0 of [300, -200, 0]) {
    const bird = createBird();
    bird.vy = vy0;
    flap(bird);
    assert.equal(bird.vy, FLAP_VELOCITY);
  }
});

test('updateBird aplica gravidade e depois a posição', () => {
  const bird = createBird();
  bird.vy = 100;
  const y0 = bird.y;
  updateBird(bird, FIXED_DT);
  const expectedVy = Math.min(100 + GRAVITY * FIXED_DT, MAX_FALL_SPEED);
  assert.equal(bird.vy, expectedVy);
  assert.equal(bird.y, y0 + expectedVy * FIXED_DT);
});

test('a velocidade de queda nunca passa do limite', () => {
  const bird = createBird();
  for (let i = 0; i < 600; i++) {
    updateBird(bird, FIXED_DT);
    assert.ok(bird.vy <= MAX_FALL_SPEED);
  }
  assert.equal(bird.vy, MAX_FALL_SPEED);
});
