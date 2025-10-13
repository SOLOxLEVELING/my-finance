const axios = require("axios");

async function getLiveRates() {
  const apiKey = process.env.EXCHANGERATE_API_KEY;
  if (!apiKey) throw new Error("API key not configured.");
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
  const response = await axios.get(url);
  if (response.data?.result === "success") {
    return response.data.conversion_rates;
  }
  throw new Error("Failed to fetch exchange rates");
}

module.exports = { getLiveRates };
