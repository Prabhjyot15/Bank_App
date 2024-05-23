import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import UserDetailsPage from "./components/UserDetailsPage";
import { AuthProvider } from "./common/AuthContext";
import { PublicRoute } from "./common/PublicRoute";
import ProtectedRoute from "./common/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
    <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/details" element={<UserDetailsPage />} />
        </Route>
        <Route
          path="*"
          element={<Navigate to="/details" replace />}  // Default fallback to user details if no routes match
        />
      </Routes>
      </BrowserRouter>
      </AuthProvider>
  );
}

export default App;
