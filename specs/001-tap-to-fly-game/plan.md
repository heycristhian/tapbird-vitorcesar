# Implementation Plan: Jogo "Toque para Voar" (MVP TapBird)

**Branch**: `001-tap-to-fly-game` | **Date**: 2026-11-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-tap-to-fly-game/spec.md`

## Summary

Jogo de "toque para voar" no navegador: um pássaro original desvia de pilares de rocha num
cânion ao pôr do sol, com pontuação, recorde local e telas de início/fim. Abordagem técnica:
JavaScript puro com ES modules e Canvas 2D, sem dependências; lógica pura (física, obstáculos,
colisão, máquina de estados) separada de renderização/input; loop com passo fixo de 1/120 s;
testes com o runner nativo do Node (`node --test`); servidor estático mínimo em Node para rodar
com um comando.

## Technical Context

**Language/Version**: JavaScript ES2020+ (ES modules nativos), sem transpilação

**Primary Dependencies**: nenhuma (Canvas 2D, Pointer Events, localStorage nativos)

**Storage**: `localStorage` (chave `tapbird.best`) com fallback em memória

**Testing**: `node --test` + `node:assert` (Node 18.20 instalado)

**Target Platform**: navegadores modernos (Chrome, Edge, Firefox) em desktop e celular

**Project Type**: jogo web estático (single project)

**Performance Goals**: 60 FPS em computador comum; resposta ao input < 100 ms

**Constraints**: sem backend; sem assets externos (arte desenhada por código); roda com um
comando (`npm start`); física independente de taxa de quadros

**Scale/Scope**: 1 jogador, ~10 módulos pequenos, ~600–800 linhas no total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Escopo de MVP | Apenas personagem, obstáculos, colisão, pontuação e telas início/fim (+ recorde local e pausa, que servem ao ciclo). Sem rankings, contas, fases, sons obrigatórios. | ✅ |
| II. Simplicidade | Zero dependências; sem bundler; constantes centralizadas em `config.js`; funções puras e objetos simples, sem ECS/DI. | ✅ |
| III. Identidade original | Nome TapBird, cânion ao pôr do sol, pilares de rocha, pássaro geométrico próprio; tudo desenhado por código. | ✅ |
| IV. Loop determinístico e testável | Lógica sem DOM em módulos puros; passo fixo; PRNG com semente; testes de colisão/pontuação. | ✅ |
| V. Jogável a cada incremento | Ordem: base + pássaro/gravidade → input → obstáculos → colisão → pontuação → telas → polimento. | ✅ |
| Restrições técnicas | Roda local sem servidor de backend (o `serve.js` só entrega arquivos estáticos); teclado + mouse/toque; meta 60 FPS. | ✅ |

**Post-design re-check (após Fase 1)**: ✅ Todos os princípios continuam atendidos. O único
item a mais é `serve.js` (~30 linhas, sem dependências), necessário porque navegadores bloqueiam
ES modules via `file://`; não viola o princípio II (nenhuma dependência externa).

## Project Structure

### Documentation (this feature)

```text
specs/001-tap-to-fly-game/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas e constantes iniciais
├── data-model.md        # Entidades e máquina de estados
├── quickstart.md        # Como rodar e validar
├── contracts/
│   ├── game-logic.md    # API dos módulos de lógica pura
│   └── player-controls.md # Controles, telas e parâmetros de URL
└── tasks.md             # (gerado por /speckit-tasks)
```

### Source Code (repository root)

```text
index.html               # Canvas + carrega src/main.js como módulo
style.css                # Fundo, centralização, sem scroll
package.json             # "type": "module"; scripts start/test; sem dependências
serve.js                 # Servidor estático mínimo (node:http)

src/
├── config.js            # Constantes de jogo
├── rng.js               # PRNG mulberry32 com semente
├── bird.js              # Criação, flap e física do pássaro
├── obstacles.js         # Geração, movimento, remoção e retângulos dos pilares
├── collision.js         # Círculo×retângulo, limites
├── game.js              # Estado da partida e máquina de estados (action/pause/step)
├── storage.js           # Recorde em localStorage com try/catch
├── render.js            # Desenho do cenário, pássaro, HUD e telas
├── input.js             # Pointer, teclado, visibilidade/blur
└── main.js              # Escala, loop de passo fixo, integração

tests/
├── rng.test.js
├── bird.test.js
├── obstacles.test.js
├── collision.test.js
└── game.test.js
```

**Structure Decision**: projeto único estático na raiz. Módulos de lógica (`config`, `rng`,
`bird`, `obstacles`, `collision`, `game`) são puros e testados em Node; módulos com efeitos
colaterais (`storage`, `render`, `input`, `main`) ficam só no navegador.

## Complexity Tracking

Nenhuma violação da constituição a justificar.
