const express = require("express");
const db = require("../db");
const authenticateToken = require("../middleware/authenticateToken");
const axios = require("axios"); // To call the Python service
const router = express.Router();

router.use(authenticateToken);

router.get("/", async (req, res) => {
  const { userId } = req.user;
  const pythonServiceUrl = "http://localhost:5001/predict"; // <-- CHANGE THIS LINE

  try {
    // 1. Fetch historical data for the user from your database
    const history = await db.query(
      `SELECT transaction_date, amount FROM transactions
             WHERE account_id IN (SELECT id FROM accounts WHERE user_id = $1)
             AND amount < 0 ORDER BY transaction_date ASC`,
      [userId]
    );

    // 2. Call the Python ML service with the historical data
    const forecastResponse = await axios.post(pythonServiceUrl, {
      history: history.rows,
    });

    // 3. Send the forecast received from the Python service back to the frontend
    res.json(forecastResponse.data);
  } catch (error) {
    console.error("Forecast error:", error.message);
    res.status(500).json({ message: "Failed to generate forecast." });
  }
});

module.exports = router;
