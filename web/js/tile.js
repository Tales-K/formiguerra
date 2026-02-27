// ─── Terrain config ──────────────────────────────────────────────────────────
export const TERRAIN = {
  plains: { color: "#7ec850", border: "#5a9a38", label: "Plains" },
  forest: { color: "#2d6a2d", border: "#1a4a1a", label: "Forest" },
  water: { color: "#2979b5", border: "#1a5a8a", label: "Water" },
  mountain: { color: "#8c7b6b", border: "#5c4f42", label: "Mountain" },
  desert: { color: "#d4a843", border: "#a07820", label: "Desert" },
  swamp: { color: "#4a6b3a", border: "#2a3d20", label: "Swamp" },
};

// ─── Layout constants ─────────────────────────────────────────────────────────
export const HEX_SIZE = 30; // circumradius in px
export const PADDING = 24; // canvas outer padding

// ─── Geometry helpers ─────────────────────────────────────────────────────────

/** Six corner points of a pointy-top hex centred at (cx, cy). */
export function hexCorners(cx, cy, size) {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    const rad = (Math.PI / 180) * (60 * i - 30);
    corners.push([cx + size * Math.cos(rad), cy + size * Math.sin(rad)]);
  }
  return corners;
}

/** Pixel centre of hex (col, row) using odd-r offset layout. */
export function hexToPixel(col, row, size = HEX_SIZE, padding = PADDING) {
  const w = Math.sqrt(3) * size;
  const x = padding + w * col + (row % 2 === 1 ? w / 2 : 0) + w / 2;
  const y = padding + 2 * size * 0.75 * row + size;
  return [x, y];
}

/**
 * Return true if pixel (px, py) is inside the convex hexagon
 * defined by the given corners array (winding order matters – CCW).
 */
function pointInConvexPolygon(px, py, corners) {
  for (let i = 0; i < corners.length; i++) {
    const [x1, y1] = corners[i];
    const [x2, y2] = corners[(i + 1) % corners.length];
    // Cross product; if < 0 the point is on the right side (outside for CCW).
    if ((x2 - x1) * (py - y1) - (y2 - y1) * (px - x1) < 0) return false;
  }
  return true;
}

/** Find the cell whose hex polygon contains the pixel point, or null. */
export function getCellAtPoint(px, py, cells) {
  for (const cell of cells) {
    const [cx, cy] = hexToPixel(cell.col, cell.row);
    const corners = hexCorners(cx, cy, HEX_SIZE - 1);
    if (pointInConvexPolygon(px, py, corners)) return cell;
  }
  return null;
}

/**
 * Return up to 6 neighbouring cells for a given cell using odd-r offset rules.
 * @param {object} cell      - the origin cell { col, row }
 * @param {Map}    cellById  - Map<id, cell> built from the full cells array
 */
export function getNeighborCells(cell, cellById) {
  const { col, row } = cell;
  const isOdd = row % 2 === 1;

  // Odd-r offset neighbour directions (pointy-top)
  const dirs = isOdd
    ? [
        [1, 0],
        [-1, 0],
        [0, -1],
        [1, -1],
        [0, 1],
        [1, 1],
      ]
    : [
        [1, 0],
        [-1, 0],
        [-1, -1],
        [0, -1],
        [-1, 1],
        [0, 1],
      ];

  const neighbors = [];
  for (const [dc, dr] of dirs) {
    const id = `${col + dc}:${row + dr}`;
    const n = cellById.get(id);
    if (n) neighbors.push(n);
  }
  return neighbors;
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

/**
 * Draw a single hex tile on the given canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object}           cell       - tile data from API
 * @param {boolean}          highlight  - true when the mouse is hovering
 * @param {boolean}          available  - true when this tile is a valid move target
 * @param {'valid'|'invalid'|false} placement - deployment-zone overlay
 */
export function drawTile(
  ctx,
  cell,
  highlight = false,
  available = false,
  placement = false,
) {
  const [cx, cy] = hexToPixel(cell.col, cell.row);
  const size = HEX_SIZE - 1;
  const terrain = TERRAIN[cell.type] || TERRAIN.plains;
  const corners = hexCorners(cx, cy, size);

  function tracePath() {
    ctx.beginPath();
    ctx.moveTo(corners[0][0], corners[0][1]);
    for (let i = 1; i < 6; i++) ctx.lineTo(corners[i][0], corners[i][1]);
    ctx.closePath();
  }

  // Base terrain fill
  tracePath();
  ctx.fillStyle = terrain.color;
  ctx.fill();
  ctx.strokeStyle = terrain.border;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Elevation darkening
  const darken = (6 - cell.elevation) * 8;
  if (darken > 0) {
    tracePath();
    ctx.fillStyle = `rgba(0,0,0,${darken / 255})`;
    ctx.fill();
  }

  // Deployment-zone overlay ('valid' = green, 'invalid' = red-tinted)
  if (placement === "valid") {
    tracePath();
    ctx.fillStyle = "rgba(0, 255, 130, 0.24)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 230, 100, 0.90)";
    ctx.lineWidth = 2.2;
    ctx.stroke();
  } else if (placement === "invalid") {
    tracePath();
    ctx.fillStyle = "rgba(255, 60, 60, 0.18)";
    ctx.fill();
  }

  // Available-move highlight (drawn before hover so hover wins on overlap)
  if (available) {
    tracePath();
    ctx.fillStyle = "rgba(255, 230, 50, 0.28)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 220, 30, 0.95)";
    ctx.lineWidth = 2.4;
    ctx.stroke();
  }

  // Hover highlight
  if (highlight) {
    tracePath();
    ctx.fillStyle = "rgba(255,255,255,0.20)";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }
}
