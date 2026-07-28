import {
  C,
  EXPLORADO,
  VISIVEL,
  DESCONHECIDO,
  BLOQUEIA_VISAO,
  inimigo,
} from "./dados.js";
import { indice, dentro, tile, todasCelulas } from "./grade.js";
import { distancia, linha } from "./hex.js";
import { unidadesDe } from "./estado.js";

export function temLinhaVisao(mapa, c1, r1, c2, r2) {
  const passos = linha(c1, r1, c2, r2);
  for (let i = 1; i < passos.length - 1; i++) {
    const [c, r] = passos[i];
    if (!dentro(mapa, c, r)) return false;
    if (BLOQUEIA_VISAO.has(tile(mapa, c, r))) return false;
  }
  return true;
}

export function recalcularVisao(estado, dono) {
  const { mapa } = estado;
  const nevoa = estado.nevoa[dono];
  for (let i = 0; i < nevoa.length; i++) {
    if (nevoa[i] === VISIVEL) nevoa[i] = EXPLORADO;
  }
  for (const u of unidadesDe(estado, dono)) {
    const raio = C().unidades[u.tipo].visao;
    for (const [col, row] of todasCelulas(mapa)) {
      if (distancia(u.col, u.row, col, row) > raio) continue;
      if (!temLinhaVisao(mapa, u.col, u.row, col, row)) continue;
      nevoa[indice(mapa, col, row)] = VISIVEL;
    }
  }
  const alvo = estado.rainhas[inimigo(dono)];
  const iAlvo = indice(mapa, alvo[0], alvo[1]);
  if (nevoa[iAlvo] === DESCONHECIDO) nevoa[iAlvo] = EXPLORADO;
}
