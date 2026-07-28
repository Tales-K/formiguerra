import { C, DESCONHECIDO, VERMELHO, AZUL, CAMARA } from "./dados.js";
import { novoRng } from "./rng.js";
import { gerarMapa, posicoesRainhas } from "./mapa.js";
import { indice, dentro, tile } from "./grade.js";
import { vizinhos } from "./hex.js";
import { recalcularVisao } from "./visao.js";

export function donoInt(dono) {
  return dono === VERMELHO ? 1 : dono === AZUL ? 2 : 0;
}

function criarUnidade(estado, tipo, dono, col, row) {
  const base = C().unidades[tipo];
  return {
    id: estado.proximoId++,
    tipo,
    dono,
    col,
    row,
    vida: base.vida,
    defendendo: 0,
    moveu: 0,
    agiu: 0,
  };
}

export function criarEstado(seed, dificuldade) {
  const rng = novoRng(seed);
  const { mapa, rainhas } = gerarMapa(rng);
  const n = mapa.largura * mapa.altura;
  mapa.donos = new Array(n).fill(0);

  const estado = {
    versaoSchema: C().versaoSchema,
    seed,
    dificuldade,
    turno: 1,
    jogadorAtual: VERMELHO,
    proximoId: 1,
    rng,
    mapa,
    unidades: [],
    armadilhas: [],
    biomassa: {
      vermelho: C().economia.biomassaInicial,
      azul: C().economia.biomassaInicial,
    },
    produziu: { vermelho: 0, azul: 0 },
    nevoa: {
      vermelho: new Array(n).fill(DESCONHECIDO),
      azul: new Array(n).fill(DESCONHECIDO),
    },
    vencedor: null,
    historico: [],
  };

  for (const dono of [VERMELHO, AZUL]) {
    const [qc, qr] = rainhas[dono];
    marcarCamara(estado, dono, qc, qr);
    estado.unidades.push(criarUnidade(estado, "rainha", dono, qc, qr));
    const [oc, or_] = vizinhos(qc, qr).find(
      ([c, r]) => dentro(mapa, c, r) && tile(mapa, c, r) === CAMARA,
    );
    estado.unidades.push(criarUnidade(estado, "operaria", dono, oc, or_));
  }

  estado.rainhas = { vermelho: rainhas.vermelho, azul: rainhas.azul };
  recalcularVisao(estado, VERMELHO);
  recalcularVisao(estado, AZUL);
  return estado;
}

function marcarCamara(estado, dono, qc, qr) {
  const d = donoInt(dono);
  const { mapa } = estado;
  mapa.donos[indice(mapa, qc, qr)] = d;
  for (const [c, r] of vizinhos(qc, qr)) {
    if (dentro(mapa, c, r) && tile(mapa, c, r) === CAMARA) {
      mapa.donos[indice(mapa, c, r)] = d;
    }
  }
}

export function unidadeEm(estado, col, row) {
  return estado.unidades.find((u) => u.col === col && u.row === row) || null;
}

export function unidadePorId(estado, id) {
  return estado.unidades.find((u) => u.id === id) || null;
}

export function unidadesDe(estado, dono) {
  return estado.unidades.filter((u) => u.dono === dono);
}

export function rainhaDe(estado, dono) {
  return estado.unidades.find((u) => u.dono === dono && u.tipo === "rainha") || null;
}

export function hexEscavados(estado, dono) {
  const d = donoInt(dono);
  let total = 0;
  for (const v of estado.mapa.donos) if (v === d) total++;
  return total;
}

export function armadilhaEm(estado, col, row) {
  return estado.armadilhas.find((a) => a.col === col && a.row === row) || null;
}
