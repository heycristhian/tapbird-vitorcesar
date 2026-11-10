// Detecção de colisão: o pássaro é um círculo, os pilares são retângulos.
import { GROUND_Y } from './config.js';
import { obstacleRects } from './obstacles.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * Círculo × retângulo: acha o ponto do retângulo mais próximo do centro do círculo
 * e compara a distância com o raio (tocar conta como colisão).
 */
export function circleRectHit(cx, cy, r, rect) {
  const nearestX = clamp(cx, rect.x, rect.x + rect.w);
  const nearestY = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy <= r * r; // compara ao quadrado para evitar Math.sqrt
}

/** O pássaro tocou o teto ou o chão? */
export function hitsBounds(bird) {
  return bird.y - bird.radius <= 0 || bird.y + bird.radius >= GROUND_Y;
}

/** O pássaro colidiu com os limites ou com algum pilar? */
export function birdCollides(bird, obstacles) {
  if (hitsBounds(bird)) return true;
  return obstacles.some((pair) =>
    obstacleRects(pair).some((rect) => circleRectHit(bird.x, bird.y, bird.radius, rect)),
  );
}
