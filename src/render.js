// Desenho de tudo na tela. Toda a arte é feita por código (sem imagens externas).
// Usa apenas coordenadas lógicas (400 x 600); a escala é aplicada em main.js.
import {
  WIDTH, HEIGHT, GROUND_Y, FLAP_VELOCITY, MAX_FALL_SPEED, RESTART_DELAY,
} from './config.js';
import { obstacleRects } from './obstacles.js';

// Silhuetas do cânion: lista de [largura, altura] de cada platô, repetida em loop.
const FAR_CANYON = [[70, 150], [50, 110], [90, 185], [60, 125], [80, 165], [55, 100]];
const NEAR_CANYON = [[95, 80], [60, 120], [80, 65], [110, 105], [70, 140]];

const COLORS = {
  farCanyon: '#8a3b4a',
  nearCanyon: '#5e2338',
  sand: '#d9a35f',
  sandEdge: '#b97f3e',
  sandStripe: '#c98f4f',
  rock: '#b5532f',
  rockStrata: '#9c4428',
  rockCap: '#7a3320',
  rockOutline: '#5a2414',
  bird: '#2ec4b6',
  birdOutline: '#1b7f76',
  birdBelly: '#c9f2ec',
  birdWing: '#23a596',
  beak: '#ff9f1c',
  beakOutline: '#c46d00',
  text: '#fff4d6',
  textOutline: '#3b1f4a',
  highlight: '#ffd27a',
};

export function render(ctx, game) {
  drawBackground(ctx, game.scroll);
  drawObstacles(ctx, game.obstacles);
  drawGround(ctx, game.scroll);
  drawBird(ctx, game.bird, game.state, game.time);

  if (game.state === 'ready') drawReadyScreen(ctx, game);
  if (game.state === 'playing') drawScore(ctx, game.score);
  if (game.state === 'paused') drawPausedScreen(ctx, game);
  if (game.state === 'over') drawGameOverScreen(ctx, game);
}

// ---------- Cenário ----------

function drawBackground(ctx, scroll) {
  // Céu de pôr do sol.
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#3b1f4a');
  sky.addColorStop(0.45, '#b8475a');
  sky.addColorStop(0.75, '#f08a4b');
  sky.addColorStop(1, '#ffd27a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, GROUND_Y);

  // Sol baixo no horizonte.
  ctx.fillStyle = 'rgba(255, 232, 163, 0.9)';
  ctx.beginPath();
  ctx.arc(WIDTH * 0.7, GROUND_Y - 110, 48, 0, Math.PI * 2);
  ctx.fill();

  // Duas camadas de cânion com paralaxe (a mais distante anda mais devagar).
  drawCanyonLayer(ctx, FAR_CANYON, scroll * 0.2, COLORS.farCanyon);
  drawCanyonLayer(ctx, NEAR_CANYON, scroll * 0.5, COLORS.nearCanyon);
}

function drawCanyonLayer(ctx, segments, offset, color) {
  const tileWidth = segments.reduce((sum, [w]) => sum + w, 0);
  let x = -(offset % tileWidth) - tileWidth;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, GROUND_Y);
  while (x < WIDTH + tileWidth) {
    for (const [w, h] of segments) {
      const top = GROUND_Y - h;
      // Platô de topo plano com encostas inclinadas.
      ctx.lineTo(x + 10, top);
      ctx.lineTo(x + w - 10, top);
      x += w;
    }
  }
  ctx.lineTo(x, GROUND_Y);
  ctx.closePath();
  ctx.fill();
}

function drawGround(ctx, scroll) {
  ctx.fillStyle = COLORS.sand;
  ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);

  // Faixas diagonais que rolam na mesma velocidade dos pilares.
  const spacing = 24;
  const offset = scroll % spacing;
  ctx.fillStyle = COLORS.sandStripe;
  for (let x = -offset - spacing; x < WIDTH + 30; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 6);
    ctx.lineTo(x + 10, GROUND_Y + 6);
    ctx.lineTo(x - 10, HEIGHT);
    ctx.lineTo(x - 20, HEIGHT);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = COLORS.sandEdge;
  ctx.fillRect(0, GROUND_Y, WIDTH, 6);
}

// ---------- Pilares ----------

function drawObstacles(ctx, obstacles) {
  for (const pair of obstacles) {
    const [top, bottom] = obstacleRects(pair);
    drawPillar(ctx, top, true);
    drawPillar(ctx, bottom, false);
  }
}

function drawPillar(ctx, rect, isTop) {
  if (rect.h <= 0) return;
  const CAP_HEIGHT = 8;
  const CAP_OVERHANG = 4;

  ctx.fillStyle = COLORS.rock;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

  // Estratos horizontais da rocha (posições fixas no mundo).
  ctx.fillStyle = COLORS.rockStrata;
  for (let y = Math.ceil(rect.y / 18) * 18 + 10; y < rect.y + rect.h; y += 18) {
    ctx.fillRect(rect.x, y, rect.w, 3);
  }

  ctx.strokeStyle = COLORS.rockOutline;
  ctx.lineWidth = 2;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

  // "Capitel" mais largo na ponta voltada para a passagem.
  const capY = isTop ? rect.y + rect.h - CAP_HEIGHT : rect.y;
  ctx.fillStyle = COLORS.rockCap;
  ctx.fillRect(rect.x - CAP_OVERHANG, capY, rect.w + CAP_OVERHANG * 2, CAP_HEIGHT);
  ctx.strokeRect(rect.x - CAP_OVERHANG, capY, rect.w + CAP_OVERHANG * 2, CAP_HEIGHT);
}

// ---------- Pássaro ----------

function drawBird(ctx, bird, state, time) {
  // Inclina conforme a velocidade: -25° subindo até +70° caindo.
  let angleDeg = 0;
  if (state !== 'ready') {
    const t = (bird.vy - FLAP_VELOCITY) / (MAX_FALL_SPEED - FLAP_VELOCITY);
    angleDeg = -25 + Math.max(0, Math.min(1, t)) * 95;
  }
  const r = bird.radius;

  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate((angleDeg * Math.PI) / 180);

  // Corpo.
  ctx.fillStyle = COLORS.bird;
  ctx.strokeStyle = COLORS.birdOutline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Barriga.
  ctx.fillStyle = COLORS.birdBelly;
  ctx.beginPath();
  ctx.ellipse(2, 5, r * 0.6, r * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Asa: abre logo após o impulso (ou bate devagar na tela de início).
  const wingUp = state === 'ready' ? Math.sin(time * 10) > 0 : bird.flapTime < 0.15;
  ctx.fillStyle = COLORS.birdWing;
  ctx.strokeStyle = COLORS.birdOutline;
  ctx.beginPath();
  ctx.ellipse(-4, 1, 8, 5, wingUp ? -0.7 : 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Olho.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(5, -5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1020';
  ctx.beginPath();
  ctx.arc(6.5, -5, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Bico.
  ctx.fillStyle = COLORS.beak;
  ctx.strokeStyle = COLORS.beakOutline;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(r - 2, -1);
  ctx.lineTo(r + 9, 2);
  ctx.lineTo(r - 2, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// ---------- Textos e telas ----------

function drawText(ctx, text, x, y, size, fill = COLORS.text) {
  ctx.font = `bold ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(3, size / 8);
  ctx.strokeStyle = COLORS.textOutline;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

function drawScore(ctx, score) {
  drawText(ctx, String(score), WIDTH / 2, 70, 48, '#ffffff');
}

function drawReadyScreen(ctx, game) {
  drawText(ctx, 'TapBird', WIDTH / 2, 150, 56);
  drawText(ctx, 'Toque, clique ou pressione', WIDTH / 2, 380, 18);
  drawText(ctx, 'espaço para voar', WIDTH / 2, 405, 18);
  if (game.best > 0) drawText(ctx, `Recorde: ${game.best}`, WIDTH / 2, 450, 20, COLORS.highlight);
}

function drawPausedScreen(ctx, game) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawScore(ctx, game.score);
  drawText(ctx, 'Pausado', WIDTH / 2, 280, 36);
  drawText(ctx, 'toque para continuar', WIDTH / 2, 320, 18);
}

function drawGameOverScreen(ctx, game) {
  ctx.fillStyle = 'rgba(26, 16, 32, 0.6)';
  ctx.fillRect(60, 170, WIDTH - 120, 240);

  drawText(ctx, 'Fim de jogo', WIDTH / 2, 215, 36);
  drawText(ctx, `Pontos: ${game.score}`, WIDTH / 2, 265, 24);
  drawText(ctx, `Recorde: ${game.best}`, WIDTH / 2, 300, 24);
  if (game.newBest) drawText(ctx, 'Novo recorde!', WIDTH / 2, 338, 20, COLORS.highlight);
  if (game.overTime >= RESTART_DELAY) {
    drawText(ctx, 'Toque para jogar de novo', WIDTH / 2, 380, 18);
  }
}
