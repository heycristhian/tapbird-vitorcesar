# Contract: Player controls and screens

## Inputs → "action"

| Input | Condition | Effect |
|---|---|---|
| `pointerdown` on the canvas (mouse or touch) | any | `action` |
| `keydown` `Space` or `ArrowUp` | `!event.repeat` | `action` (with `preventDefault`) |
| `visibilitychange` (hidden) or `blur` | state `playing` | `pause` |

## Screens

| State | What is shown |
|---|---|
| `ready` | Background in motion, floating bird, title "TapBird", the text "Toque, clique ou pressione espaço para voar", best score (if > 0). |
| `playing` | Large score centered at the top. |
| `paused` | Dimmed game + large score + "Pausado — toque para continuar". |
| `over` | "Fim de jogo", score, best score, "Novo recorde!" (if `newBest`), "Toque para jogar de novo" (shown only after `RESTART_DELAY`). |

## URL parameters

| Parameter | Effect |
|---|---|
| `?seed=<integer>` | Fixed seed for the obstacle generation (study/debugging). |
