export function novoRng(seed) {
  return { estado: seed >>> 0 };
}

export function proximo(rng) {
  rng.estado = (rng.estado + 0x6d2b79f5) >>> 0;
  let t = rng.estado;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function inteiro(rng, n) {
  return Math.floor(proximo(rng) * n);
}

export function escolher(rng, lista) {
  return lista[inteiro(rng, lista.length)];
}

export function embaralhar(rng, lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = inteiro(rng, i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
