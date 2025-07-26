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
        console.log("Fetched rates:", response.data);
        setRates(response.data.rates);
      } catch (err) {
        console.error("Rates fetch failed:", err);
        setRates(null);
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
