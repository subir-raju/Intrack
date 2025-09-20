import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const DEMO_USERS = [
  {
    email: "admin@demo.com",
    password: "admiiin123",
    role: "admin",
    name: "Demo Admin",
  },
  {
    email: "qc@demo.com",
    password: "qc123",
    role: "qc_manager",
    name: "Demo QC",
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState(null);

  const login = (email, password) => {
    const found = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      localStorage.setItem("user", JSON.stringify(found));
      setUser(found);
      setError(null);
      return { success: true };
    } else {
      setError("Invalid email or password");
      return { success: false, message: "Invalid email or password" };
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const register = () => ({ success: false, message: "Registration disabled" });

  const value = {
    user,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isQCManager: user?.role === "qc_manager",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
