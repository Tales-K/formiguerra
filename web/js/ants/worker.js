// ─── Formiga Escaravelho Montado (Besouromiga) ────────────────────────────────
export const type = "worker";
export const image = "public/besouromiga.png";
export const label = "Escaravelho";

export const stats = {
  mov: 4,
  atk: 3,
  def: 1,
  hp: 3,
  cost: 4,
};

export const abilities = [
  {
    id: "charge",
    description:
      "Investida: +2 ATK ao mover 3+ hex em linha reta antes de atacar.",
  },
];
