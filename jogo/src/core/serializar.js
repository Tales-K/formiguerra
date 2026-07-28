function rleCodificar(arr) {
  const saida = [];
  let i = 0;
  while (i < arr.length) {
    let j = i + 1;
    while (j < arr.length && arr[j] === arr[i]) j++;
    saida.push(arr[i], j - i);
    i = j;
  }
  return saida;
}

function rleDecodificar(rle) {
  const arr = [];
  for (let i = 0; i < rle.length; i += 2) {
    for (let c = 0; c < rle[i + 1]; c++) arr.push(rle[i]);
  }
  return arr;
}

export function serializar(estado) {
  return {
    versaoSchema: estado.versaoSchema,
    seed: estado.seed,
    dificuldade: estado.dificuldade,
    turno: estado.turno,
    jogadorAtual: estado.jogadorAtual,
    proximoId: estado.proximoId,
    rngEstado: estado.rng.estado,
    mapa: {
      largura: estado.mapa.largura,
      altura: estado.mapa.altura,
      tiles: rleCodificar(estado.mapa.tiles),
      donos: rleCodificar(estado.mapa.donos),
    },
    unidades: estado.unidades.map((u) => ({
      id: u.id,
      tipo: u.tipo,
      dono: u.dono,
      col: u.col,
      row: u.row,
      vida: u.vida,
      defendendo: u.defendendo,
      moveu: u.moveu,
      agiu: u.agiu,
    })),
    armadilhas: estado.armadilhas.map((a) => ({
      id: a.id,
      dono: a.dono,
      col: a.col,
      row: a.row,
    })),
    biomassa: { vermelho: estado.biomassa.vermelho, azul: estado.biomassa.azul },
    produziu: { vermelho: estado.produziu.vermelho, azul: estado.produziu.azul },
    nevoa: {
      vermelho: rleCodificar(estado.nevoa.vermelho),
      azul: rleCodificar(estado.nevoa.azul),
    },
    rainhas: { vermelho: estado.rainhas.vermelho, azul: estado.rainhas.azul },
    vencedor: estado.vencedor,
    historico: estado.historico,
  };
}

export function desserializar(dados) {
  return {
    versaoSchema: dados.versaoSchema,
    seed: dados.seed,
    dificuldade: dados.dificuldade,
    turno: dados.turno,
    jogadorAtual: dados.jogadorAtual,
    proximoId: dados.proximoId,
    rng: { estado: dados.rngEstado },
    mapa: {
      largura: dados.mapa.largura,
      altura: dados.mapa.altura,
      tiles: rleDecodificar(dados.mapa.tiles),
      donos: rleDecodificar(dados.mapa.donos),
    },
    unidades: dados.unidades.map((u) => ({ ...u })),
    armadilhas: dados.armadilhas.map((a) => ({ ...a })),
    biomassa: { ...dados.biomassa },
    produziu: { ...dados.produziu },
    nevoa: {
      vermelho: rleDecodificar(dados.nevoa.vermelho),
      azul: rleDecodificar(dados.nevoa.azul),
    },
    rainhas: { vermelho: dados.rainhas.vermelho, azul: dados.rainhas.azul },
    vencedor: dados.vencedor,
    historico: dados.historico,
  };
}
