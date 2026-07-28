import "./setup.js";
import test from "node:test";
import assert from "node:assert/strict";
import { criarEstado } from "../src/core/estado.js";
import { acoesLegais } from "../src/core/legais.js";
import { serializar, desserializar } from "../src/core/serializar.js";
import { checarInvariantes, jogarAleatorio } from "./jogar.js";

test("mapa gerado sempre tem caminho e camaras", () => {
  for (let s = 1; s <= 30; s++) {
    const estado = criarEstado(s, "medio");
    assert.equal(estado.unidades.filter((u) => u.tipo === "rainha").length, 2);
    assert.equal(estado.unidades.filter((u) => u.tipo === "operaria").length, 2);
  }
});

test("sempre existe ao menos uma acao legal", () => {
  const estado = criarEstado(7, "medio");
  jogarAleatorio(estado, 99, 300, (e) => {
    if (!e.vencedor) {
      const legais = acoesLegais(e, e.jogadorAtual);
      assert.ok(legais.length >= 1);
    }
  });
});

test("nenhuma acao legal produz estado invalido", () => {
  for (const s of [1, 2, 3, 5, 8, 13]) {
    const estado = criarEstado(s, "medio");
    jogarAleatorio(estado, s * 31 + 1, 500, (e) => checarInvariantes(e));
    checarInvariantes(estado);
  }
});

test("determinismo: mesma seed e acoes = hash identico", () => {
  const a = criarEstado(42, "medio");
  const b = criarEstado(42, "medio");
  jogarAleatorio(a, 777, 400);
  jogarAleatorio(b, 777, 400);
  assert.equal(JSON.stringify(serializar(a)), JSON.stringify(serializar(b)));
});

test("round-trip de save", () => {
  const estado = criarEstado(3, "dificil");
  jogarAleatorio(estado, 55, 150);
  const ida = serializar(estado);
  const volta = serializar(desserializar(ida));
  assert.equal(JSON.stringify(ida), JSON.stringify(volta));
});
