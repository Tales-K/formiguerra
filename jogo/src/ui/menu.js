import { C } from "../core/dados.js";
import { listarPartidas, apagarPartida } from "../armazenamento.js";

const DIFICULDADES = [
  ["facil", "Fácil"],
  ["medio", "Médio"],
  ["dificil", "Difícil"],
];

export function montarDificuldades(painel, aoEscolher) {
  painel.innerHTML = "";
  for (const [id, rotulo] of DIFICULDADES) {
    const b = document.createElement("button");
    b.className = "btn-sec";
    b.textContent = rotulo;
    b.addEventListener("click", () => aoEscolher(id));
    painel.appendChild(b);
  }
  painel.classList.remove("oculto");
}

export function montarSaves(painel, aoCarregar) {
  painel.innerHTML = "";
  const saves = listarPartidas();
  if (!saves.length) {
    painel.innerHTML = '<p class="vazio">Nenhuma partida salva.</p>';
    painel.classList.remove("oculto");
    return;
  }
  const wrap = document.createElement("div");
  wrap.className = "lista-saves";
  for (const s of saves) {
    const velho = s.versao !== C().versaoSchema;
    const item = document.createElement("div");
    item.className = "save-item" + (velho ? " velho" : "");
    const data = new Date(s.salvoEm).toLocaleString("pt-BR");
    const sufixo = velho ? " · versão anterior" : s.auto ? " · auto" : "";
    item.innerHTML = `<div class="info"><span class="nome">${s.nome}</span>` +
      `<span class="meta">Turno ${s.turno} · ${data}${sufixo}</span></div>`;
    const acoes = document.createElement("div");
    if (!velho) {
      const carregar = document.createElement("button");
      carregar.className = "mini carregar";
      carregar.textContent = "Abrir";
      carregar.addEventListener("click", () => aoCarregar(s.id));
      acoes.appendChild(carregar);
    }
    const apagar = document.createElement("button");
    apagar.className = "mini apagar";
    apagar.textContent = "×";
    apagar.addEventListener("click", () => {
      apagarPartida(s.id);
      montarSaves(painel, aoCarregar);
    });
    acoes.appendChild(apagar);
    item.appendChild(acoes);
    wrap.appendChild(item);
  }
  painel.appendChild(wrap);
  painel.classList.remove("oculto");
}
