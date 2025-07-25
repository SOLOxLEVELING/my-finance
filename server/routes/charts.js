const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/charts/expenses-by-category/:userId
// Calculates total spending per category for a pie chart.
router.get("/expenses-by-category/:userId", async (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT
        c.name,
        -- We use ABS to get a positive value for the chart
        ABS(SUM(t.amount)) AS value
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.amount < 0 AND c.user_id = $1
    GROUP BY c.name
    HAVING SUM(t.amount) <> 0
    ORDER BY value DESC;
  `;
  // NEW - With Data Formatting
  try {
    const { rows } = await db.query(query, [userId]);

    // Convert 'value' from a string to a number for each category
    const formattedData = rows.map((row) => ({
      ...row,
      value: parseFloat(row.value),
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching expense chart data:", error);
    res.status(500).json({ message: "Failed to fetch chart data" });
  }
});

// GET /api/charts/monthly-summary/:accountId
// Calculates total income and expenses for each month for a bar chart.
router.get("/monthly-summary/:accountId", async (req, res) => {
  const { accountId } = req.params;
  const query = `
        SELECT
            -- Format the month as 'YYYY-MM'
            TO_CHAR(transaction_date, 'YYYY-MM') AS month,
            SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS income,
            -- We use ABS to get a positive value for expenses
            ABS(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END)) AS expenses
        FROM transactions
        WHERE account_id = $1
        GROUP BY month
        ORDER BY month ASC;
    `;
  try {
    const { rows } = await db.query(query, [accountId]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching monthly summary data:", error);
    res.status(500).json({ message: "Failed to fetch monthly data" });
  }
});

module.exports = router;
