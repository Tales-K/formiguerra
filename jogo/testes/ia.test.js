import "./setup.js";
import test from "node:test";
import assert from "node:assert/strict";
import { criarEstado } from "../src/core/estado.js";
import { aplicar } from "../src/core/acoes.js";
import { acoesUnidade, acoesProducao } from "../src/core/legais.js";
import { novoRng, inteiro } from "../src/core/rng.js";
import { jogarTurnoIA } from "../src/ia/heuristica.js";
import { checarInvariantes } from "./jogar.js";

function turnoAleatorio(estado, dono, rng) {
  const prod = acoesProducao(estado, dono);
  if (prod.length && inteiro(rng, 2) === 0) aplicar(estado, prod[inteiro(rng, prod.length)]);
  for (const u of estado.unidades.filter((x) => x.dono === dono && x.tipo !== "rainha").slice()) {
    const ops = acoesUnidade(estado, u);
    if (ops.length) aplicar(estado, ops[inteiro(rng, ops.length)]);
  }
  aplicar(estado, { tipo: "FIM_TURNO" });
}

test("partidas heuristica vs heuristica terminam sem estado invalido", () => {
  let terminadas = 0;
  for (let s = 1; s <= 12; s++) {
    const estado = criarEstado(s, "medio");
    const rng = novoRng(s * 13 + 1);
    let guarda = 0;
    while (!estado.vencedor && guarda++ < 400) {
      jogarTurnoIA(estado, estado.jogadorAtual, rng);
      checarInvariantes(estado);
    }
    if (estado.vencedor) terminadas++;
  }
  assert.ok(terminadas >= 6, `poucas partidas terminaram: ${terminadas}`);
});

test("heuristica nunca perde para random e vence a maioria", () => {
  let vitoriasHeur = 0;
  let vitoriasRandom = 0;
  for (let s = 1; s <= 16; s++) {
    const estado = criarEstado(s, "medio");
    const rng = novoRng(s * 101 + 7);
    let guarda = 0;
    while (!estado.vencedor && guarda++ < 400) {
      if (estado.jogadorAtual === "vermelho") jogarTurnoIA(estado, "vermelho", rng);
      else turnoAleatorio(estado, "azul", rng);
    }
    if (estado.vencedor === "vermelho") vitoriasHeur++;
    if (estado.vencedor === "azul") vitoriasRandom++;
  }
  assert.equal(vitoriasRandom, 0, `random venceu ${vitoriasRandom} vezes`);
  assert.ok(vitoriasHeur >= 3, `heuristica venceu poucas: ${vitoriasHeur}`);
});
