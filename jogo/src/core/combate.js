import { C } from "./dados.js";

export function defesaEfetiva(unidade) {
  const base = C().unidades[unidade.tipo].defesa;
  return base + (unidade.defendendo ? C().habilidades.defender.defesaBonus : 0);
}

export function calcularDano(ataque, defesa) {
  return Math.max(C().regras.danoMinimo, ataque - defesa);
}

export function aplicarDano(estado, alvo, quantidade) {
  alvo.vida -= quantidade;
}

export function curar(estado, alvo, quantidade) {
  const max = C().unidades[alvo.tipo].vida;
  alvo.vida = Math.min(max, alvo.vida + quantidade);
}

export function removerMortas(estado) {
  estado.unidades = estado.unidades.filter((u) => u.vida > 0);
}
