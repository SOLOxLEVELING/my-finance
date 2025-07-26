// routes/rates.js
const express = require("express");
const router = express.Router();

// MOCKED DATA: I've updated the INR rate to be more accurate for today.
// In a real app, you would fetch this from a live API.
const MOCK_RATES = {
  USD: 1.0, // Base currency
  EUR: 0.92,
  GBP: 0.79,
  INR: 86.46, // <-- Updated from 83.45 to a more current rate
  JPY: 157.65,
};

router.get("/", (req, res) => {
  res.json({
    result: "success",
    rates: MOCK_RATES,
  });
});

module.exports = router;
