import { C, PASSAVEL } from "./dados.js";
import { indice, dentro, tile } from "./grade.js";
import { vizinhos } from "./hex.js";
import { unidadeEm } from "./estado.js";

export function celulasAlcancaveis(estado, unidade) {
  const { mapa } = estado;
  const mov = C().unidades[unidade.tipo].movimento;
  if (mov <= 0) return [];
  const dist = new Map();
  const origem = indice(mapa, unidade.col, unidade.row);
  dist.set(origem, 0);
  let borda = [[unidade.col, unidade.row]];
  for (let passo = 0; passo < mov; passo++) {
    const nova = [];
    for (const [col, row] of borda) {
      for (const [c, r] of vizinhos(col, row)) {
        if (!dentro(mapa, c, r)) continue;
        const i = indice(mapa, c, r);
        if (dist.has(i)) continue;
        if (!PASSAVEL.has(tile(mapa, c, r))) continue;
        if (unidadeEm(estado, c, r)) continue;
        dist.set(i, passo + 1);
        nova.push([c, r]);
      }
    }
    borda = nova;
  }
  dist.delete(origem);
  return [...dist.keys()].map((i) => [i % mapa.largura, Math.floor(i / mapa.largura)]);
}

export function podeAlcancar(estado, unidade, col, row) {
  return celulasAlcancaveis(estado, unidade).some(([c, r]) => c === col && r === row);
}
