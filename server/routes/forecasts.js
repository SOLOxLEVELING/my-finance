const express = require("express");
const db = require("../db");
const authenticateToken = require("../middleware/authenticateToken");
const axios = require("axios"); // To call the Python service
const router = express.Router();

router.use(authenticateToken);

router.get("/", async (req, res) => {
  const { userId } = req.user;
  const pythonServiceUrl = "http://prediction-service:5001/predict";

  try {
    // --- FIX: The SQL query has been updated ---
    // It now joins with the 'categories' table to get the category name for each transaction.
    const historyQuery = `
      SELECT 
        t.transaction_date, 
        t.amount, 
        c.name AS category 
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.account_id IN (SELECT id FROM accounts WHERE user_id = $1)
      AND t.amount < 0 
      ORDER BY t.transaction_date ASC
    `;
    const history = await db.query(historyQuery, [userId]);
    // -------------------------------------------

    // Now, history.rows will contain objects like:
    // { transaction_date: '...', amount: '...', category: 'Subscription' }

    const forecastResponse = await axios.post(pythonServiceUrl, {
      history: history.rows,
    });

    res.json(forecastResponse.data);
  } catch (error) {
    console.error("Forecast error:", error.message);
    res.status(500).json({ message: "Failed to generate forecast." });
  }
});

module.exports = router;
