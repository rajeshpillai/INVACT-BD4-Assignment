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


// 2. Get Restaurant by ID
  async function fetchRestaurantById(id) {
    const query = 'SELECT * FROM restaurants WHERE id = ?';
    return await db.get(query, [id]);
  }

  app.get('/restaurants/details/:id', async (req, res) => {
    try {
      const restaurant = await fetchRestaurantById(req.params.id);
      restaurant
        ? res.json({ restaurant })
        : res.status(404).json({ error: 'Restaurant not found' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Get Restaurants by Cuisine
  async function fetchRestaurantsByCuisine(cuisine) {
    const query = 'SELECT * FROM restaurants WHERE LOWER(cuisine) = LOWER(?)';
    return await db.all(query, [cuisine]);
  }

  app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
    try {
      
      const restaurants = await fetchRestaurantsByCuisine(req.params.cuisine);
      res.json({ restaurants });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Get Restaurants by Filter
  async function fetchFilteredRestaurants(filters) {
    const { isVeg, hasOutdoorSeating, isLuxury } = filters;
    const query = `
      SELECT * FROM restaurants
      WHERE (? IS NULL OR isVeg = ?)
        AND (? IS NULL OR hasOutdoorSeating = ?)
        AND (? IS NULL OR isLuxury = ?)
    `;
    return await db.all(query, [isVeg, isVeg, hasOutdoorSeating, hasOutdoorSeating, isLuxury, isLuxury]);
  }

  app.get('/restaurants/filter', async (req, res) => {
    try {
      const restaurants = await fetchFilteredRestaurants(req.query);
      res.json({ restaurants });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Get Restaurants Sorted by Rating
  async function fetchRestaurantsSortedByRating() {
    const query = 'SELECT * FROM restaurants ORDER BY rating DESC';
    return await db.all(query);
  }

  app.get('/restaurants/sort-by-rating', async (req, res) => {
    try {
      const restaurants = await fetchRestaurantsSortedByRating();
      res.json({ restaurants });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Get All Dishes
  async function fetchAllDishes() {
    const query = 'SELECT * FROM dishes';
    return await db.all(query);
  }

  app.get('/dishes', async (req, res) => {
    try {
      const dishes = await fetchAllDishes();
      res.json({ dishes });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Get Dish by ID
  async function fetchDishById(id) {
    const query = 'SELECT * FROM dishes WHERE id = ?';
    return await db.get(query, [id]);
  }

  app.get('/dishes/details/:id', async (req, res) => {
    try {
      const dish = await fetchDishById(req.params.id);
      dish
        ? res.json({ dish })
        : res.status(404).json({ error: 'Dish not found' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Get Dishes by Filter
  async function fetchFilteredDishes(isVeg) {
    const query = 'SELECT * FROM dishes WHERE (? IS NULL OR isVeg = ?)';
    return await db.all(query, [isVeg, isVeg]);
  }

  app.get('/dishes/filter', async (req, res) => {
    try {
      const dishes = await fetchFilteredDishes(req.query.isVeg);
      res.json({ dishes });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Get Dishes Sorted by Price
  async function fetchDishesSortedByPrice() {
    const query = 'SELECT * FROM dishes ORDER BY price ASC';
    return await db.all(query);
  }

  app.get('/dishes/sort-by-price', async (req, res) => {
    try {
      const dishes = await fetchDishesSortedByPrice();
      res.json({ dishes });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
