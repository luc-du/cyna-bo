import { useEffect, useState, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { validateToken, fetchUserProfile } from "./store/authStore";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import { useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store/store";
import Loader from "./components/Loader";
import { SuspenseFallback } from "./components/Loader";
import ErrorBoundary from "./components/ErrorBoundary";
import { ConfirmProvider } from "./lib/confirmContext";
import { Users } from "lucide-react";
import Orders from "./pages/Orders";
import Products from "./pages/Products";

// Lazy load des composants moins critiques
const LazySettings = lazy(() => import("./pages/Settings"));
const LazySupport = lazy(() => import("./pages/Support"));
const LazyCarouselAdmin = lazy(() => import("./components/CarouselAdmin"));

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
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await dispatch(validateToken()).unwrap();
          await dispatch(fetchUserProfile()).unwrap();
        } catch (error) {
          localStorage.removeItem("token");
          setAuthError("Votre session a expiré. Veuillez vous reconnecter.");
        }
      }
      setAuthInitialized(true); 
    };

    initializeAuth();
  }, [dispatch]);

  // Handler pour les erreurs dans les ErrorBoundaries
  const handleError = (error: Error) => {
    toast.error(`Une erreur est survenue: ${error.message}`);
  };

  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="large" fullScreen />
      </div>
    );
  }

  return (    <ErrorBoundary onError={handleError}>
      <Router>
        <ConfirmProvider>
          <Routes>
            <Route path="/login" element={<LoginPage initialError={authError} />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <DashboardLayout />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
          >
            <Route index element={<Dashboard />} />            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="support" element={
              <Suspense fallback={<SuspenseFallback />}>
                <LazySupport />
              </Suspense>
            } />
            <Route path="settings" element={
              <Suspense fallback={<SuspenseFallback />}>
                <LazySettings />
              </Suspense>
            } />
            <Route path="users" element={<Users />} />
            <Route path="carousel" element={
              <Suspense fallback={<SuspenseFallback />}>
                <LazyCarouselAdmin />
              </Suspense>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />        </Routes>
        <Toaster position="top-right" />
        </ConfirmProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
