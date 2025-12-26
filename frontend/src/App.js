import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProductionProvider } from "./contexts/ProductionContext";
import RoleSelection from "./components/Auth/RoleSelection";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Navigation from "./components/Common/Navigation";
import QCManagerPanel from "./components/QC/QCManagerPanel";
import AdminDashboard from "./components/Admin/AdminDashboard";
import "./App.css";
import "semantic-ui-css/semantic.min.css";

function AppContent() {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <RoleSelection />;
  }

  return (
    <div className="app-container">
      <Navigation />
      <div className="main-content">
        <Routes>
          <Route
            path="/qc"
            element={
              <ProtectedRoute requiredRole="qcmanager">
                <QCManagerPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={<Navigate to={role === "admin" ? "/admin" : "/qc"} />}
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProductionProvider>
          <AppContent />
        </ProductionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
