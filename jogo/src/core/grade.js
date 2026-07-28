export function indice(mapa, col, row) {
  return row * mapa.largura + col;
}

export function dentro(mapa, col, row) {
  return col >= 0 && col < mapa.largura && row >= 0 && row < mapa.altura;
}

export function tile(mapa, col, row) {
  if (!dentro(mapa, col, row)) return null;
  return mapa.tiles[indice(mapa, col, row)];
}

export function setTile(mapa, col, row, valor) {
  mapa.tiles[indice(mapa, col, row)] = valor;
}

export function todasCelulas(mapa) {
  const lista = [];
  for (let row = 0; row < mapa.altura; row++) {
    for (let col = 0; col < mapa.largura; col++) {
      lista.push([col, row]);
    }
  }
  return lista;
}
