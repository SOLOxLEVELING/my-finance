// context/AuthContext.jsx
import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const accountId = localStorage.getItem("accountId");
    const currency = localStorage.getItem("currency"); // Get currency
    return token
      ? { token, userId, accountId, currency: currency || "USD" }
      : null;
  });

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("accountId", data.accountId);
    localStorage.setItem("currency", data.currency); // Set currency
    setAuth(data);
  };

  const logout = () => {
    // ... remove all items
    localStorage.removeItem("currency");
    setAuth(null);
  };

  // New function to update currency in the app state
  const updateUserCurrency = (newCurrency) => {
    localStorage.setItem("currency", newCurrency);
    setAuth((prev) => ({ ...prev, currency: newCurrency }));
  };

  const value = {
    isAuthenticated: !!auth,
    ...auth,
    login,
    logout,
    updateUserCurrency,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
