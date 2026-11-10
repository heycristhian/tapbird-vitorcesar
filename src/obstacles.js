// Pares de pilares de rocha: geração, movimento, remoção e retângulos de colisão.
import { WIDTH, PIPE_WIDTH, PIPE_SPEED, GAP_SIZE, GAP_MARGIN, GROUND_Y } from './config.js';

/** Cria um par na borda direita com a passagem em altura aleatória (dentro das margens). */
export function createObstacle(rng) {
  return {
    x: WIDTH,
    gapY: GAP_MARGIN + rng() * (GROUND_Y - 2 * GAP_MARGIN),
    gapSize: GAP_SIZE,
    width: PIPE_WIDTH,
    scored: false,
  };
}

/** Move os pares para a esquerda e devolve só os que ainda estão visíveis. */
export function updateObstacles(list, dt) {
  for (const pair of list) {
    pair.x -= PIPE_SPEED * dt;
  }
  return list.filter((pair) => pair.x + pair.width >= 0);
}

/** Retângulos [de cima, de baixo] de um par, usados para colisão e desenho. */
export function obstacleRects(pair) {
  const gapTop = pair.gapY - pair.gapSize / 2;
  const gapBottom = pair.gapY + pair.gapSize / 2;
  return [
    { x: pair.x, y: 0, w: pair.width, h: gapTop },
    { x: pair.x, y: gapBottom, w: pair.width, h: GROUND_Y - gapBottom },
  ];
}
