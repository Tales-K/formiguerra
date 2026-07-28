import { C } from "../core/dados.js";
import { observar } from "../core/observar.js";
import { aplicar } from "../core/acoes.js";
import { unidadePorId, unidadesDe } from "../core/estado.js";
import { acoesUnidade } from "../core/legais.js";
import { celulasAlcancaveis } from "../core/movimento.js";
import {
  alvosEscavar, alvosAtaque, alvosDisparo,
  alvosCura, alvosExplosao, alvosTeleporte, celulasProducao,
} from "../core/alvos.js";
import { novoRng } from "../core/rng.js";
import { jogarTurnoIA } from "../ia/heuristica.js";
import { salvarPartida } from "../armazenamento.js";
import { renderizar, dimensoesCanvas, celulaEmPonto } from "./render.js";

const ALVOS = {
  ESCAVAR: alvosEscavar, ATACAR: alvosAtaque, DISPARO: alvosDisparo,
  CURA: alvosCura, EXPLOSAO: alvosExplosao, TELEPORTE: alvosTeleporte,
};
const INSTANTANEAS = new Set(["DEFENDER", "ARMADILHA"]);
const ROTULOS = {
  ESCAVAR: "Escavar", ATACAR: "Atacar", DEFENDER: "Defender", DISPARO: "Disparo",
  ARMADILHA: "Armadilha", CURA: "Cura", EXPLOSAO: "Explosão", TELEPORTE: "Teleporte",
};
const TIPOS = ["operaria", "guerreira", "cacadora", "mago"];

const chave = (c, r) => `${c}:${r}`;
const contem = (lista, c, r) => lista.some(([a, b]) => a === c && b === r);

export function criarControlador(opts) {
  let estado = null;
  let partidaId = null;
  let aiRng = null;
  let sel = null;
  let acaoArmada = null;
  let modoProducao = null;
  let hover = null;

  function unidadeSel() {
    return sel != null ? unidadePorId(estado, sel) : null;
  }

  function overlays() {
    const azuis = new Set();
    const vermelhos = new Set();
    const verdes = new Set();
    const u = unidadeSel();
    if (modoProducao) {
      for (const [c, r] of celulasProducao(estado, "vermelho")) verdes.add(chave(c, r));
    } else if (u && u.dono === "vermelho") {
      if (acaoArmada && ALVOS[acaoArmada]) {
        for (const [c, r] of ALVOS[acaoArmada](estado, u)) vermelhos.add(chave(c, r));
      } else if (!u.moveu) {
        for (const [c, r] of celulasAlcancaveis(estado, u)) azuis.add(chave(c, r));
      }
    }
    return { azuis, vermelhos, verdes, selecionadoId: sel, hover };
  }

  function desenhar() {
    const obs = observar(estado, "vermelho");
    const dim = dimensoesCanvas(obs);
    if (opts.canvas.width !== dim.largura || opts.canvas.height !== dim.altura) {
      opts.canvas.width = dim.largura;
      opts.canvas.height = dim.altura;
    }
    renderizar(opts.ctx, obs, overlays());
    opts.atualizarHud({ estado, obs, sel: unidadeSel(), acaoArmada, modoProducao });
  }

  function celulaEm(px, py) {
    return celulaEmPonto(px, py, { largura: estado.mapa.largura, altura: estado.mapa.altura });
  }

  function unidadeVisivelEm(col, row) {
    return observar(estado, "vermelho").unidades.find((u) => u.col === col && u.row === row) || null;
  }

  function checarFim() {
    if (estado.vencedor) opts.mostrarFim(estado.vencedor);
  }

  function iniciar(novoEstado, id) {
    estado = novoEstado;
    partidaId = id;
    aiRng = novoRng((estado.seed ^ 0x9e3779b9) >>> 0);
    sel = null; acaoArmada = null; modoProducao = null; hover = null;
    desenhar();
  }

  function selecionar(col, row) {
    const alvo = estado.unidades.find(
      (x) => x.dono === "vermelho" && x.tipo !== "rainha" && x.col === col && x.row === row,
    );
    sel = alvo ? alvo.id : null;
    acaoArmada = null; modoProducao = null;
  }

  function clicarCelula(col, row) {
    if (estado.vencedor) return;
    if (modoProducao) {
      if (contem(celulasProducao(estado, "vermelho"), col, row)) {
        aplicar(estado, { tipo: "PRODUZIR", unidade: modoProducao, alvo: { col, row } });
      }
      modoProducao = null;
      desenhar();
      return;
    }
    const u = unidadeSel();
    if (u && acaoArmada && ALVOS[acaoArmada]) {
      if (contem(ALVOS[acaoArmada](estado, u), col, row)) {
        aplicar(estado, { tipo: acaoArmada, id: sel, alvo: { col, row } });
      }
      acaoArmada = null;
      desenhar();
      checarFim();
      return;
    }
    if (u && !u.moveu && contem(celulasAlcancaveis(estado, u), col, row)) {
      aplicar(estado, { tipo: "MOVER", id: sel, alvo: { col, row } });
      desenhar();
      checarFim();
      return;
    }
    selecionar(col, row);
    desenhar();
  }

  function armar(tipo) {
    const u = unidadeSel();
    if (!u) return;
    if (INSTANTANEAS.has(tipo)) {
      aplicar(estado, { tipo, id: sel });
      acaoArmada = null;
    } else {
      acaoArmada = acaoArmada === tipo ? null : tipo;
    }
    desenhar();
  }

  function iniciarProducao(tipo) {
    sel = null; acaoArmada = null;
    modoProducao = modoProducao === tipo ? null : tipo;
    desenhar();
  }

  function proximaUnidade() {
    const livres = unidadesDe(estado, "vermelho").filter(
      (u) => u.tipo !== "rainha" && (!u.moveu || !u.agiu),
    );
    if (!livres.length) return;
    const idx = livres.findIndex((u) => u.id === sel);
    const alvo = livres[(idx + 1) % livres.length];
    sel = alvo.id; acaoArmada = null; modoProducao = null;
    desenhar();
    return alvo;
  }

  function autosave() {
    salvarPartida(estado, { id: partidaId, auto: true });
  }

  function passarTurno() {
    if (estado.vencedor) return;
    aplicar(estado, { tipo: "FIM_TURNO" });
    let guarda = 0;
    while (estado.jogadorAtual === "azul" && !estado.vencedor && guarda++ < 60) {
      jogarTurnoIA(estado, "azul", aiRng);
    }
    sel = null; acaoArmada = null; modoProducao = null;
    autosave();
    desenhar();
    checarFim();
  }

  function definirHover(col, row) {
    const nova = col == null ? null : chave(col, row);
    if (nova !== hover) {
      hover = nova;
      desenhar();
    }
  }

  function cancelar() {
    sel = null; acaoArmada = null; modoProducao = null;
    desenhar();
  }

  function infoProducao() {
    const bio = estado.biomassa.vermelho;
    const nUnid = unidadesDe(estado, "vermelho").filter((u) => u.tipo !== "rainha").length;
    const espacos = celulasProducao(estado, "vermelho").length;
    return TIPOS.map((tipo) => {
      const custo = C().unidades[tipo].custo;
      let motivo = null;
      if (estado.produziu.vermelho) motivo = "Já produziu neste turno";
      else if (bio < custo) motivo = `Faltam ${custo - bio} de biomassa`;
      else if (nUnid >= C().regras.tetoUnidades) motivo = `Limite de ${C().regras.tetoUnidades} unidades`;
      else if (espacos === 0) motivo = "Sem espaço na câmara";
      return { tipo, custo, motivo, disponivel: !motivo, ativo: modoProducao === tipo };
    });
  }

  function infoAcoes() {
    const u = unidadeSel();
    if (!u) return [];
    const tipos = new Set(acoesUnidade(estado, u).map((a) => a.tipo).filter((t) => t !== "MOVER"));
    return [...tipos].map((tipo) => ({ tipo, rotulo: ROTULOS[tipo], ativo: acaoArmada === tipo }));
  }

  return {
    iniciar, clicarCelula, armar, iniciarProducao, proximaUnidade, passarTurno,
    definirHover, cancelar, infoProducao, infoAcoes, desenhar, celulaEm, unidadeVisivelEm,
    unidadeSel, get estado() { return estado; },
  };
}
