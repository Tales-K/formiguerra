// ─── Formiga Paladina ─────────────────────────────────────────────────────────
export const type = "knight";
export const image = "public/paladinomiga.png";
export const label = "Paladina";

export const stats = {
  mov: 2,
  atk: 3,
  def: 3,
  hp: 4,
  cost: 5,
};

export const abilities = [
  { id: "aura_def", description: "+1 DEF para formigas aliadas adjacentes." },
];
