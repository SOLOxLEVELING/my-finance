const express = require("express");
const db = require("../db");
const router = express.Router();

// This query joins categories, budgets, and transaction spending for a given month
const getBudgetQuery = `
  WITH user_categories AS (
    SELECT id, name FROM categories WHERE user_id = $1
  ),
  monthly_budgets AS (
    SELECT category_id, amount FROM budgets WHERE user_id = $1 AND month = $2
  ),
  monthly_spending AS (
    SELECT
      t.category_id,
      ABS(SUM(t.amount)) as spent
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE
      a.user_id = $1
      AND t.amount < 0
      AND DATE_TRUNC('month', t.transaction_date) = $2
    GROUP BY t.category_id
  )
  SELECT
    uc.id AS "categoryId",
    uc.name AS "categoryName",
    COALESCE(mb.amount, 0) AS "budgetAmount",
    COALESCE(ms.spent, 0) AS "spentAmount"
  FROM user_categories uc
  LEFT JOIN monthly_budgets mb ON uc.id = mb.category_id
  LEFT JOIN monthly_spending ms ON uc.id = ms.category_id
  ORDER BY uc.name;
`;

// GET /api/budgets/:userId/:month
// Fetches budget data (budgeted vs. spent) for a user and month (YYYY-MM-DD)
router.get("/:userId/:month", async (req, res) => {
  const { userId, month } = req.params; // month should be like '2025-07-01'
  try {
    const { rows } = await db.query(getBudgetQuery, [userId, month]);
    // Convert numeric types from string to number
    const formattedData = rows.map((row) => ({
      ...row,
      budgetAmount: parseFloat(row.budgetAmount),
      spentAmount: parseFloat(row.spentAmount),
    }));
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching budget data:", error);
    res.status(500).json({ message: "Failed to fetch budget data" });
  }
});

// POST /api/budgets
// Creates or updates a budget for a category (UPSERT)
router.post("/", async (req, res) => {
  const { userId, categoryId, amount, month } = req.body;
  const query = `
    INSERT INTO budgets (user_id, category_id, amount, month)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, category_id, month)
    DO UPDATE SET amount = EXCLUDED.amount
    RETURNING *;
  `;
  try {
    const { rows } = await db.query(query, [
      userId,
      categoryId,
      parseFloat(amount),
      month,
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error setting budget:", error);
    res.status(500).json({ message: "Failed to set budget" });
  }
});

module.exports = router;
