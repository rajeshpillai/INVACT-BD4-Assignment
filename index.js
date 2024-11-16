const express = require('express');
const { resolve } = require('path');
let cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3010;

app.use(express.static('static'));
app.use(cors());

const { open } = require('sqlite');

let db;

(async () => {
  db = await open({
    filename: './database/database.sqlite',
    driver: sqlite3.Database,
  });

  console.log('Connected to SQLite database.');
})();

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

// 1. Get All Restaurants
async function fetchAllRestaurants() {
  const query = 'SELECT * FROM restaurants';
  return await db.all(query);
}

app.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await fetchAllRestaurants();
    res.json({ restaurants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
