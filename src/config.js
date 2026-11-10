// Constantes do jogo. Altere aqui para experimentar com a física e a dificuldade.
// Unidades: "u" = unidade lógica do mundo (a tela tem 400 x 600 u); tempo em segundos.

export const WIDTH = 400; // u — largura lógica do mundo
export const HEIGHT = 600; // u — altura lógica do mundo
export const GROUND_HEIGHT = 80; // u — altura da faixa de chão
export const GROUND_Y = HEIGHT - GROUND_HEIGHT; // u — linha onde começa o chão

export const GRAVITY = 1500; // u/s² — aceleração para baixo
export const FLAP_VELOCITY = -420; // u/s — velocidade vertical após um toque (negativo = sobe)
export const MAX_FALL_SPEED = 600; // u/s — limite da velocidade de queda

export const BIRD_X = 110; // u — posição horizontal fixa do pássaro
export const BIRD_RADIUS = 14; // u — raio da área de colisão do pássaro
export const BIRD_START_Y = HEIGHT / 2 - 40; // u — altura inicial do pássaro
export const IDLE_BOB_AMPLITUDE = 6; // u — amplitude da flutuação na tela de início
export const IDLE_BOB_SPEED = 4; // rad/s — velocidade da flutuação na tela de início

export const PIPE_SPEED = 150; // u/s — velocidade dos pilares (e da rolagem do chão)
export const PIPE_WIDTH = 64; // u — largura de cada pilar
export const GAP_SIZE = 150; // u — altura da passagem entre os pilares
export const GAP_MARGIN = 90; // u — distância mínima do centro da passagem ao topo/chão
export const SPAWN_INTERVAL = 1.5; // s — tempo entre pares de pilares

export const RESTART_DELAY = 0.5; // s — espera antes de aceitar o reinício
export const FIXED_DT = 1 / 120; // s — passo fixo da lógica
export const MAX_FRAME_DT = 0.25; // s — tempo máximo de um quadro (evita "saltos")
