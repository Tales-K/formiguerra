const ANT_TYPES = ['worker', 'mage', 'fighter', 'knight', 'archer'];

let _nextId = 1;

function randomAntType() {
  return ANT_TYPES[Math.floor(Math.random() * ANT_TYPES.length)];
}

/**
 * Create a single ant entity.
 * @param {'computer'|'player'} owner
 * @param {string} type  - One of ANT_TYPES
 * @param {number} col
 * @param {number} row
 */
function createAnt(owner, type, col, row) {
  return {
    id: `ant-${_nextId++}`,
    owner,
    type,
    col,
    row,
  };
}

/**
 * Generate 10 ants per side placed in the first/last two rows.
 * Positions are unique per row set.
 * @param {number} mapWidth
 * @param {number} mapHeight
 */
function generateAnts(mapWidth, mapHeight) {
  _nextId = 1;

  function uniquePositions(rows, count) {
    const available = [];
    for (const row of rows) {
      for (let col = 0; col < mapWidth; col++) {
        available.push({ col, row });
      }
    }
    // Fisher-Yates shuffle
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }
    return available.slice(0, count);
  }

  const ants = [];

  for (const pos of uniquePositions([0, 1], 10)) {
    ants.push(createAnt('computer', randomAntType(), pos.col, pos.row));
  }

  for (const pos of uniquePositions([mapHeight - 2, mapHeight - 1], 10)) {
    ants.push(createAnt('player', randomAntType(), pos.col, pos.row));
  }

  return ants;
}

module.exports = { createAnt, generateAnts, ANT_TYPES };
