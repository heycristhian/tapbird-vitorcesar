// Gerador de números pseudoaleatórios com semente (mulberry32).
// Math.random() não aceita semente; com este gerador, a mesma semente
// produz sempre a mesma sequência — útil para testes e para reproduzir partidas.

export function createRng(seed) {
  // Estado interno de 32 bits sem sinal.
  let state = seed >>> 0;

  return function next() {
    // Avança o estado somando uma constante ímpar (garante período 2^32).
    state = (state + 0x6d2b79f5) >>> 0;
    // Embaralha os bits com multiplicações e deslocamentos (xorshift-multiply).
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    // Converte os 32 bits finais para um número em [0, 1).
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
