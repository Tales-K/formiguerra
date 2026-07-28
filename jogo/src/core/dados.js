let CONST = null;

export function setConstantes(obj) {
  CONST = obj;
}

export function C() {
  if (!CONST) throw new Error("constantes não carregadas");
  return CONST;
}

export const TERRA = 0;
export const ROCHA = 1;
export const TUNEL = 2;
export const CAMARA = 3;

export const DESCONHECIDO = 0;
export const EXPLORADO = 1;
export const VISIVEL = 2;

export const PASSAVEL = new Set([TUNEL, CAMARA]);
export const BLOQUEIA_VISAO = new Set([TERRA, ROCHA]);
export const ESCAVAVEL = new Set([TERRA]);

export const VERMELHO = "vermelho";
export const AZUL = "azul";

export function inimigo(dono) {
  return dono === VERMELHO ? AZUL : VERMELHO;
}
