import { Route, Routes } from "react-router-dom";

import AppErrorBoundary from "./components/AppErrorBoundary";
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./components/ToastContext";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";

const ProtectedShell = ({ children }) => (
  <ProtectedRoute>
    <AppLayout>
      <AppErrorBoundary>{children}</AppErrorBoundary>
    </AppLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedShell>
                <DashboardPage />
              </ProtectedShell>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedShell>
                <ProductsPage />
              </ProtectedShell>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedShell>
                <OrdersPage />
              </ProtectedShell>
            }
          />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
