import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const simulateLogin = useCallback((selectedRole) => {
    setLoading(true);
    try {
      // Simulate user data based on role
      const userData = {
        id: Math.floor(Math.random() * 1000),
        name: selectedRole === "admin" ? "Admin User" : "QC Manager",
        email: `${selectedRole}@intrack.local`,
        role: selectedRole,
        productionLineId:
          selectedRole === "admin" ? null : Math.floor(Math.random() * 5) + 1,
      };

      // Simulate token (in real app, this comes from backend)
      const fakeToken = `fake_token_${Date.now()}`;

      localStorage.setItem("token", fakeToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("role", selectedRole);

      setUser(userData);
      setRole(selectedRole);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    user,
    isAuthenticated,
    role,
    loading,
    simulateLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
