import {
  HEX_SIZE,
  PADDING,
  hexToPixel,
  drawTile,
  getCellAtPoint,
  getNeighborCells,
} from "./tile.js";
import { drawAnt, ANT_DEFS, ANT_SIZE, preloadAntImages } from "./ant.js";
import {
  initSidebar,
  updatePR,
  renderAvailableAnts,
  setPlacingMode,
} from "./sidebar.js";
import { initZoom, screenToCanvas, handleWheel } from "./zoom.js";

const API_URL = "http://localhost:3001";
const START_PR = 8;

// ─── DOM ──────────────────────────────────────────────────────────────────────
const canvas = document.getElementById("hex-canvas");
const ctx = canvas.getContext("2d");
const newGameBtn = document.getElementById("new-game-btn");
const tooltip = document.getElementById("tooltip");
const mapArea = document.getElementById("map-area");
const hintEl = document.getElementById("placement-hint");

// ─── State ────────────────────────────────────────────────────────────────────
let gameState = null; // { map, ants[] }
let hoveredCell = null;
let selectedAnt = null; // ant being moved (existing ant)
let pendingPlacement = null; // ant from availableAnts being placed
let availableAnts = []; // bought but not yet placed
let pr = START_PR;
let cellById = new Map();
let _nextId = 0;

const freshId = () => `ant-${++_nextId}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function occupiedSet() {
  const s = new Set();
  for (const a of gameState?.ants ?? []) s.add(`${a.col}:${a.row}`);
  return s;
}

function reachableCells(ant) {
  const origin = cellById.get(`${ant.col}:${ant.row}`);
  if (!origin) return [];
  const occ = occupiedSet();
  return getNeighborCells(origin, cellById).filter((c) => !occ.has(c.id));
}

function getAntAtPoint(px, py) {
  for (const ant of gameState?.ants ?? []) {
    const [cx, cy] = hexToPixel(ant.col, ant.row);
    if (Math.hypot(px - cx, py - cy) <= ANT_SIZE) return ant;
  }
  return null;
}

function isPlaceable(cell) {
  if (!gameState) return false;
  const minRow = gameState.map.height - 2;
  return (
    cell.row >= minRow && cell.type !== "water" && !occupiedSet().has(cell.id)
  );
}

// ─── Rendering ────────────────────────────────────────────────────────────────
function canvasDimensions({ width, height }) {
  const w = Math.sqrt(3) * HEX_SIZE;
  const h = 2 * HEX_SIZE;
  return {
    width: Math.ceil(w * width + w / 2 + PADDING * 2),
    height: Math.ceil(h * 0.75 * height + h * 0.25 + PADDING * 2),
  };
}

function render() {
  if (!gameState) return;
  const { map } = gameState;
  const ants = gameState.ants ?? [];
  const reachable = selectedAnt
    ? new Set(reachableCells(selectedAnt).map((c) => c.id))
    : new Set();
  const { width, height } = canvasDimensions(map);

  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);

  const inPlacement = pendingPlacement !== null;
  const minRow = map.height - 2;

  for (const cell of map.cells) {
    let placement = false;
    if (inPlacement && cell.row >= minRow) {
      placement = isPlaceable(cell) ? "valid" : "invalid";
    }
    drawTile(
      ctx,
      cell,
      hoveredCell?.id === cell.id,
      reachable.has(cell.id),
      placement,
    );
  }

  for (const ant of ants) {
    const [cx, cy] = hexToPixel(ant.col, ant.row);
    drawAnt(ctx, ant, cx, cy, selectedAnt?.id === ant.id);
  }
}

// ─── Buy / Place callbacks ────────────────────────────────────────────────────
function onBuy(type) {
  const def = ANT_DEFS[type];
  if (!def || pr < def.stats.cost) return;
  pr -= def.stats.cost;
  updatePR(pr);
  const ant = { id: freshId(), type, owner: "player", col: 0, row: 0 };
  availableAnts.push(ant);
  renderAvailableAnts(availableAnts);
}

function onPlace(ant) {
  pendingPlacement = ant;
  setPlacingMode(true);
  hintEl.style.display = "block";
  render();
}

function exitPlacement() {
  pendingPlacement = null;
  setPlacingMode(false);
  hintEl.style.display = "none";
  render();
}

// ─── Canvas events ────────────────────────────────────────────────────────────
canvas.addEventListener("mousemove", (e) => {
  if (!gameState) return;
  const [px, py] = screenToCanvas(e.clientX, e.clientY);
  const cell = getCellAtPoint(px, py, gameState.map.cells);

  if (cell !== hoveredCell) {
    hoveredCell = cell;
    render();
  }

  if (cell) {
    tooltip.textContent = `${cell.type}  col:${cell.col} row:${cell.row}`;
    tooltip.style.display = "block";
    tooltip.style.left = e.clientX + 14 + "px";
    tooltip.style.top = e.clientY - 34 + "px";
    canvas.style.cursor = pendingPlacement
      ? isPlaceable(cell)
        ? "copy"
        : "not-allowed"
      : getAntAtPoint(px, py)?.owner === "player"
        ? "grab"
        : "crosshair";
  } else {
    tooltip.style.display = "none";
    canvas.style.cursor = "default";
  }
});

canvas.addEventListener("mouseleave", () => {
  hoveredCell = null;
  tooltip.style.display = "none";
  render();
});

canvas.addEventListener("click", (e) => {
  if (!gameState) return;
  const [px, py] = screenToCanvas(e.clientX, e.clientY);
  const cell = getCellAtPoint(px, py, gameState.map.cells);

  // ── Placement mode ──────────────────────────────────────────────────────────
  if (pendingPlacement) {
    if (cell && isPlaceable(cell)) {
      pendingPlacement.col = cell.col;
      pendingPlacement.row = cell.row;
      gameState.ants.push(pendingPlacement);
      availableAnts = availableAnts.filter((a) => a.id !== pendingPlacement.id);
      exitPlacement();
      renderAvailableAnts(availableAnts);
    } else {
      exitPlacement();
    }
    return;
  }

  // ── Move mode ───────────────────────────────────────────────────────────────
  if (!cell) {
    selectedAnt = null;
    render();
    return;
  }

  if (selectedAnt) {
    const target = reachableCells(selectedAnt).find((c) => c.id === cell.id);
    if (target) {
      selectedAnt.col = target.col;
      selectedAnt.row = target.row;
      selectedAnt = null;
      render();
      return;
    }
  }

  const ant = getAntAtPoint(px, py);
  selectedAnt =
    ant?.owner === "player" ? (selectedAnt?.id === ant.id ? null : ant) : null;
  render();
});

// ESC cancels placement
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && pendingPlacement) exitPlacement();
});

mapArea.addEventListener("wheel", handleWheel, { passive: false });

// ─── New Game ─────────────────────────────────────────────────────────────────
async function newGame() {
  newGameBtn.disabled = true;
  try {
    const res = await fetch(`${API_URL}/game`);
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const data = await res.json();

    gameState = { map: data.map, ants: [] }; // no ants at start
    hoveredCell = null;
    selectedAnt = null;
    pendingPlacement = null;
    availableAnts = [];
    pr = START_PR;
    cellById = new Map(data.map.cells.map((c) => [c.id, c]));

    hintEl.style.display = "none";
    updatePR(pr);
    renderAvailableAnts(availableAnts);
    render();
  } catch (err) {
    console.error("newGame error:", err);
  } finally {
    newGameBtn.disabled = false;
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
initZoom(canvas);
initSidebar(onBuy, onPlace);
preloadAntImages().then(() => render());
newGameBtn.addEventListener("click", newGame);
