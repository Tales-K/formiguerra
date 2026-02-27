// ─── Formiga Maga ─────────────────────────────────────────────────────────────
export const type = "mage";
export const image = "public/magomiga.png";
export const label = "Maga";

export const stats = {
  mov: 2,
  atk: 3,
  def: 1,
  hp: 2,
  cost: 4,
};

export const abilities = [
  { id: "magic_atk", description: "Ataque mágico (ignora DEF física)." },
  {
    id: "acid_burst",
    description: "Explosão Ácida: dano em área leve ao redor do alvo.",
  },
];
