# TapBird

Jogo de "toque para voar" feito **para estudo** (MVP). Um pássaro turquesa atravessa um cânion
ao pôr do sol desviando de pilares de rocha. Toda a arte é desenhada por código.

## Como rodar

Precisa do Node.js 18+. Não há dependências para instalar.

```powershell
npm start
```

Abra <http://localhost:8080>. Para obstáculos sempre iguais: <http://localhost:8080/?seed=42>.

**Controles**: toque, clique ou espaço (ou seta para cima).

## Como testar

```powershell
npm test
```

## Ajustando a física

Todas as constantes (gravidade, impulso, velocidade, tamanho da passagem…) estão em
[src/config.js](src/config.js).

## Mapa dos módulos

| Arquivo | O que faz | Usa DOM? |
|---|---|---|
| `src/config.js` | Constantes do jogo | não |
| `src/rng.js` | Números aleatórios com semente (mulberry32) | não |
| `src/bird.js` | Física do pássaro (gravidade e impulso) | não |
| `src/obstacles.js` | Geração e movimento dos pilares | não |
| `src/collision.js` | Colisão círculo × retângulo e limites | não |
| `src/game.js` | Máquina de estados e loop de passo fixo (`advance`) | não |
| `src/storage.js` | Recorde salvo no navegador | sim |
| `src/render.js` | Desenho do cenário, pássaro e telas | sim |
| `src/input.js` | Toque, clique, teclado e pausa automática | sim |
| `src/main.js` | Escala da tela e loop com `requestAnimationFrame` | sim |

Os módulos sem DOM são testados em `tests/` com o test runner nativo do Node.

Especificação e decisões de design: [specs/001-tap-to-fly-game/](specs/001-tap-to-fly-game/).
