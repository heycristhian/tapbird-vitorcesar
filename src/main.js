// Ponto de entrada no navegador: escala da tela, loop e ligação entre os módulos.
import { WIDTH, HEIGHT } from './config.js';
import { createGame, action, pause, advance } from './game.js';
import { render } from './render.js';
import { bindInput } from './input.js';
import { loadBest, saveBest } from './storage.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// ?seed=123 na URL deixa os obstáculos sempre iguais (estudo/depuração).
const seedParam = parseInt(new URLSearchParams(location.search).get('seed'), 10);
const seed = Number.isFinite(seedParam) ? seedParam : Date.now();

const game = createGame({ seed, best: loadBest() });

/** Ajusta o canvas à janela mantendo a proporção 400:600 (com bordas se preciso). */
function resize() {
  const scale = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
  const cssWidth = Math.floor(WIDTH * scale);
  const cssHeight = Math.floor(HEIGHT * scale);
  const dpr = window.devicePixelRatio || 1;

  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);

  // Daqui em diante, desenhamos em coordenadas lógicas (400 x 600).
  ctx.setTransform(canvas.width / WIDTH, 0, 0, canvas.height / HEIGHT, 0, 0);
}
window.addEventListener('resize', resize);
resize();

bindInput(canvas, () => action(game), () => pause(game));

let last = performance.now();
let acc = 0;

// Ao voltar para a aba, não conta o tempo em que ela ficou oculta.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    last = performance.now();
    acc = 0;
  }
});

function frame(now) {
  const result = advance(game, (now - last) / 1000, acc);
  acc = result.acc;
  last = now;

  if (result.died && game.newBest) saveBest(game.best);

  render(ctx, game);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
