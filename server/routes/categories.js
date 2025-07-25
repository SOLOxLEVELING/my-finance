const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/categories/:userId
// Fetches all categories for a specific user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await db.query(
      "SELECT * FROM categories WHERE user_id = $1 ORDER BY name",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// POST /api/categories
// Creates a new category for a user
router.post("/", async (req, res) => {
  const { name, userId } = req.body;
  if (!name || !userId) {
    return res
      .status(400)
      .json({ message: "Category name and userId are required." });
  }
  try {
    const { rows } = await db.query(
      "INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING *",
      [name, userId]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating category:", error);
    res
      .status(500)
      .json({ message: "Failed to create category. It may already exist." });
  }
});

module.exports = router;
