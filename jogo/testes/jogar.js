import { acoesLegais } from "../src/core/legais.js";
import { aplicar } from "../src/core/acoes.js";
import { novoRng, inteiro } from "../src/core/rng.js";
import { PASSAVEL } from "../src/core/dados.js";
import { indice } from "../src/core/grade.js";

export function checarInvariantes(estado) {
  const ocupados = new Set();
  for (const u of estado.unidades) {
    const chave = u.col + ":" + u.row;
    if (ocupados.has(chave)) throw new Error("duas unidades no mesmo hex " + chave);
    ocupados.add(chave);
    const t = estado.mapa.tiles[indice(estado.mapa, u.col, u.row)];
    if (!PASSAVEL.has(t)) throw new Error("unidade em terreno solido " + chave);
    if (u.vida <= 0) throw new Error("unidade com vida <= 0");
  }
}

export function jogarAleatorio(estado, seedPicker, maxAcoes, aoAplicar) {
  const rng = novoRng(seedPicker);
  for (let i = 0; i < maxAcoes && !estado.vencedor; i++) {
    const legais = acoesLegais(estado, estado.jogadorAtual);
    if (legais.length === 0) break;
    const naoFim = legais.filter((a) => a.tipo !== "FIM_TURNO");
    const escolha =
      naoFim.length > 0 && inteiro(rng, 5) > 0
        ? naoFim[inteiro(rng, naoFim.length)]
        : { tipo: "FIM_TURNO" };
    aplicar(estado, escolha);
    if (aoAplicar) aoAplicar(estado, escolha);
  }
  return estado;
}
