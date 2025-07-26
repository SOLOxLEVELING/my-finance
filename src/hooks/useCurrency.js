// hooks/useCurrency.js
import { useAuth } from "../context/AuthContext";
import { useCurrencyRates } from "../context/CurrencyProvider";

export const useCurrency = () => {
  const { currency: userCurrency } = useAuth();
  const { rates, loading } = useCurrencyRates();

  const format = (valueInUsd) => {
    if (loading || !rates || typeof valueInUsd !== "number") {
      return "---"; // Or a loading spinner, etc.
    }

    const targetCurrency = userCurrency || "USD";
    const exchangeRate = rates[targetCurrency] || 1;
    const convertedValue = valueInUsd * exchangeRate;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: targetCurrency,
    }).format(convertedValue);
  };

  return { format, currency: userCurrency, loading };
};
