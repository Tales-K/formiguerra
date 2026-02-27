import { ANT_DEFS } from "./ant.js";

// ─── Callbacks wired by main.js ───────────────────────────────────────────────
let _onBuy = null; // (type: string) => void
let _onPlace = null; // (ant: object)  => void

export function initSidebar(onBuy, onPlace) {
  _onBuy = onBuy;
  _onPlace = onPlace;
  _buildStore();
}

// ─── PR display ───────────────────────────────────────────────────────────────
export function updatePR(pr) {
  document.getElementById("pr-count").textContent = pr;
  document.querySelectorAll(".buy-btn").forEach((btn) => {
    const cost = parseInt(btn.closest(".store-card").dataset.cost, 10);
    btn.disabled = pr < cost;
  });
}

// ─── Available ants (bought, awaiting placement) ──────────────────────────────
export function renderAvailableAnts(ants) {
  const container = document.getElementById("available-ants");
  container.innerHTML = "";

  if (ants.length === 0) {
    const msg = document.createElement("p");
    msg.className = "sidebar-empty";
    msg.textContent = "Compre formigas na loja.";
    container.appendChild(msg);
    return;
  }

  for (const ant of ants) {
    const def = ANT_DEFS[ant.type];
    const card = document.createElement("div");
    card.className = "avail-card";

    const img = document.createElement("img");
    img.src = def.image;
    img.alt = def.label;

    const name = document.createElement("span");
    name.textContent = def.label;

    const btn = document.createElement("button");
    btn.className = "place-btn";
    btn.textContent = "Posicionar";
    btn.dataset.antId = ant.id;
    btn.addEventListener("click", () => _onPlace(ant));

    card.append(img, name, btn);
    container.appendChild(card);
  }
}

// ─── Placement mode visual feedback ──────────────────────────────────────────
export function setPlacingMode(active) {
  document.getElementById("sidebar").dataset.placing = active ? "1" : "0";
  // Disable all place buttons while one ant is already being placed
  document.querySelectorAll(".place-btn").forEach((btn) => {
    btn.disabled = active;
  });
}

// ─── Store ────────────────────────────────────────────────────────────────────
function _buildStore() {
  const container = document.getElementById("store-cards");
  container.innerHTML = "";

  for (const [type, def] of Object.entries(ANT_DEFS)) {
    const card = document.createElement("div");
    card.className = "store-card";
    card.dataset.cost = def.stats.cost;
    card.dataset.type = type;

    const img = document.createElement("img");
    img.src = def.image;
    img.alt = def.label;

    const info = document.createElement("div");
    info.className = "store-info";

    const name = document.createElement("span");
    name.className = "store-name";
    name.textContent = def.label;

    const stats = document.createElement("span");
    stats.className = "store-stats";
    const s = def.stats;
    stats.textContent = `MOV${s.mov} ATK${s.atk} DEF${s.def} HP${s.hp}`;

    const cost = document.createElement("span");
    cost.className = "store-cost";
    cost.textContent = `${def.stats.cost} PR`;

    const btn = document.createElement("button");
    btn.className = "buy-btn";
    btn.textContent = "Comprar";
    btn.addEventListener("click", () => _onBuy(type));

    info.append(name, stats, cost);
    card.append(img, info, btn);
    container.appendChild(card);
  }
}
