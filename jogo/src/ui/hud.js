import { cardProducao } from "./tooltip.js";
import { mostrarDica, esconderDica } from "./dica.js";

const GLIFO = { operaria: "•", guerreira: "⚔", cacadora: "➶", mago: "✦" };
const NOME = { operaria: "Operária", guerreira: "Guerreira", cacadora: "Caçadora", mago: "Mago" };

export function iniciarHud(ctrl) {
  const prod = document.getElementById("producao");
  const acoes = document.getElementById("acoes-unidade");
  const lblTurno = document.getElementById("lbl-turno");
  const lblBio = document.getElementById("lbl-bio");

  function atualizar(info) {
    lblTurno.textContent = `Turno ${info.estado.turno}`;
    lblBio.textContent = info.obs.biomassa;

    prod.innerHTML = "";
    for (const p of ctrl.infoProducao()) {
      const b = document.createElement("button");
      b.className = "btn-prod" + (p.ativo ? " ativo" : "");
      b.disabled = !p.disponivel;
      b.innerHTML = `<span class="g">${GLIFO[p.tipo]}</span><span>${NOME[p.tipo]}</span><span class="c">${p.custo}</span>`;
      b.addEventListener("click", () => ctrl.iniciarProducao(p.tipo));
      b.addEventListener("mousemove", (e) =>
        mostrarDica(cardProducao(p.tipo, p.motivo), e.clientX, e.clientY),
      );
      b.addEventListener("mouseleave", esconderDica);
      prod.appendChild(b);
    }

    const lista = ctrl.infoAcoes();
    acoes.innerHTML = "";
    if (!info.sel) {
      acoes.innerHTML = '<p class="vazio">Selecione uma formiga.</p>';
    } else if (!lista.length) {
      acoes.innerHTML = '<p class="vazio">Sem ações disponíveis.</p>';
    } else {
      for (const a of lista) {
        const b = document.createElement("button");
        b.className = "btn-acao" + (a.ativo ? " ativo" : "");
        b.textContent = a.rotulo;
        b.addEventListener("click", () => ctrl.armar(a.tipo));
        acoes.appendChild(b);
      }
    }
  }

  return atualizar;
}
