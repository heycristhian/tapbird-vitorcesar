import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/rng.js';

const take = (rng, n) => Array.from({ length: n }, () => rng());

test('mesma semente gera a mesma sequência', () => {
  assert.deepEqual(take(createRng(42), 100), take(createRng(42), 100));
});

test('sementes diferentes geram sequências diferentes', () => {
  assert.notDeepEqual(take(createRng(1), 100), take(createRng(2), 100));
});

test('valores ficam em [0, 1)', () => {
  for (const v of take(createRng(123), 1000)) {
    assert.ok(v >= 0 && v < 1, `valor fora do intervalo: ${v}`);
  }
});
