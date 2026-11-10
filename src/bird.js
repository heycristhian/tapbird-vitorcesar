// O pássaro: posição, velocidade e física (gravidade + impulso).
import {
  BIRD_X, BIRD_START_Y, BIRD_RADIUS, GRAVITY, FLAP_VELOCITY, MAX_FALL_SPEED,
} from './config.js';

export function createBird() {
  return {
    x: BIRD_X,
    y: BIRD_START_Y,
    vy: 0, // velocidade vertical (positiva = para baixo)
    radius: BIRD_RADIUS,
    flapTime: Infinity, // tempo desde o último impulso (só para animar a asa)
  };
}

/** Impulso para cima: substitui a velocidade atual (não soma). */
export function flap(bird) {
  bird.vy = FLAP_VELOCITY;
  bird.flapTime = 0;
}

/** Avança a física em `dt` segundos: primeiro a velocidade, depois a posição. */
export function updateBird(bird, dt) {
  bird.vy = Math.min(bird.vy + GRAVITY * dt, MAX_FALL_SPEED);
  bird.y += bird.vy * dt;
  bird.flapTime += dt;
}
