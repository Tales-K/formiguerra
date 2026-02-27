// ─── Map zoom (CSS-transform based) ──────────────────────────────────────────
// Canvas CSS transform: scale(zoom) / transform-origin: top left.
// The overflow:auto on #map-area provides free scrolling at any zoom level.

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3.0;
const ZOOM_FACTOR = 0.12;

let _zoom = 1.0;
let _canvas = null;

export function initZoom(canvas) {
  _canvas = canvas;
  _apply();
}

export function getZoom() {
  return _zoom;
}

/**
 * Convert a screen-space mouse position to logical canvas coordinates.
 * Works because getBoundingClientRect() already returns the post-scale rect,
 * so dividing by zoom reverses the CSS scale back to canvas px.
 */
export function screenToCanvas(screenX, screenY) {
  const rect = _canvas.getBoundingClientRect();
  return [(screenX - rect.left) / _zoom, (screenY - rect.top) / _zoom];
}

/** Attach to the map-area element with { passive: false }. */
export function handleWheel(e) {
  e.preventDefault();
  const delta = e.deltaY < 0 ? ZOOM_FACTOR : -ZOOM_FACTOR;
  _zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, _zoom + delta));
  _apply();
}

function _apply() {
  if (!_canvas) return;
  _canvas.style.transformOrigin = "top left";
  _canvas.style.transform = `scale(${_zoom})`;
}
