import { C, VISIVEL, inimigo } from "../core/dados.js";
import { indice } from "../core/grade.js";
import { distancia } from "../core/hex.js";
import { unidadesDe } from "../core/estado.js";
import { aplicar } from "../core/acoes.js";
import { celulasAlcancaveis } from "../core/movimento.js";
import {
  alvosAtaque,
  alvosDisparo,
  alvosCura,
  alvosEscavar,
  alvosTeleporte,
  raioExplosao,
  alvosExplosao,
} from "../core/alvos.js";
import { acoesProducao, acoesUnidade } from "../core/legais.js";
import { proximo, escolher } from "../core/rng.js";

function posRainhaInimiga(estado, dono) {
  return estado.rainhas[inimigo(dono)];
}

function inimigosVisiveis(estado, dono) {
  const nevoa = estado.nevoa[dono];
  return estado.unidades.filter(
    (u) => u.dono !== dono && nevoa[indice(estado.mapa, u.col, u.row)] === VISIVEL,
  );
}

function unidadeEmHex(estado, col, row) {
  return estado.unidades.find((u) => u.col === col && u.row === row) || null;
}

function maisFraca(lista) {
  return lista.reduce((a, b) => (b.vida < a.vida ? b : a));
}

function moverRumo(estado, u, col, row, aproximar = true) {
  const cels = celulasAlcancaveis(estado, u);
  if (!cels.length) return;
  const atual = distancia(u.col, u.row, col, row);
  let melhor = null;
  let melhorD = aproximar ? atual : -1;
  for (const [c, r] of cels) {
    const d = distancia(c, r, col, row);
    if ((aproximar && d < melhorD) || (!aproximar && d > melhorD)) {
      melhorD = d;
      melhor = [c, r];
    }
  }
  if (melhor) aplicar(estado, { tipo: "MOVER", id: u.id, alvo: { col: melhor[0], row: melhor[1] } });
}

function avancarParaRainha(estado, u, qc, qr) {
  const cels = celulasAlcancaveis(estado, u);
  if (!cels.length) return;
  const adjacentes = cels.filter(([c, r]) => distancia(c, r, qc, qr) === 1);
  if (adjacentes.length) {
    const [c, r] = adjacentes[0];
    aplicar(estado, { tipo: "MOVER", id: u.id, alvo: { col: c, row: r } });
    return;
  }
  moverRumo(estado, u, qc, qr);
}

function agirOperaria(estado, u) {
  const [qc, qr] = posRainhaInimiga(estado, u.dono);
  const perto = inimigosVisiveis(estado, u.dono).filter(
    (e) => e.tipo !== "rainha" && distancia(u.col, u.row, e.col, e.row) <= 1,
  );
  if (perto.length) {
    moverRumo(estado, u, perto[0].col, perto[0].row, false);
    return;
  }
  avancarParaRainha(estado, u, qc, qr);
  const ataques = alvosAtaque(estado, u);
  if (ataques.length) {
    aplicar(estado, { tipo: "ATACAR", id: u.id, alvo: { col: ataques[0][0], row: ataques[0][1] } });
    return;
  }
  const cavar = alvosEscavar(estado, u);
  if (cavar.length) {
    cavar.sort((a, b) => distancia(a[0], a[1], qc, qr) - distancia(b[0], b[1], qc, qr));
    aplicar(estado, { tipo: "ESCAVAR", id: u.id, alvo: { col: cavar[0][0], row: cavar[0][1] } });
  }
}

function agirGuerreira(estado, u) {
  let ataques = alvosAtaque(estado, u);
  if (!ataques.length) {
    const alvos = inimigosVisiveis(estado, u.dono);
    const foco = alvos.length
      ? alvos.reduce((a, b) =>
          distancia(u.col, u.row, b.col, b.row) < distancia(u.col, u.row, a.col, a.row) ? b : a,
        )
      : null;
    const [qc, qr] = posRainhaInimiga(estado, u.dono);
    if (foco) moverRumo(estado, u, foco.col, foco.row);
    else avancarParaRainha(estado, u, qc, qr);
    ataques = alvosAtaque(estado, u);
  }
  if (ataques.length) {
    const vitima = maisFraca(ataques.map(([c, r]) => unidadeEmHex(estado, c, r)));
    aplicar(estado, { tipo: "ATACAR", id: u.id, alvo: { col: vitima.col, row: vitima.row } });
  } else if (u.vida < 0.4 * C().unidades.guerreira.vida) {
    aplicar(estado, { tipo: "DEFENDER", id: u.id });
  }
}

function agirCacadora(estado, u) {
  let tiros = alvosDisparo(estado, u);
  if (!tiros.length) {
    const alvos = inimigosVisiveis(estado, u.dono);
    const [qc, qr] = posRainhaInimiga(estado, u.dono);
    if (alvos.length) {
      const foco = alvos.reduce((a, b) =>
        distancia(u.col, u.row, b.col, b.row) < distancia(u.col, u.row, a.col, a.row) ? b : a,
      );
      moverRumo(estado, u, foco.col, foco.row);
    } else {
      avancarParaRainha(estado, u, qc, qr);
    }
    tiros = alvosDisparo(estado, u);
  }
  if (!tiros.length) {
    const ataques = alvosAtaque(estado, u);
    if (ataques.length) {
      aplicar(estado, { tipo: "ATACAR", id: u.id, alvo: { col: ataques[0][0], row: ataques[0][1] } });
      return;
    }
  }
  if (tiros.length) {
    const vitima = maisFraca(tiros.map(([c, r]) => unidadeEmHex(estado, c, r)));
    aplicar(estado, { tipo: "DISPARO", id: u.id, alvo: { col: vitima.col, row: vitima.row } });
  }
}

function agirMago(estado, u) {
  const adjacente = inimigosVisiveis(estado, u.dono).some(
    (e) => distancia(u.col, u.row, e.col, e.row) <= 1,
  );
  if (adjacente) {
    const tp = alvosTeleporte(estado, u);
    if (tp.length) {
      const [qc, qr] = estado.rainhas[u.dono];
      tp.sort((a, b) => distancia(a[0], a[1], qc, qr) - distancia(b[0], b[1], qc, qr));
      aplicar(estado, { tipo: "TELEPORTE", id: u.id, alvo: { col: tp[0][0], row: tp[0][1] } });
      return;
    }
  }
  for (const [c, r] of alvosExplosao(estado, u)) {
    const atingidos = raioExplosao(estado, c, r);
    const ini = atingidos.filter((x) => x.dono !== u.dono).length;
    const ali = atingidos.filter((x) => x.dono === u.dono).length;
    if (ini >= 2 && ali === 0) {
      aplicar(estado, { tipo: "EXPLOSAO", id: u.id, alvo: { col: c, row: r } });
      return;
    }
  }
  const curas = alvosCura(estado, u);
  if (curas.length) {
    const alvo = maisFraca(curas.map(([c, r]) => unidadeEmHex(estado, c, r)));
    aplicar(estado, { tipo: "CURA", id: u.id, alvo: { col: alvo.col, row: alvo.row } });
    return;
  }
  const guerreiras = unidadesDe(estado, u.dono).filter((x) => x.tipo === "guerreira");
  if (guerreiras.length) moverRumo(estado, u, guerreiras[0].col, guerreiras[0].row);
}

function produzir(estado, dono) {
  const producoes = acoesProducao(estado, dono);
  if (!producoes.length) return;
  const pesos = { operaria: 2, guerreira: 2, cacadora: 1, mago: 1 };
  const contagem = { operaria: 0, guerreira: 0, cacadora: 0, mago: 0 };
  for (const u of unidadesDe(estado, dono)) if (u.tipo in contagem) contagem[u.tipo]++;
  const disponiveis = [...new Set(producoes.map((p) => p.unidade))];
  disponiveis.sort((a, b) => contagem[a] / pesos[a] - contagem[b] / pesos[b]);
  const alvo = producoes.find((p) => p.unidade === disponiveis[0]);
  if (alvo) aplicar(estado, alvo);
}

const AGIR = {
  operaria: agirOperaria,
  guerreira: agirGuerreira,
  cacadora: agirCacadora,
  mago: agirMago,
};

const ORDEM = { guerreira: 0, cacadora: 1, mago: 2, operaria: 3, rainha: 9 };

export function jogarTurnoIA(estado, dono, rng) {
  const aleatorio = C().dificuldade[estado.dificuldade]?.aleatorio ?? 0;
  produzir(estado, dono);
  const fila = unidadesDe(estado, dono)
    .slice()
    .sort((a, b) => ORDEM[a.tipo] - ORDEM[b.tipo]);
  for (const u of fila) {
    if (u.tipo === "rainha") continue;
    if (aleatorio > 0 && proximo(rng) < aleatorio) {
      const opcoes = acoesUnidade(estado, u);
      if (opcoes.length) aplicar(estado, escolher(rng, opcoes));
      continue;
    }
    AGIR[u.tipo]?.(estado, u);
  }
  aplicar(estado, { tipo: "FIM_TURNO" });
}
