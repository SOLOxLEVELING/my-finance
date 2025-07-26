const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  const apiKey = process.env.EXCHANGERATE_API_KEY;
  if (!apiKey) {
    console.error("ExchangeRate API key not found in .env file.");
    return res.status(500).json({ message: "API key not configured." });
  }

  const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

  try {
    const response = await axios.get(apiUrl);

    if (response.data && response.data.result === "success") {
      let rates = response.data.conversion_rates;

      // ✅ Normalize if API returns per 100 USD instead of per 1 USD
      if (rates.INR && rates.INR > 500) {
        for (const key in rates) {
          rates[key] = rates[key] / 100;
        }
      }

      res.json({ result: "success", rates });
    } else {
      console.error(
        "ExchangeRate-API returned an error:",
        response.data["error-type"]
      );
      res.status(502).json({ message: "Failed to retrieve rates." });
    }
  } catch (error) {
    console.error("Error calling currency API:", error.message);
    res.status(502).json({ message: "Failed to fetch currency rates." });
  }
});

module.exports = router;
