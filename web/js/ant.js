// ─── Ant type definitions (one file per type) ─────────────────────────────────
import * as _worker from "./ants/worker.js";
import * as _mage from "./ants/mage.js";
import * as _fighter from "./ants/fighter.js";
import * as _knight from "./ants/knight.js";
import * as _archer from "./ants/archer.js";

/** Full definition for each ant type, keyed by type id. */
export const ANT_DEFS = Object.fromEntries(
  [_worker, _mage, _fighter, _knight, _archer].map((d) => [d.type, d]),
);

export const ANT_TYPES = Object.keys(ANT_DEFS);

export const ANT_IMAGES = Object.fromEntries(
  Object.entries(ANT_DEFS).map(([t, d]) => [t, d.image]),
);

export const ANT_SIZE = 30; // base draw size in px

// ─── Image preloading ─────────────────────────────────────────────────────────
const _imageCache = new Map(); // type → HTMLImageElement

export function preloadAntImages() {
  return Promise.all(
    Object.entries(ANT_IMAGES).map(
      ([type, src]) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            _imageCache.set(type, img);
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load ant image: ${src}`);
            resolve();
          };
          img.src = src;
        }),
    ),
  );
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

/**
 * Draw an ant's image at the given canvas centre position.
 * The image is scaled proportionally to fit within size×size pixels.
 * Owner badge is drawn BELOW the image so the image is always on top.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object}  ant      - ant data { type, owner, ... }
 * @param {number}  cx       - pixel centre x
 * @param {number}  cy       - pixel centre y
 * @param {boolean} selected - draw selection ring
 * @param {number}  size     - bounding box size (px); image fits within size×size
 */
export function drawAnt(ctx, ant, cx, cy, selected = false, size = ANT_SIZE) {
  ctx.save();

  // Selection glow (drawn first, outermost)
  if (selected) {
    ctx.beginPath();
    ctx.arc(cx, cy, size * 1.1, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffe066";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Owner badge circle (behind image)
  const badgeR = size * 0.72;
  ctx.beginPath();
  ctx.arc(cx, cy, badgeR, 0, Math.PI * 2);
  ctx.fillStyle =
    ant.owner === "computer"
      ? "rgba(30, 80, 220, 0.55)"
      : "rgba(30, 180, 70, 0.55)";
  ctx.fill();
  ctx.strokeStyle =
    ant.owner === "computer"
      ? "rgba(100, 160, 255, 0.95)"
      : "rgba(70, 220, 100, 0.95)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Ant image — proportionally scaled to fit size×size, centred at (cx, cy)
  const img = _imageCache.get(ant.type);
  if (img && img.naturalWidth > 0) {
    const aspect = img.naturalWidth / img.naturalHeight;
    let drawW, drawH;
    if (aspect >= 1) {
      drawW = size;
      drawH = size / aspect;
    } else {
      drawH = size;
      drawW = size * aspect;
    }
    ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
  }

  ctx.restore();
}
