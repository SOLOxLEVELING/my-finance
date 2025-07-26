const express = require("express");
const db = require("../db");
const authenticateToken = require("../middleware/authenticateToken");
const router = express.Router();

router.use(authenticateToken);

// This new route gets categories AND calculates total spending in each
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

// This route just gets the category names, used for dropdowns
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

// This route creates a new category
router.post("/", async (req, res) => {
  const { name } = req.body;
  const { userId } = req.user;
  if (!name || !userId) {
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

module.exports = router;
