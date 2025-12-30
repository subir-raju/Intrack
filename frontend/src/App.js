import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProductionProvider } from "./contexts/ProductionContext";
import RoleSelection from "./components/Auth/RoleSelection";
import Login from "./components/Auth/Login";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Navigation from "./components/Common/Navigation";
import QCManagerPanel from "./components/QC/QCManagerPanel";
import AdminDashboard from "./components/Admin/AdminDashboard";
import "./App.css";
import "semantic-ui-css/semantic.min.css";

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<RoleSelection />} />

      {/* Login Routes */}
      {/* Login Routes - with role parameter */}
      <Route path="/login/:role" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <div>
              <Navigation />
              <AdminDashboard />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/qc"
        element={
          <ProtectedRoute requiredRole="qc_manager">
            <div>
              <Navigation />
              <QCManagerPanel />
            </div>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
