import { C, DESCONHECIDO, VISIVEL } from "./dados.js";
import { indice } from "./grade.js";

export function observar(estado, jogador) {
  const { mapa } = estado;
  const nevoa = estado.nevoa[jogador];
  const terreno = mapa.tiles.map((t, i) => (nevoa[i] === DESCONHECIDO ? -1 : t));
  const donos = mapa.donos.map((d, i) => (nevoa[i] === DESCONHECIDO ? 0 : d));

  const unidades = [];
  for (const u of estado.unidades) {
    const visivel = nevoa[indice(mapa, u.col, u.row)] === VISIVEL;
    if (u.dono !== jogador && !visivel) continue;
    unidades.push({
      id: u.id,
      tipo: u.tipo,
      dono: u.dono,
      col: u.col,
      row: u.row,
      vida: u.vida,
      vidaMax: C().unidades[u.tipo].vida,
      defendendo: u.defendendo,
      moveu: u.moveu,
      agiu: u.agiu,
    });
  }

  const armadilhas = estado.armadilhas
    .filter((a) => a.dono === jogador)
    .map((a) => ({ id: a.id, col: a.col, row: a.row }));

  return {
    largura: mapa.largura,
    altura: mapa.altura,
    nevoa: nevoa.slice(),
    terreno,
    donos,
    unidades,
    armadilhas,
    rainhas: estado.rainhas,
    biomassa: estado.biomassa[jogador],
    turno: estado.turno,
    jogadorAtual: estado.jogadorAtual,
    dificuldade: estado.dificuldade,
    vencedor: estado.vencedor,
    produziu: estado.produziu[jogador],
  };
}
