// Entrada do jogador: toque/clique, teclado e perda de foco.
// Todas as entradas viram uma única "ação" (onAction).

export function bindInput(canvas, onAction, onPause) {
  // Pointer Events cobrem mouse e toque com o mesmo código.
  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    onAction();
  });

  window.addEventListener('keydown', (event) => {
    if (event.code !== 'Space' && event.code !== 'ArrowUp') return;
    event.preventDefault(); // evita rolar a página
    if (!event.repeat) onAction(); // ignora a repetição automática de tecla segurada
  });

  // Pausa automática ao trocar de aba ou a janela perder o foco.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) onPause();
  });
  window.addEventListener('blur', onPause);
}
