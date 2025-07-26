const express = require("express");
const db = require("../db");
const authenticateToken = require("../middleware/authenticateToken");
const router = express.Router();

router.use(authenticateToken);

// GET /api/categories/with-spending (Gets categories AND calculates spending)
router.get("/with-spending", async (req, res) => {
  const { userId } = req.user;
  const query = `
    SELECT
        c.id,
        c.name,
        COALESCE(SUM(t.amount), 0.00) AS "totalSpending"
    FROM categories c
    LEFT JOIN transactions t ON c.id = t.category_id
    WHERE c.user_id = $1
    GROUP BY c.id, c.name
    ORDER BY c.name;
  `;
  try {
    const { rows } = await db.query(query, [userId]);
    const formattedData = rows.map((row) => ({
      ...row,
      totalSpending: parseFloat(row.totalSpending),
    }));
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching categories with spending:", error);
    res.status(500).json({ message: "Failed to fetch category data" });
  }
});

// GET /api/categories (Gets all category names for the user)
router.get("/", async (req, res) => {
  const { userId } = req.user;
  try {
    const { rows } = await db.query(
      "SELECT * FROM categories WHERE user_id = $1 ORDER BY name",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// POST /api/categories (Creates a new category)
router.post("/", async (req, res) => {
  const { name } = req.body;
  const { userId } = req.user;
  if (!name) {
    return res.status(400).json({ message: "Category name is required." });
  }
  try {
    const { rows } = await db.query(
      "INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING *",
      [name, userId]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create category. It may already exist." });
  }
});

// PUT /api/categories/:id (Updates a category name)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const { userId } = req.user;
  if (!name) {
    return res.status(400).json({ message: "Category name is required." });
  }
  try {
    const { rows } = await db.query(
      "UPDATE categories SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [name, id, userId]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Category not found or permission denied." });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to update category." });
  }
});

// DELETE /api/categories/:id (Deletes a category)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  try {
    const result = await db.query(
      "DELETE FROM categories WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Category not found or permission denied." });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category." });
  }
});

module.exports = router;
