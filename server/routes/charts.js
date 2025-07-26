const express = require("express");
const db = require("../db");
const authenticateToken = require("../middleware/authenticateToken");
const router = express.Router();

router.use(authenticateToken);

router.get("/expenses-by-category", async (req, res) => {
  const { userId } = req.user;
  const query = `
    SELECT
        COALESCE(c.name, 'Uncategorized') AS name,
        ABS(SUM(t.amount)) AS value
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE
        t.amount < 0 AND a.user_id = $1
    GROUP BY name
    HAVING ABS(SUM(t.amount)) > 0.01
    ORDER BY value DESC;
  `;
  try {
    const { rows } = await db.query(query, [userId]);
    const formattedData = rows.map((row) => ({
      ...row,
      value: parseFloat(row.value),
    }));
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching pie chart data:", error);
    res.status(500).json({ message: "Failed to fetch chart data" });
  }
});

router.get("/monthly-summary", async (req, res) => {
  const { accountId } = req.user;
  const query = `
      SELECT TO_CHAR(transaction_date, 'YYYY-MM') AS month,
             SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS income,
             ABS(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END)) AS expenses
      FROM transactions
      WHERE account_id = $1
      GROUP BY month ORDER BY month ASC;
    `;
  try {
    const { rows } = await db.query(query, [accountId]);

    // FIX: Convert string values from the database into numbers
    const formattedData = rows.map((row) => ({
      ...row,
      income: parseFloat(row.income),
      expenses: parseFloat(row.expenses),
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching bar chart data:", error);
    res.status(500).json({ message: "Failed to fetch monthly data" });
  }
});

module.exports = router;
