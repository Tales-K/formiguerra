import "./setup.js";
import test from "node:test";
import assert from "node:assert/strict";
import { distancia, vizinhos } from "../src/core/hex.js";
import { temLinhaVisao } from "../src/core/visao.js";
import { TERRA, TUNEL } from "../src/core/dados.js";

test("distancia contra tabela conhecida", () => {
  assert.equal(distancia(0, 0, 0, 0), 0);
  for (const [c, r] of vizinhos(3, 3)) {
    assert.equal(distancia(3, 3, c, r), 1);
  }
  assert.equal(distancia(0, 0, 0, 2), 2);
});

test("simetria de linha de visao em 1000 pares", () => {
  const mapa = { largura: 15, altura: 19, tiles: new Array(15 * 19).fill(TUNEL) };
  for (let i = 0; i < mapa.tiles.length; i++) {
    if ((i * 7 + 3) % 5 === 0) mapa.tiles[i] = TERRA;
  }
  let seed = 12345;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let n = 0; n < 1000; n++) {
    const c1 = Math.floor(rnd() * 15);
    const r1 = Math.floor(rnd() * 19);
    const c2 = Math.floor(rnd() * 15);
    const r2 = Math.floor(rnd() * 19);
    const ab = temLinhaVisao(mapa, c1, r1, c2, r2);
    const ba = temLinhaVisao(mapa, c2, r2, c1, r1);
    assert.equal(ab, ba, `assimetria em (${c1},${r1})-(${c2},${r2})`);
  }
});
