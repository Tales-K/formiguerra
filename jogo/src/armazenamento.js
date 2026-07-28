import { serializar, desserializar } from "./core/serializar.js";
import { C } from "./core/dados.js";

const PREFIXO = "formigueiro:v1";
const INDICE = `${PREFIXO}:indice`;
const CONFIG = `${PREFIXO}:config`;

function lerIndice() {
  try {
    return JSON.parse(localStorage.getItem(INDICE) || "[]");
  } catch {
    return [];
  }
}

function escreverIndice(indice) {
  localStorage.setItem(INDICE, JSON.stringify(indice));
}

export function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function listarPartidas() {
  return lerIndice().sort((a, b) => b.salvoEm - a.salvoEm);
}

export function salvarPartida(estado, { id, nome, auto = false }) {
  const idFinal = id || gerarId();
  const dados = JSON.stringify(serializar(estado));
  try {
    localStorage.setItem(`${PREFIXO}:save:${idFinal}`, dados);
  } catch (err) {
    if (err && err.name === "QuotaExceededError") return { ok: false, erro: "quota" };
    return { ok: false, erro: "desconhecido" };
  }
  const indice = lerIndice().filter((e) => e.id !== idFinal);
  indice.push({
    id: idFinal,
    nome: nome || `Partida ${new Date().toLocaleDateString("pt-BR")}`,
    salvoEm: Date.now(),
    turno: estado.turno,
    versao: estado.versaoSchema,
    auto,
  });
  escreverIndice(indice);
  return { ok: true, id: idFinal };
}

export function carregarPartida(id) {
  const bruto = localStorage.getItem(`${PREFIXO}:save:${id}`);
  if (!bruto) return null;
  const dados = JSON.parse(bruto);
  if (dados.versaoSchema !== C().versaoSchema) return { incompativel: true };
  return desserializar(dados);
}

export function apagarPartida(id) {
  localStorage.removeItem(`${PREFIXO}:save:${id}`);
  escreverIndice(lerIndice().filter((e) => e.id !== id));
}

export function lerConfig() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG) || "{}");
  } catch {
    return {};
  }
}

export function escreverConfig(cfg) {
  localStorage.setItem(CONFIG, JSON.stringify(cfg));
}
