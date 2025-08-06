import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const accountId = localStorage.getItem("accountId");
    const currency = localStorage.getItem("currency");
    return token
      ? { token, userId, accountId, currency: currency || "USD" }
      : null;
  });

  // NEW: Add a state that we can change to trigger updates
  const [dataVersion, setDataVersion] = useState(1);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("accountId", data.accountId);
    localStorage.setItem("currency", data.currency);
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("accountId");
    localStorage.removeItem("currency");
    setAuth(null);
  };

  const updateUserCurrency = (newCurrency) => {
    localStorage.setItem("currency", newCurrency);
    setAuth((prev) => ({ ...prev, currency: newCurrency }));
    refreshData(); // Refresh data when currency changes
  };

  // NEW: This function will be called to signal that data should be re-fetched
  const refreshData = () => setDataVersion((v) => v + 1);

  const value = {
    isAuthenticated: !!auth,
    ...auth,
    login,
    logout,
    updateUserCurrency,
    refreshData,
    dataVersion,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
