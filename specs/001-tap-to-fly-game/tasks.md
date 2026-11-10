---

description: "Lista de tarefas do MVP TapBird"
---

# Tasks: Jogo "Toque para Voar" (MVP TapBird)

**Input**: Documentos de design em `specs/001-tap-to-fly-game/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: INCLUÍDOS. A constituição (princípio IV) exige testes automatizados de colisão e
pontuação, e a spec pede reprodutibilidade (FR-014, SC-006). Testes usam `node --test` +
`node:assert`, importando apenas módulos puros (sem DOM). Escreva os testes de cada história
antes da implementação e confirme que falham.

**Organization**: Tarefas agrupadas por história de usuário; cada fase termina com o jogo
executável (princípio V).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependências pendentes)
- **[Story]**: história de usuário (US1, US2, US3)
- Caminhos relativos à raiz do repositório (projeto único estático)

**Referências obrigatórias**: constantes e valores em
[research.md](./research.md#initial-gameplay-constants-adjustable-in-configjs); assinaturas em
[contracts/game-logic.md](./contracts/game-logic.md); telas e controles em
[contracts/player-controls.md](./contracts/player-controls.md); estados e regras em
[data-model.md](./data-model.md).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Estrutura do projeto, sem dependências npm

- [X] T001 Criar `package.json` na raiz com `"name": "tapbird"`, `"private": true`, `"type": "module"`, scripts `"start": "node serve.js"` e `"test": "node --test tests/"`, e nenhuma dependência
- [X] T002 [P] Criar `serve.js` na raiz: servidor estático usando apenas `node:http`, `node:fs` e `node:path`, porta 8080 (ou `process.env.PORT`), servindo arquivos da raiz com MIME correto para `.html`, `.js`, `.css`, `.json`, `.svg`, `.png`; `/` → `index.html`; bloquear path traversal (`..`); 404 para inexistentes; logar a URL `http://localhost:8080` ao iniciar
- [X] T003 [P] Criar `index.html` na raiz: `lang="pt-BR"`, viewport meta com `width=device-width, initial-scale=1, user-scalable=no`, título "TapBird", link para `style.css`, um `<canvas id="game">` e `<script type="module" src="src/main.js">`
- [X] T004 [P] Criar `style.css` na raiz: `html, body` com margem 0, altura 100%, `overflow: hidden`, fundo escuro (#1a1020), canvas centralizado (flex), `touch-action: none` e `user-select: none` no canvas

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Constantes, PRNG, estado base da partida, loop de passo fixo e cenário rolando

**⚠️ CRITICAL**: Nenhuma história começa antes desta fase

- [X] T005 [P] Criar `src/config.js` exportando as constantes nomeadas: `WIDTH = 400`, `HEIGHT = 600`, `GROUND_HEIGHT = 80`, `GRAVITY = 1500`, `FLAP_VELOCITY = -420`, `MAX_FALL_SPEED = 600`, `BIRD_X = 110`, `BIRD_RADIUS = 14`, `PIPE_SPEED = 150`, `PIPE_WIDTH = 64`, `GAP_SIZE = 150`, `GAP_MARGIN = 90`, `SPAWN_INTERVAL = 1.5`, `RESTART_DELAY = 0.5`, `FIXED_DT = 1 / 120`, `MAX_FRAME_DT = 0.25`, `BIRD_START_Y = HEIGHT / 2 - 40`, `IDLE_BOB_AMPLITUDE = 6`, `IDLE_BOB_SPEED = 4`, e o derivado `GROUND_Y = HEIGHT - GROUND_HEIGHT`; comentar cada um com unidade
- [X] T006 [P] Criar `tests/rng.test.js`: mesma semente gera as mesmas 100 sequências; sementes diferentes geram sequências diferentes; todos os valores em [0, 1)
- [X] T007 [P] Criar `src/rng.js` com `createRng(seed)` implementando mulberry32 (retorna função `() => number` em [0, 1)), com comentários explicando o algoritmo
- [X] T008 Criar `src/game.js` com `createGame({ seed, best = 0 })` retornando o objeto Game do data-model (`state: 'ready'`, `bird: null` por enquanto, `obstacles: []`, `score: 0`, `best`, `newBest: false`, `spawnTimer: 0`, `overTime: 0`, `scroll: 0`, `time: 0`, `rng: createRng(seed)`); `step(game, dt)` que, exceto em `'paused'`, incrementa `game.time += dt` e, exceto em `'paused'` e `'over'`, incrementa `game.scroll += PIPE_SPEED * dt`, retornando `{ scored: false, died: false }`; e `advance(game, frameDt, acc)` que faz `acc += min(frameDt, MAX_FRAME_DT)`, chama `step(game, FIXED_DT)` enquanto `acc >= FIXED_DT` (subtraindo `FIXED_DT`) e retorna `{ acc, died }` onde `died` é true se algum `step` retornou `died` (depende de T005, T007)
- [X] T009 [P] Criar `src/render.js` com `render(ctx, game)` que chama `drawBackground(ctx, game.scroll)`: céu em gradiente de pôr do sol (topo roxo #3b1f4a → laranja #f08a4b → amarelo #ffd27a perto do horizonte), sol semicircular, duas camadas de silhuetas de cânion com paralaxe (0.2× e 0.5× do `scroll`, repetidas horizontalmente, formas de platôs geradas deterministicamente sem PRNG de jogo), e chão de areia (#d9a35f) em `GROUND_Y` com faixas diagonais rolando a 1× do `scroll`; usar apenas coordenadas lógicas de `config.js` (depende de T005)
- [X] T010 Criar `src/main.js`: ler `?seed=` da URL (inteiro; senão `Date.now()`), criar o jogo, dimensionar o canvas para caber na janela mantendo proporção 400:600 (letterbox, centralizado) considerando `devicePixelRatio` via `ctx.setTransform`, refazer no `resize`; loop com `requestAnimationFrame` que calcula `frameDt = (now - last)/1000`, chama `({ acc } = advance(game, frameDt, acc))` (sem lógica de acumulador própria em `main.js`) e depois `render(ctx, game)` (depende de T008, T009)

**Checkpoint**: `npm start` abre o cenário do cânion rolando suavemente; `npm test` passa em `rng.test.js`

---

## Phase 3: User Story 1 - Voar e desviar de obstáculos (Priority: P1) 🎯 MVP

**Goal**: Pássaro com gravidade e impulso, pilares gerados continuamente, colisão encerra a partida

**Independent Test**: Iniciar, tocar repetidamente: o pássaro sobe e cai; pilares aparecem a
cada ~1.5 s com aberturas em alturas diferentes; encostar em pilar, chão ou teto encerra a partida

### Tests for User Story 1 ⚠️

> Escrever primeiro e confirmar que falham

- [X] T011 [P] [US1] Criar `tests/bird.test.js`: `createBird()` posiciona em `x = BIRD_X`, `y = BIRD_START_Y`, `vy = 0`; `flap` define `vy === FLAP_VELOCITY` para `vy` anterior positivo, negativo e zero; `updateBird` com um passo `dt` resulta em `vy === min(vy0 + GRAVITY·dt, MAX_FALL_SPEED)` e `y === y0 + vy·dt`; após muitos passos `vy` nunca passa de `MAX_FALL_SPEED`
- [X] T012 [P] [US1] Criar `tests/obstacles.test.js`: `createObstacle(rng)` retorna `x === WIDTH`, `width === PIPE_WIDTH`, `gapSize === GAP_SIZE`, `scored === false` e `GAP_MARGIN ≤ gapY ≤ GROUND_Y - GAP_MARGIN` para 1000 gerações; mesma semente gera os mesmos `gapY`; `updateObstacles` move `x` em `-PIPE_SPEED·dt` e remove pares com `x + width < 0`; `obstacleRects` retorna retângulo superior `{x, y: 0, w: width, h: gapY - gapSize/2}` e inferior `{x, y: gapY + gapSize/2, w: width, h: GROUND_Y - (gapY + gapSize/2)}`
- [X] T013 [P] [US1] Criar `tests/collision.test.js`: `circleRectHit` true para círculo dentro, tocando exatamente a borda e tocando um canto; false para círculo afastado e para o caso diagonal próximo do canto mas sem tocar; `hitsBounds` true quando `y - r ≤ 0` e quando `y + r ≥ GROUND_Y`, false no meio; `birdCollides` true contra pilar superior/inferior e false ao passar pelo centro da abertura
- [X] T014 [P] [US1] Criar `tests/game.test.js` (seção US1): `createGame({ seed: 1 })` começa em `'ready'`; em `'ready'`, `step` por 2 s mantém `|bird.y - BIRD_START_Y| ≤ IDLE_BOB_AMPLITUDE` e `game.time` ≈ 2; independência de FPS: dois jogos com a mesma semente, `action` no início, um avançado com `advance` em 60 quadros de 1/60 s e outro em 120 quadros de 1/120 s, terminam com `bird.y`, `bird.vy`, `obstacles` e `state` idênticos (tolerância 1e-9); `advance` com `frameDt = 5` avança no máximo `MAX_FRAME_DT`; `action` em `'ready'` → `'playing'` e `bird.vy === FLAP_VELOCITY`; sem ações em `'playing'`, simular com `FIXED_DT` até 3 s leva a `'over'` e `step` retorna `died: true` uma vez; após `SPAWN_INTERVAL` + ε em `'playing'` existe ao menos 1 obstáculo; duas partidas com mesma semente e mesmas ações produzem os mesmos `gapY`

### Implementation for User Story 1

- [X] T015 [P] [US1] Criar `src/bird.js` com `createBird()`, `flap(bird)` (define `vy = FLAP_VELOCITY`, zera `flapTime`) e `updateBird(bird, dt)` (`vy = min(vy + GRAVITY·dt, MAX_FALL_SPEED)`, `y += vy·dt`, `flapTime += dt`), campos conforme data-model (`x = BIRD_X`, `y = BIRD_START_Y`, `vy`, `radius`, `flapTime`)
- [X] T016 [P] [US1] Criar `src/obstacles.js` com `createObstacle(rng)` (`gapY = GAP_MARGIN + rng() * (GROUND_Y - 2·GAP_MARGIN)`), `updateObstacles(list, dt)` (move e filtra `x + width < 0`, retorna nova lista) e `obstacleRects(pair)`
- [X] T017 [P] [US1] Criar `src/collision.js` com `circleRectHit(cx, cy, r, rect)` (ponto mais próximo do retângulo, compara distância² ≤ r²), `hitsBounds(bird)` e `birdCollides(bird, obstacles)`
- [X] T018 [US1] Estender `src/game.js`: `createGame` usa `createBird()`; em `'ready'`, `step` faz o pássaro oscilar (`y = BIRD_START_Y + sin(game.time · IDLE_BOB_SPEED) · IDLE_BOB_AMPLITUDE`) sem gravidade; criar função interna `startPlaying(game)` que faz `state = 'playing'` + `flap` + `spawnTimer = SPAWN_INTERVAL`; `action(game)`: `'ready'` → `startPlaying`; `'playing'` → `flap`; `'over'` → reset (novo pássaro, `obstacles = []`, `score = 0`, mantendo `rng` e `best`) seguido de `startPlaying`, ou seja, uma única ação inicia a nova partida (SC-005) — o atraso de reinício entra na US3; `step` em `'playing'` na ordem: `updateBird` → decrementa `spawnTimer` e ao chegar ≤ 0 adiciona `createObstacle(rng)` e soma `SPAWN_INTERVAL` → `updateObstacles` → `birdCollides` ⇒ `state = 'over'`, retorna `died: true` (depende de T015–T017)
- [X] T019 [US1] Criar `src/input.js` com `bindInput(canvas, onAction, onPause)`: `pointerdown` no canvas → `onAction()` com `preventDefault`; `keydown` `Space`/`ArrowUp` com `!event.repeat` → `preventDefault` + `onAction()`; `onPause` fica sem uso até a fase de Polish
- [X] T020 [US1] Estender `src/render.js`: `drawObstacles(ctx, obstacles)` desenhando cada retângulo de `obstacleRects` como rocha laranja-avermelhada (#b5532f) com borda escura e "capitel" mais largo (#7a3320, 8 unidades de altura, 4 de saliência) na ponta voltada para a abertura, e textura de estratos horizontais; `drawBird(ctx, bird)` com corpo circular turquesa (#2ec4b6), barriga clara, olho branco com pupila, bico laranja (#ff9f1c) e asa cujo ângulo depende de `flapTime` (abre logo após o flap), rotacionando o corpo conforme `vy` (−25° subindo até +70° caindo); ordem: fundo → obstáculos → chão → pássaro (depende de T016)
- [X] T021 [US1] Integrar em `src/main.js`: `bindInput(canvas, () => action(game))` e garantir que `render` desenha obstáculos e pássaro (depende de T018–T020)

**Checkpoint**: Jogo jogável: voar, desviar, colidir e reiniciar com uma ação; `npm test` passa em bird, obstacles, collision e game (US1)

---

## Phase 4: User Story 2 - Pontuação (Priority: P2)

**Goal**: +1 ponto por par ultrapassado, contado uma única vez, sempre visível

**Independent Test**: Passar por N pares e verificar que o placar mostra N

### Tests for User Story 2 ⚠️

- [X] T022 [US2] Adicionar seção US2 em `tests/game.test.js`: partida começa com `score === 0`; inserir manualmente um par com `x` logo à frente do pássaro e `gapY` alinhado a `bird.y`, simular até `x + width < bird.x - bird.radius` mantendo o pássaro na abertura (chamando `flap` conforme necessário ou fixando `bird.y`/`vy`) ⇒ `score === 1` e `step` retornou `scored: true` exatamente uma vez; continuar simulando não aumenta o placar por esse par; após reset `score === 0`

### Implementation for User Story 2

- [X] T023 [US2] Estender `step` em `src/game.js`: após `updateObstacles`, para cada par com `!scored && x + width < bird.x - bird.radius`, marcar `scored = true`, `score += 1`, e retornar `scored: true` (checagem de pontuação antes da colisão, conforme contrato)
- [X] T024 [US2] Estender `src/render.js` com `drawScore(ctx, score)`: número grande centralizado no topo (y ≈ 70), fonte bold sans-serif 48px, preenchimento branco com contorno escuro de 4px, visível nos estados `'playing'` e `'paused'`

**Checkpoint**: US1 + US2 funcionando; placar correto ao passar pelos pilares

---

## Phase 5: User Story 3 - Telas de início e de fim de jogo (Priority: P3)

**Goal**: Tela de início com instrução; tela de fim com pontuação, recorde salvo e reinício com atraso

**Independent Test**: Abrir → tela de início; ação → joga; colidir → tela de fim com placar e
recorde; clicar antes de 0.5 s não faz nada; depois uma única ação inicia nova partida;
recarregar mantém o recorde

### Tests for User Story 3 ⚠️

- [X] T025 [US3] Adicionar seção US3 em `tests/game.test.js`: `createGame({ seed: 1, best: 5 })` tem `best === 5`; ao morrer com `score` 7, `best === 7` e `newBest === true`; ao morrer com `score` 3 e `best` 5, `best === 5` e `newBest === false`; `action` em `'over'` com `overTime < RESTART_DELAY` mantém `'over'`; após `step` acumulando ≥ `RESTART_DELAY`, `action` → `'playing'` direto (sem passar por `'ready'`) com `score === 0`, `obstacles.length === 0`, `bird.vy === FLAP_VELOCITY`, `best` preservado e `newBest === false`

### Implementation for User Story 3

- [X] T026 [P] [US3] Criar `src/storage.js` com `loadBest()` (lê `localStorage.getItem('tapbird.best')`, converte para inteiro ≥ 0; inválido/ausente → 0) e `saveBest(n)` (grava string); ambos em `try/catch`, mantendo valor em variável de módulo como fallback de sessão
- [X] T027 [US3] Estender `src/game.js`: ao colidir em `'playing'`, `overTime = 0`, se `score > best` então `best = score` e `newBest = true`; `step` em `'over'` incrementa `overTime` (sem mover nada); `action` em `'over'` só reinicia (reset + `startPlaying`) se `overTime >= RESTART_DELAY`; reset zera `newBest`
- [X] T028 [US3] Estender `src/render.js` com telas conforme [contracts/player-controls.md](./contracts/player-controls.md): `'ready'` → título "TapBird" grande, "Toque, clique ou pressione espaço para voar" e "Recorde: N" se `best > 0`; `'over'` → painel central semitransparente com "Fim de jogo", "Pontos: N", "Recorde: N", "Novo recorde!" se `newBest`, e "Toque para jogar de novo" apenas quando `overTime >= RESTART_DELAY`; o placar grande (`drawScore`) aparece em `'playing'` e `'paused'`
- [X] T029 [US3] Integrar em `src/main.js`: `createGame({ seed, best: loadBest() })` e, quando `step` retornar `died: true` e `game.newBest`, chamar `saveBest(game.best)` (depende de T026, T027)

**Checkpoint**: Ciclo completo início → partida → fim → reinício; recorde persiste após F5

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Pausa automática (FR-011), documentação e validação final

- [X] T030 Adicionar seção de pausa em `tests/game.test.js`: `pause` em `'playing'` → `'paused'`; `step` em `'paused'` não altera `bird.y`, obstáculos, `scroll` nem `time`; `action` em `'paused'` → `'playing'` sem alterar `bird.vy`; `pause` em `'ready'`/`'over'` não faz nada
- [X] T031 Implementar `pause(game)` e o tratamento de `'paused'` em `action`/`step` em `src/game.js`
- [X] T032 Estender `src/input.js`: `document` `visibilitychange` (quando `document.hidden`) e `window` `blur` → `onPause()`
- [X] T033 [P] Estender `src/render.js`: no estado `'paused'`, escurecer a tela (preto 40%), manter o placar visível e mostrar "Pausado — toque para continuar"
- [X] T034 Integrar em `src/main.js`: passar `() => pause(game)` para `bindInput`; ao voltar de aba oculta, reiniciar `last` do loop para não acumular tempo (depende de T031, T032)
- [X] T035 [P] Criar `README.md` na raiz em português: o que é o projeto (estudo, MVP), como rodar (`npm start`), como testar (`npm test`), `?seed=`, onde ajustar a física (`src/config.js`) e mapa curto dos módulos
- [ ] T036 Rodar `npm test` (tudo deve passar) e executar os 10 passos de validação manual de [quickstart.md](./quickstart.md); ajustar constantes em `src/config.js` se a dificuldade estiver injusta (SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup — bloqueia todas as histórias
- **US1 (Phase 3)**: depende da Foundational
- **US2 (Phase 4)**: depende da US1 (pontuação precisa de obstáculos e do pássaro em movimento)
- **US3 (Phase 5)**: depende da US1 (precisa de colisão para chegar em `'over'`); independente da US2, mas mostra `score` na tela de fim
- **Polish (Phase 6)**: depende das histórias desejadas

### Within Each Phase

- Testes antes da implementação (e devem falhar primeiro)
- Módulos puros (`bird`, `obstacles`, `collision`) antes de `game.js`
- `game.js` antes da integração em `main.js`
- Tarefas que editam o mesmo arquivo (`game.js`, `render.js`, `main.js`, `game.test.js`) são sequenciais

### Parallel Opportunities

- Setup: T002, T003, T004
- Foundational: T005, T006, T007, T009 (T009 só precisa de `config.js`)
- US1: testes T011–T014 juntos; depois módulos T015–T017 juntos
- US3: T026 (`storage.js`) em paralelo com T025
- Polish: T033 e T035 em paralelo com as demais

---

## Parallel Example: User Story 1

```text
# Testes da US1 juntos:
Task: "tests/bird.test.js"        (T011)
Task: "tests/obstacles.test.js"   (T012)
Task: "tests/collision.test.js"   (T013)
Task: "tests/game.test.js (US1)"  (T014)

# Módulos puros da US1 juntos:
Task: "src/bird.js"       (T015)
Task: "src/obstacles.js"  (T016)
Task: "src/collision.js"  (T017)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 (Setup) → Phase 2 (Foundational): cenário rolando
2. Phase 3 (US1): voo, pilares e colisão
3. **PARAR e VALIDAR**: jogar algumas partidas, `npm test`

### Incremental Delivery

1. Setup + Foundational → cenário animado
2. + US1 → jogo jogável (MVP)
3. + US2 → pontuação
4. + US3 → telas e recorde
5. + Polish → pausa, README, validação final

A cada passo o jogo continua rodando com `npm start` (princípio V).

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes
- Constantes sempre de `src/config.js`; nunca números mágicos espalhados (princípio II)
- Módulos de lógica não acessam `window`, `document`, `localStorage` nem relógio (contrato)
- Arte só por código, sem assets externos (princípio III)
