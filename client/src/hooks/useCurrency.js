// hooks/useCurrency.js
import { useAuth } from "../context/AuthContext";
import { useCurrencyRates } from "../context/CurrencyProvider";

export const useCurrency = () => {
  const { currency: userCurrency } = useAuth();
  const { rates, loading } = useCurrencyRates();
  const currency = userCurrency || "USD";

  const format = (valueInUsd) => {
    if (loading || !rates || typeof valueInUsd !== "number") {
      return "---"; // Or a loading spinner, etc.
    }

    const exchangeRate = rates[currency] || 1;
    const convertedValue = valueInUsd * exchangeRate;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(convertedValue);
  };

  // NEW: Get the currency symbol dynamically
  const symbol =
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value || "$";

  // Return the symbol along with the other values
  return { format, currency, loading, symbol };
};
