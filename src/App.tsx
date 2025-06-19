import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { validateToken, fetchUserProfile } from "./store/authStore";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Categories from "./pages/Categories";
import CarouselAdmin from "./components/CarouselAdmin";
import { useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store/store";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const dispatch: AppDispatch = useDispatch();
  const [authInitialized, setAuthInitialized] = useState(false); 

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await dispatch(validateToken()).unwrap();
          await dispatch(fetchUserProfile()).unwrap();
        } catch (error) {
          console.error("Token validation failed:", error);
          localStorage.removeItem("token");
        }
      }
      setAuthInitialized(true); 
    };

    initializeAuth();
  }, [dispatch]);

  if (!authInitialized) {
    return <div>Chargement...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="support" element={<Support />} />
          <Route path="settings" element={<Settings />} />
          <Route path="users" element={<Users />} />
          <Route path="carousel" element={<CarouselAdmin />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
