import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const accountId = localStorage.getItem("accountId");
    return token ? { token, userId, accountId } : null;
  });

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("accountId", data.accountId);
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("accountId");
    setAuth(null);
  };

  const value = { isAuthenticated: !!auth, ...auth, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
