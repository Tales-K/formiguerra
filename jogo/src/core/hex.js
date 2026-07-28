const DIRECOES_PAR = [
  [1, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1],
];
const DIRECOES_IMPAR = [
  [1, 0], [1, -1], [0, -1], [-1, 0], [0, 1], [1, 1],
];

export function vizinhos(col, row) {
  const dirs = row % 2 === 0 ? DIRECOES_PAR : DIRECOES_IMPAR;
  return dirs.map(([dc, dr]) => [col + dc, row + dr]);
}

export function offsetParaCubo(col, row) {
  const x = col - (row - (row & 1)) / 2;
  const z = row;
  const y = -x - z;
  return [x, y, z];
}

export function distancia(c1, r1, c2, r2) {
  const [ax, ay, az] = offsetParaCubo(c1, r1);
  const [bx, by, bz] = offsetParaCubo(c2, r2);
  return (Math.abs(ax - bx) + Math.abs(ay - by) + Math.abs(az - bz)) / 2;
}

function cuboParaOffset(x, z) {
  const col = x + (z - (z & 1)) / 2;
  return [col, z];
}

function arredondarCubo(x, y, z) {
  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);
  const dx = Math.abs(rx - x);
  const dy = Math.abs(ry - y);
  const dz = Math.abs(rz - z);
  if (dx > dy && dx > dz) rx = -ry - rz;
  else if (dy > dz) ry = -rx - rz;
  else rz = -rx - ry;
  return [rx, ry, rz];
}

function linhaCanonica(c1, r1, c2, r2) {
  const [ax, ay, az] = offsetParaCubo(c1, r1);
  const [bx, by, bz] = offsetParaCubo(c2, r2);
  const n = distancia(c1, r1, c2, r2);
  if (n === 0) return [[c1, r1]];
  const ex = 1e-6, ey = 1e-6, ez = -2e-6;
  const passos = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = ax + ex + (bx - ax) * t;
    const y = ay + ey + (by - ay) * t;
    const z = az + ez + (bz - az) * t;
    const [rx, , rz] = arredondarCubo(x, y, z);
    passos.push(cuboParaOffset(rx, rz));
  }
  return passos;
}

export function linha(c1, r1, c2, r2) {
  if (c1 > c2 || (c1 === c2 && r1 > r2)) {
    return linhaCanonica(c2, r2, c1, r1).reverse();
  }
  return linhaCanonica(c1, r1, c2, r2);
}

const RAIZ3 = Math.sqrt(3);

export function hexParaPixel(col, row, tamanho) {
  const x = tamanho * RAIZ3 * (col + 0.5 * (row & 1));
  const y = tamanho * 1.5 * row;
  return [x, y];
}
