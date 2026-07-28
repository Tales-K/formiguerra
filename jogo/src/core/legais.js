import { C } from "./dados.js";
import { unidadesDe } from "./estado.js";
import { celulasAlcancaveis } from "./movimento.js";
import {
  alvosEscavar,
  alvosAtaque,
  alvosDisparo,
  alvosCura,
  alvosExplosao,
  alvosTeleporte,
  celulasProducao,
} from "./alvos.js";

const ACOES_POR_TIPO = {
  operaria: [["ESCAVAR", alvosEscavar], ["ATACAR", alvosAtaque]],
  guerreira: [["ATACAR", alvosAtaque], ["DEFENDER", null]],
  cacadora: [["DISPARO", alvosDisparo], ["ARMADILHA", null], ["ATACAR", alvosAtaque]],
  mago: [["CURA", alvosCura], ["EXPLOSAO", alvosExplosao], ["TELEPORTE", alvosTeleporte]],
  rainha: [],
};

export function acoesUnidade(estado, u) {
  const lista = [];
  if (!u.moveu) {
    for (const [c, r] of celulasAlcancaveis(estado, u)) {
      lista.push({ tipo: "MOVER", id: u.id, alvo: { col: c, row: r } });
    }
  }
  if (!u.agiu) {
    for (const [tipo, alvos] of ACOES_POR_TIPO[u.tipo] || []) {
      if (!alvos) {
        lista.push({ tipo, id: u.id });
      } else {
        for (const [c, r] of alvos(estado, u)) {
          lista.push({ tipo, id: u.id, alvo: { col: c, row: r } });
        }
      }
    }
  }
  return lista;
}

export function acoesProducao(estado, dono) {
  if (estado.produziu[dono]) return [];
  const celulas = celulasProducao(estado, dono);
  if (celulas.length === 0) return [];
  const lista = [];
  for (const [tipo, base] of Object.entries(C().unidades)) {
    if (tipo === "rainha") continue;
    if (estado.biomassa[dono] < base.custo) continue;
    for (const [c, r] of celulas) {
      lista.push({ tipo: "PRODUZIR", unidade: tipo, alvo: { col: c, row: r } });
    }
  }
  return lista;
}

export function acoesLegais(estado, dono) {
  if (estado.vencedor) return [];
  const lista = [{ tipo: "FIM_TURNO" }];
  for (const u of unidadesDe(estado, dono)) {
    lista.push(...acoesUnidade(estado, u));
  }
  lista.push(...acoesProducao(estado, dono));
  return lista;
}
