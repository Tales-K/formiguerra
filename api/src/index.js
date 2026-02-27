const express = require('express');
const cors = require('cors');
const { createTile } = require('./tile');
const { generateAnts } = require('./ant');

const app = express();
const PORT = 3001;

const MAP_WIDTH  = 18;
const MAP_HEIGHT = 16;

function generateMap() {
  const cells = [];
  for (let row = 0; row < MAP_HEIGHT; row++) {
    for (let col = 0; col < MAP_WIDTH; col++) {
      cells.push(createTile(col, row));
    }
  }
  return { width: MAP_WIDTH, height: MAP_HEIGHT, cells };
}

app.use(cors());
app.use(express.json());

app.get('/game', (req, res) => {
  const map  = generateMap();
  const ants = generateAnts(MAP_WIDTH, MAP_HEIGHT);
  res.json({ map, ants });
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
