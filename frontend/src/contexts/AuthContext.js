import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// Hard-coded demo users for development
const DEMO_USERS = {
  admin: {
    email: "admin@intrack.com",
    password: "admin123",
    role: "admin",
    name: "Admin User",
    id: 1,
  },
  qc: {
    email: "qc@intrack.com",
    password: "qc123",
    role: "qc_manager",
    name: "QC Manager",
    id: 2,
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("intrack-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = (email, password) => {
    setLoading(true);
    setError(null);

    // Simulate API delay
    setTimeout(() => {
      const foundUser = Object.values(DEMO_USERS).find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        sessionStorage.setItem("intrack-user", JSON.stringify(foundUser));
        sessionStorage.setItem("intrack-token", "demo-token-" + foundUser.id);
        setUser(foundUser);
        setLoading(false);
        return { success: true, user: foundUser };
      } else {
        setError("Invalid email or password");
        setLoading(false);
        return { success: false, message: "Invalid email or password" };
      }
    }, 500);
  };

  const logout = () => {
    sessionStorage.removeItem("intrack-user");
    sessionStorage.removeItem("intrack-token");
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    error,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    role: user?.role,
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
