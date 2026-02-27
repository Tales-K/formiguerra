// ─── Formiga Arqueira ─────────────────────────────────────────────────────────
export const type = "archer";
export const image = "public/arqueiromiga.png";
export const label = "Arqueira";

export const stats = {
  mov: 3,
  atk: 2,
  range: 2,
  def: 1,
  hp: 2,
  cost: 3,
};

export const abilities = [
  { id: "ranged", description: "Ataca à distância (alcance 2)." },
];
