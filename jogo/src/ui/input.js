import { cardUnidade } from "./tooltip.js";
import { mostrarDica, esconderDica } from "./dica.js";

export function iniciarInput(ctrl, canvas, mapArea, aoEsc) {
  let zoom = 1;

  function paraCanvas(cx, cy) {
    const r = canvas.getBoundingClientRect();
    return [(cx - r.left) / zoom, (cy - r.top) / zoom];
  }

  canvas.addEventListener("click", (e) => {
    const [px, py] = paraCanvas(e.clientX, e.clientY);
    const cel = ctrl.celulaEm(px, py);
    if (cel) ctrl.clicarCelula(cel[0], cel[1]);
  });

  canvas.addEventListener("mousemove", (e) => {
    const [px, py] = paraCanvas(e.clientX, e.clientY);
    const cel = ctrl.celulaEm(px, py);
    ctrl.definirHover(cel ? cel[0] : null, cel ? cel[1] : null);
    if (cel) {
      const u = ctrl.unidadeVisivelEm(cel[0], cel[1]);
      if (u) {
        mostrarDica(cardUnidade(u), e.clientX, e.clientY);
        return;
      }
    }
    esconderDica();
  });

  canvas.addEventListener("mouseleave", () => {
    ctrl.definirHover(null);
    esconderDica();
  });

  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    ctrl.cancelar();
  });

  mapArea.addEventListener("wheel", (e) => {
    e.preventDefault();
    zoom = Math.min(2.5, Math.max(0.5, zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
    canvas.style.transform = `scale(${zoom})`;
  }, { passive: false });

  let pan = null;
  mapArea.addEventListener("mousedown", (e) => {
    if (e.button === 1) {
      pan = { x: e.clientX, y: e.clientY, sl: mapArea.scrollLeft, st: mapArea.scrollTop };
      e.preventDefault();
    }
  });
  window.addEventListener("mousemove", (e) => {
    if (pan) {
      mapArea.scrollLeft = pan.sl - (e.clientX - pan.x);
      mapArea.scrollTop = pan.st - (e.clientY - pan.y);
    }
  });
  window.addEventListener("mouseup", () => { pan = null; });

  document.addEventListener("keydown", (e) => {
    if (document.getElementById("tela-jogo").classList.contains("oculto")) return;
    if (e.key === " ") {
      e.preventDefault();
      ctrl.proximaUnidade();
    } else if (e.key === "Enter") {
      ctrl.passarTurno();
    } else if (e.key === "Escape") {
      aoEsc();
    }
  });
}
