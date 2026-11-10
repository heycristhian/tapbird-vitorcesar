// Recorde salvo no próprio dispositivo. Se o armazenamento estiver bloqueado,
// o recorde vale só para a sessão atual (fica em memória).
const KEY = 'tapbird.best';
let sessionBest = 0;

export function loadBest() {
  try {
    const value = parseInt(localStorage.getItem(KEY), 10);
    if (Number.isInteger(value) && value >= 0) sessionBest = value;
  } catch {
    // armazenamento indisponível: segue com o valor em memória
  }
  return sessionBest;
}

export function saveBest(n) {
  sessionBest = n;
  try {
    localStorage.setItem(KEY, String(n));
  } catch {
    // armazenamento indisponível: o recorde fica só nesta sessão
  }
}
