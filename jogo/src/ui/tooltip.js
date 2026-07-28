import { C } from "../core/dados.js";

const NOMES = {
  rainha: "Rainha",
  operaria: "Operária",
  guerreira: "Guerreira",
  cacadora: "Caçadora",
  mago: "Mago",
};

function habilidades(tipo) {
  const h = C().habilidades;
  const u = C().unidades;
  switch (tipo) {
    case "operaria":
      return [["Escavar", "Converte um hexágono de terra adjacente em túnel. Revelado na hora."]];
    case "guerreira":
      return [
        ["Atacar", "Corpo a corpo em hexágono adjacente."],
        ["Defender", `Postura: defesa sobe para ${u.guerreira.defesa + h.defender.defesaBonus} até o próximo turno.`],
      ];
    case "cacadora":
      return [
        ["Disparo", `Atira em alcance ${h.disparo.alcance}. Precisa de linha de visão livre.`],
        ["Armadilha", `Esconde uma armadilha no hexágono atual. Causa ${h.armadilha.dano} de dano e ignora defesa. Invisível ao inimigo.`],
      ];
    case "mago":
      return [
        ["Cura", `+${h.cura.valor} de vida num aliado, alcance ${h.cura.alcance}.`],
        ["Explosão", `Dano em área, alcance ${h.explosao.alcance}, raio ${h.explosao.raio}. ⚠ Atinge as suas próprias formigas.`],
        ["Teleporte", `Salta até ${h.teleporte.alcance} hexes para um túnel vazio e visível.`],
      ];
    default:
      return [];
  }
}

function linhaStats(u) {
  return `
    <div class="tt-grid">
      <span>Vida</span><b>${u.vida}</b><span>Ataque</span><b>${u.ataque}</b>
      <span>Defesa</span><b>${u.defesa}</b><span>Movim.</span><b>${u.movimento}</b>
      <span>Visão</span><b>${u.visao}</b><span></span><span></span>
    </div>`;
}

export function cardProducao(tipo, indisponivel) {
  const u = C().unidades[tipo];
  const habs = habilidades(tipo)
    .map(([n, d]) => `<div class="tt-hab"><b>${n.toUpperCase()}</b><p>${d}</p></div>`)
    .join("");
  const aviso = indisponivel ? `<div class="tt-aviso">${indisponivel}</div>` : "";
  return `
    <div class="tt-cab"><span>${NOMES[tipo]}</span><span>Custo ${u.custo}</span></div>
    ${linhaStats(u)}
    ${habs}
    ${aviso}`;
}

export function cardUnidade(u) {
  const base = C().unidades[u.tipo];
  const efeitos = u.defendendo ? '<div class="tt-hab"><b>EM DEFESA</b></div>' : "";
  return `
    <div class="tt-cab"><span>${NOMES[u.tipo]}</span><span>${u.dono === "vermelho" ? "Você" : "Inimigo"}</span></div>
    <div class="tt-grid">
      <span>Vida</span><b>${u.vida}/${u.vidaMax}</b><span>Ataque</span><b>${base.ataque}</b>
      <span>Defesa</span><b>${base.defesa}</b><span>Movim.</span><b>${base.movimento}</b>
    </div>${efeitos}`;
}
