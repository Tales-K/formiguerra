import { C, TERRA, ROCHA, CAMARA } from "./dados.js";
import { inteiro } from "./rng.js";
import { vizinhos } from "./hex.js";
import { indice, dentro, tile, setTile } from "./grade.js";

export function posicoesRainhas(mapa) {
  const meio = Math.floor(mapa.largura / 2);
  return {
    vermelho: [meio, mapa.altura - 2],
    azul: [meio, 1],
  };
}

function escavarCamara(mapa, col, row) {
  setTile(mapa, col, row, CAMARA);
  for (const [c, r] of vizinhos(col, row)) {
    if (dentro(mapa, c, r)) setTile(mapa, c, r, CAMARA);
  }
}

function espalharRocha(mapa, rng) {
  const total = mapa.largura * mapa.altura;
  const alvo = Math.floor(total * C().mapa.fracaoRocha);
  let postas = 0;
  let tentativas = 0;
  while (postas < alvo && tentativas < alvo * 40) {
    tentativas++;
    let col = inteiro(rng, mapa.largura);
    let row = inteiro(rng, mapa.altura);
    const tamanho = 3 + inteiro(rng, 5);
    for (let p = 0; p < tamanho && postas < alvo; p++) {
      if (tile(mapa, col, row) === TERRA) {
        setTile(mapa, col, row, ROCHA);
        postas++;
      }
      const vs = vizinhos(col, row).filter(([c, r]) => dentro(mapa, c, r));
      const [nc, nr] = vs[inteiro(rng, vs.length)];
      col = nc;
      row = nr;
    }
  }
}

function existeCaminho(mapa, origem, destino) {
  const visto = new Uint8Array(mapa.largura * mapa.altura);
  const fila = [origem];
  visto[indice(mapa, origem[0], origem[1])] = 1;
  while (fila.length) {
    const [col, row] = fila.pop();
    if (col === destino[0] && row === destino[1]) return true;
    for (const [c, r] of vizinhos(col, row)) {
      if (!dentro(mapa, c, r)) continue;
      const i = indice(mapa, c, r);
      if (visto[i]) continue;
      if (tile(mapa, c, r) === ROCHA) continue;
      visto[i] = 1;
      fila.push([c, r]);
    }
  }
  return false;
}

export function gerarMapa(rng) {
  const { largura, altura } = C().mapa;
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    const mapa = {
      largura,
      altura,
      tiles: new Array(largura * altura).fill(TERRA),
    };
    espalharRocha(mapa, rng);
    const rainhas = posicoesRainhas(mapa);
    escavarCamara(mapa, ...rainhas.vermelho);
    escavarCamara(mapa, ...rainhas.azul);
    if (existeCaminho(mapa, rainhas.vermelho, rainhas.azul)) {
      return { mapa, rainhas };
    }
  }
  throw new Error("não foi possível gerar mapa válido");
}
