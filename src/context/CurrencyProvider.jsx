import React, { createContext, useState, useEffect, useContext } from "react";
import apiClient from "../api/axios";

const CurrencyContext = createContext();

export const useCurrencyRates = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await apiClient.get("/rates");
        setRates(response.data.rates);
      } catch (error) {
        console.error("Failed to fetch currency rates", error);
        // Fallback to USD only if rates fail
        setRates({ USD: 1.0 });
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  return (
    <CurrencyContext.Provider value={{ rates, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyProvider; // <-- Add this line
