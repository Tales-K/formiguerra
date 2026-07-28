import { hexParaPixel } from "../core/hex.js";
import { TERRA, ROCHA, TUNEL, CAMARA, VISIVEL, EXPLORADO } from "../core/dados.js";

export const TAMANHO = 26;
const PAD = TAMANHO;

const CORES_TERRENO = {
  [TERRA]: "#3a2c22",
  [ROCHA]: "#454550",
  [TUNEL]: "#14140f",
  [CAMARA]: "#1d1d12",
};

const GLIFO = { rainha: "♛", operaria: "•", guerreira: "⚔", cacadora: "➶", mago: "✦" };

export function dimensoesCanvas(obs) {
  const w = Math.sqrt(3) * TAMANHO;
  const h = 1.5 * TAMANHO;
  return {
    largura: Math.ceil(w * obs.largura + w / 2 + PAD * 2),
    altura: Math.ceil(h * obs.altura + TAMANHO * 0.5 + PAD * 2),
  };
}

function centro(col, row) {
  const [x, y] = hexParaPixel(col, row, TAMANHO);
  return [x + PAD, y + PAD + TAMANHO];
}

function caminhoHex(ctx, cx, cy) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI / 180) * (60 * i - 90);
    const px = cx + TAMANHO * 0.94 * Math.cos(ang);
    const py = cy + TAMANHO * 0.94 * Math.sin(ang);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function desenharTile(ctx, obs, col, row, i) {
  const [cx, cy] = centro(col, row);
  const nivel = obs.nevoa[i];
  const t = obs.terreno[i];
  caminhoHex(ctx, cx, cy);
  if (t === -1) {
    ctx.fillStyle = "#050507";
  } else {
    ctx.fillStyle = CORES_TERRENO[t];
    if (t === CAMARA && obs.donos[i]) {
      ctx.fillStyle = obs.donos[i] === 1 ? "#4a1d1d" : "#1d2a4a";
    }
  }
  ctx.fill();
  if (t !== -1) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = nivel === VISIVEL ? "#2c2c3a" : "#191922";
    ctx.stroke();
    if (nivel === EXPLORADO) {
      ctx.fillStyle = "rgba(5,5,10,0.45)";
      ctx.fill();
    }
  }
}

function desenharDestaque(ctx, col, row, cor, preenche) {
  const [cx, cy] = centro(col, row);
  caminhoHex(ctx, cx, cy);
  if (preenche) {
    ctx.fillStyle = cor;
    ctx.fill();
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = cor;
  ctx.stroke();
}

function desenharUnidade(ctx, u, selecionado) {
  const [cx, cy] = centro(u.col, u.row);
  const r = TAMANHO * 0.62;
  if (selecionado) {
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffe066";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = u.dono === "vermelho" ? "#b8332f" : "#2f5bb8";
  ctx.fill();
  ctx.strokeStyle = u.defendendo ? "#ffd27f" : "rgba(0,0,0,0.5)";
  ctx.lineWidth = u.defendendo ? 3 : 1.5;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = `${Math.round(TAMANHO * 0.8)}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(GLIFO[u.tipo] || "?", cx, cy + 1);
  const frac = Math.max(0, u.vida / u.vidaMax);
  const bw = TAMANHO * 1.1;
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(cx - bw / 2, cy - r - 7, bw, 4);
  ctx.fillStyle = frac > 0.5 ? "#3ad46a" : frac > 0.25 ? "#e0b040" : "#e05050";
  ctx.fillRect(cx - bw / 2, cy - r - 7, bw * frac, 4);
}

export function renderizar(ctx, obs, overlay) {
  const dim = dimensoesCanvas(obs);
  ctx.clearRect(0, 0, dim.largura, dim.altura);
  for (let row = 0; row < obs.altura; row++) {
    for (let col = 0; col < obs.largura; col++) {
      desenharTile(ctx, obs, col, row, row * obs.largura + col);
    }
  }
  const alvo = obs.rainhas.azul;
  desenharDestaque(ctx, alvo[0], alvo[1], "rgba(230,80,80,0.9)", false);

  for (const chave of overlay.verdes) marcar(ctx, chave, "rgba(60,200,110,0.35)");
  for (const chave of overlay.azuis) marcar(ctx, chave, "rgba(80,150,255,0.32)");
  for (const chave of overlay.vermelhos) marcar(ctx, chave, "rgba(230,70,70,0.4)");

  for (const a of obs.armadilhas) {
    const [cx, cy] = centro(a.col, a.row);
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffcf40";
    ctx.fill();
  }
  for (const u of obs.unidades) desenharUnidade(ctx, u, overlay.selecionadoId === u.id);

  if (overlay.hover) {
    const [c, r] = overlay.hover.split(":").map(Number);
    const [cx, cy] = centro(c, r);
    caminhoHex(ctx, cx, cy);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function marcar(ctx, chave, cor) {
  const [c, r] = chave.split(":").map(Number);
  const [cx, cy] = centro(c, r);
  caminhoHex(ctx, cx, cy);
  ctx.fillStyle = cor;
  ctx.fill();
}

export function celulaEmPonto(px, py, obs) {
  let melhor = null;
  let melhorD = Infinity;
  for (let row = 0; row < obs.altura; row++) {
    for (let col = 0; col < obs.largura; col++) {
      const [cx, cy] = centro(col, row);
      const d = (px - cx) ** 2 + (py - cy) ** 2;
      if (d < melhorD && d < (TAMANHO * 0.94) ** 2) {
        melhorD = d;
        melhor = [col, row];
      }
    }
  }
  return melhor;
}
