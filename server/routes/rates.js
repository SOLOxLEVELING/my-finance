// routes/rates.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  // Read your secret API key from the environment variable
  const apiKey = process.env.EXCHANGERATE_API_KEY;

  if (!apiKey) {
    // This error helps you know if the key is missing in your setup
    console.error("ExchangeRate API key not found in .env file.");
    return res
      .status(500)
      .json({ message: "API key for currency conversion is not configured." });
  }

  const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

  try {
    const response = await axios.get(apiUrl);

    // Check if the external API call was successful
    if (response.data && response.data.result === "success") {
      // Send the live rates to the frontend
      res.json({
        result: "success",
        rates: response.data.conversion_rates,
      });
    } else {
      // Handle cases where the API service returns an error
      console.error(
        "ExchangeRate-API returned an error:",
        response.data["error-type"]
      );
      res
        .status(502)
        .json({
          message: "Failed to retrieve rates from the currency provider.",
        });
    }
  } catch (error) {
    console.error("Error calling the currency exchange API:", error.message);
    res
      .status(502)
      .json({
        message: "An error occurred while fetching live currency rates.",
      });
  }
});

module.exports = router;
