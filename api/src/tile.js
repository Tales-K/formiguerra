const TERRAIN_TYPES = ['plains', 'forest', 'water', 'mountain', 'desert', 'swamp'];

function randomTerrain() {
  const rand = Math.random();
  if (rand < 0.30) return 'plains';
  if (rand < 0.50) return 'forest';
  if (rand < 0.65) return 'water';
  if (rand < 0.78) return 'mountain';
  if (rand < 0.89) return 'desert';
  return 'swamp';
}

/**
 * Create a single hex tile.
 * @param {number} col  - Column index (offset coordinates)
 * @param {number} row  - Row index (offset coordinates)
 * @param {number} mapHeight - Total map height (used to tag player/computer zones)
 */
function createTile(col, row) {
  // Convert odd-r offset to axial coordinates
  const q = col - Math.floor(row / 2);
  const r = row;

  return {
    id: `${col}:${row}`,
    col,
    row,
    q,
    r,
    type: randomTerrain(),
    elevation: Math.floor(Math.random() * 5) + 1,
  };
}

module.exports = { createTile, TERRAIN_TYPES };
