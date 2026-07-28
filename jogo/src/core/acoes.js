import { C, TERRA, TUNEL, inimigo } from "./dados.js";
import { setTile, indice } from "./grade.js";
import {
  unidadePorId,
  unidadesDe,
  rainhaDe,
  hexEscavados,
  armadilhaEm,
  donoInt,
} from "./estado.js";
import { recalcularVisao } from "./visao.js";
import { podeAlcancar } from "./movimento.js";
import {
  defesaEfetiva,
  calcularDano,
  aplicarDano,
  curar,
  removerMortas,
} from "./combate.js";
import {
  alvosEscavar,
  alvosAtaque,
  alvosDisparo,
  alvosCura,
  alvosExplosao,
  alvosTeleporte,
  celulasProducao,
  raioExplosao,
} from "./alvos.js";

function contem(lista, col, row) {
  return lista.some(([c, r]) => c === col && r === row);
}

function checarVitoria(estado) {
  for (const dono of ["vermelho", "azul"]) {
    const rainha = rainhaDe(estado, dono);
    if (!rainha || rainha.vida <= 0) estado.vencedor = inimigo(dono);
  }
}

function dispararArmadilha(estado, unidade) {
  const trap = armadilhaEm(estado, unidade.col, unidade.row);
  if (!trap || trap.dono === unidade.dono) return;
  aplicarDano(estado, unidade, C().habilidades.armadilha.dano);
  estado.armadilhas = estado.armadilhas.filter((a) => a !== trap);
  removerMortas(estado);
  checarVitoria(estado);
}

function executar(estado, acao) {
  const u = acao.id != null ? unidadePorId(estado, acao.id) : null;
  const alvo = acao.alvo;
  switch (acao.tipo) {
    case "MOVER":
      if (!u || u.moveu || !podeAlcancar(estado, u, alvo.col, alvo.row)) return false;
      u.col = alvo.col;
      u.row = alvo.row;
      u.moveu = 1;
      dispararArmadilha(estado, u);
      recalcularVisao(estado, u.dono);
      return true;
    case "ESCAVAR":
      if (!u || u.agiu || u.tipo !== "operaria") return false;
      if (!contem(alvosEscavar(estado, u), alvo.col, alvo.row)) return false;
      setTile(estado.mapa, alvo.col, alvo.row, TUNEL);
      estado.mapa.donos[indice(estado.mapa, alvo.col, alvo.row)] = donoInt(u.dono);
      u.agiu = 1;
      recalcularVisao(estado, u.dono);
      return true;
    case "ATACAR": {
      if (!u || u.agiu) return false;
      if (!contem(alvosAtaque(estado, u), alvo.col, alvo.row)) return false;
      const vitima = estado.unidades.find((x) => x.col === alvo.col && x.row === alvo.row);
      aplicarDano(estado, vitima, calcularDano(C().unidades[u.tipo].ataque, defesaEfetiva(vitima)));
      u.agiu = 1;
      removerMortas(estado);
      checarVitoria(estado);
      return true;
    }
    case "DEFENDER":
      if (!u || u.agiu || u.tipo !== "guerreira") return false;
      u.defendendo = 1;
      u.agiu = 1;
      return true;
    case "DISPARO": {
      if (!u || u.agiu || u.tipo !== "cacadora") return false;
      if (!contem(alvosDisparo(estado, u), alvo.col, alvo.row)) return false;
      const vitima = estado.unidades.find((x) => x.col === alvo.col && x.row === alvo.row);
      aplicarDano(estado, vitima, calcularDano(C().unidades[u.tipo].ataque, defesaEfetiva(vitima)));
      u.agiu = 1;
      removerMortas(estado);
      checarVitoria(estado);
      return true;
    }
    case "ARMADILHA": {
      if (!u || u.agiu || u.tipo !== "cacadora") return false;
      const ativas = estado.armadilhas.filter((a) => a.dono === u.dono).length;
      if (ativas >= C().regras.maxArmadilhas) return false;
      if (armadilhaEm(estado, u.col, u.row)) return false;
      estado.armadilhas.push({ id: estado.proximoId++, dono: u.dono, col: u.col, row: u.row });
      u.agiu = 1;
      return true;
    }
    case "CURA": {
      if (!u || u.agiu || u.tipo !== "mago") return false;
      if (!contem(alvosCura(estado, u), alvo.col, alvo.row)) return false;
      const amigo = estado.unidades.find((x) => x.col === alvo.col && x.row === alvo.row);
      curar(estado, amigo, C().habilidades.cura.valor);
      u.agiu = 1;
      return true;
    }
    case "EXPLOSAO": {
      if (!u || u.agiu || u.tipo !== "mago") return false;
      if (!contem(alvosExplosao(estado, u), alvo.col, alvo.row)) return false;
      for (const alvoU of raioExplosao(estado, alvo.col, alvo.row)) {
        aplicarDano(estado, alvoU, calcularDano(C().unidades[u.tipo].ataque, defesaEfetiva(alvoU)));
      }
      u.agiu = 1;
      removerMortas(estado);
      checarVitoria(estado);
      return true;
    }
    case "TELEPORTE":
      if (!u || u.agiu || u.tipo !== "mago") return false;
      if (!contem(alvosTeleporte(estado, u), alvo.col, alvo.row)) return false;
      u.col = alvo.col;
      u.row = alvo.row;
      u.agiu = 1;
      recalcularVisao(estado, u.dono);
      return true;
    case "PRODUZIR": {
      const dono = estado.jogadorAtual;
      if (estado.produziu[dono]) return false;
      const custo = C().unidades[acao.unidade]?.custo;
      if (custo == null) return false;
      if (estado.biomassa[dono] < custo) return false;
      if (unidadesDe(estado, dono).filter((x) => x.tipo !== "rainha").length >= C().regras.tetoUnidades)
        return false;
      if (!contem(celulasProducao(estado, dono), alvo.col, alvo.row)) return false;
      const base = C().unidades[acao.unidade];
      estado.unidades.push({
        id: estado.proximoId++,
        tipo: acao.unidade,
        dono,
        col: alvo.col,
        row: alvo.row,
        vida: base.vida,
        defendendo: 0,
        moveu: 0,
        agiu: 0,
      });
      estado.biomassa[dono] -= custo;
      estado.produziu[dono] = 1;
      recalcularVisao(estado, dono);
      return true;
    }
    case "FIM_TURNO":
      return true;
    default:
      return false;
  }
}

function coletarBiomassa(estado, dono) {
  const eco = C().economia;
  const bonus = Math.floor(hexEscavados(estado, dono) / eco.hexPorBonus) * eco.bonusPorGrupo;
  estado.biomassa[dono] = Math.min(eco.tetoBiomassa, estado.biomassa[dono] + eco.rendaBase + bonus);
}

export function iniciarTurno(estado, dono) {
  coletarBiomassa(estado, dono);
  for (const u of unidadesDe(estado, dono)) {
    u.defendendo = 0;
    u.moveu = 0;
    u.agiu = 0;
  }
  estado.produziu[dono] = 0;
  recalcularVisao(estado, dono);
}

export function aplicar(estado, acao) {
  if (estado.vencedor) return estado;
  const ok = executar(estado, acao);
  if (!ok) return estado;
  estado.historico.push(acao);
  if (acao.tipo === "FIM_TURNO") {
    const proximo = inimigo(estado.jogadorAtual);
    estado.jogadorAtual = proximo;
    estado.turno += 1;
    if (estado.turno > C().regras.limiteTurnos) {
      estado.vencedor = "empate";
      return estado;
    }
    iniciarTurno(estado, proximo);
  }
  return estado;
}
