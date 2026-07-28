import { C, PASSAVEL, ESCAVAVEL, CAMARA, VISIVEL, inimigo } from "./dados.js";
import { indice, dentro, tile } from "./grade.js";
import { vizinhos, distancia } from "./hex.js";
import { temLinhaVisao } from "./visao.js";
import { unidadeEm, donoInt } from "./estado.js";
import { todasCelulas } from "./grade.js";

export function alvosEscavar(estado, u) {
  return vizinhos(u.col, u.row).filter(
    ([c, r]) => dentro(estado.mapa, c, r) && ESCAVAVEL.has(tile(estado.mapa, c, r)),
  );
}

export function alvosAtaque(estado, u) {
  return vizinhos(u.col, u.row).filter(([c, r]) => {
    const alvo = unidadeEm(estado, c, r);
    return alvo && alvo.dono !== u.dono;
  });
}

export function alvosDisparo(estado, u) {
  const alcance = C().habilidades.disparo.alcance;
  const res = [];
  for (const alvo of estado.unidades) {
    if (alvo.dono === u.dono) continue;
    if (distancia(u.col, u.row, alvo.col, alvo.row) > alcance) continue;
    if (!temLinhaVisao(estado.mapa, u.col, u.row, alvo.col, alvo.row)) continue;
    res.push([alvo.col, alvo.row]);
  }
  return res;
}

export function alvosCura(estado, u) {
  const alcance = C().habilidades.cura.alcance;
  const res = [];
  for (const alvo of estado.unidades) {
    if (alvo.dono !== u.dono) continue;
    if (alvo.vida >= C().unidades[alvo.tipo].vida) continue;
    if (distancia(u.col, u.row, alvo.col, alvo.row) > alcance) continue;
    res.push([alvo.col, alvo.row]);
  }
  return res;
}

export function alvosExplosao(estado, u) {
  const alcance = C().habilidades.explosao.alcance;
  const res = [];
  for (const [c, r] of todasCelulas(estado.mapa)) {
    if (distancia(u.col, u.row, c, r) > alcance) continue;
    if (!temLinhaVisao(estado.mapa, u.col, u.row, c, r)) continue;
    res.push([c, r]);
  }
  return res;
}

export function alvosTeleporte(estado, u) {
  const alcance = C().habilidades.teleporte.alcance;
  const nevoa = estado.nevoa[u.dono];
  const res = [];
  for (const [c, r] of todasCelulas(estado.mapa)) {
    if (c === u.col && r === u.row) continue;
    if (distancia(u.col, u.row, c, r) > alcance) continue;
    if (!PASSAVEL.has(tile(estado.mapa, c, r))) continue;
    if (unidadeEm(estado, c, r)) continue;
    if (nevoa[indice(estado.mapa, c, r)] !== VISIVEL) continue;
    res.push([c, r]);
  }
  return res;
}

export function celulasProducao(estado, dono) {
  const { mapa } = estado;
  const d = donoInt(dono);
  const res = [];
  const visto = new Set();
  for (const [col, row] of todasCelulas(mapa)) {
    if (tile(mapa, col, row) !== CAMARA) continue;
    if (mapa.donos[indice(mapa, col, row)] !== d) continue;
    for (const [c, r] of vizinhos(col, row)) {
      if (!dentro(mapa, c, r)) continue;
      const chave = c + ":" + r;
      if (visto.has(chave)) continue;
      visto.add(chave);
      if (!PASSAVEL.has(tile(mapa, c, r))) continue;
      if (unidadeEm(estado, c, r)) continue;
      res.push([c, r]);
    }
  }
  return res;
}

export function raioExplosao(estado, cc, cr) {
  const raio = C().habilidades.explosao.raio;
  return estado.unidades.filter(
    (alvo) => distancia(cc, cr, alvo.col, alvo.row) <= raio,
  );
}

export { inimigo };
