import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import "./App.css";

import { ProductionProvider } from "./contexts/ProductionContext";
import { AuthProvider } from "./contexts/AuthContext";

import Navigation from "./components/Navigation/Navigation";
import QCManagerPanel from "./components/QCManager/QCManagerPanel";
import AdminDashboard from "./components/Admin/AdminDashboard";
import Login from "./components/Auth/Login";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <ProductionProvider>
        <Router>
          <div className="App">
            <Navigation />
            <Container style={{ marginTop: "7em" }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/qc-manager"
                  element={
                    <ProtectedRoute requiredRole="qc_manager">
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
                  element={
                    <ProtectedRoute>
                      <QCManagerPanel />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Container>
          </div>
        </Router>
      </ProductionProvider>
    </AuthProvider>
  );
}

export default App;
