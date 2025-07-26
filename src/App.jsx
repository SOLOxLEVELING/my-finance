import React from "react";
import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext"; // Import AuthProvider
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionListPage from "./pages/TransactionListPage";
import CategoryManagerPage from "./pages/CategoryManagerPage";
import BudgetSetupPage from "./pages/BudgetSetupPage"; // <-- Import new page
import DataImportPage from "./pages/DataImportPage"; // <-- Import the new page

// Layout component with shared navigation
const AppLayout = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    // <-- this was missing
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-2xl font-bold text-blue-700">
              FinanceDash
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                to="/transactions"
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Transactions
              </Link>
              <Link
                to="/categories"
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Categories
              </Link>
              <Link
                to="/budgets"
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Budgets
              </Link>
              <Link
                to="/import"
                className="text-sm font-medium text-white bg-blue-600 px-3 py-2 rounded-md hover:bg-blue-700"
              >
                Import CSV
              </Link>
              {isAuthenticated && (
                <button
                  onClick={logout}
                  className="text-sm font-medium text-red-500 hover:text-red-700"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="transactions" element={<TransactionListPage />} />
              {/* ... all other app routes */}
              <Route path="categories" element={<CategoryManagerPage />} />
              <Route path="budgets" element={<BudgetSetupPage />} />
              <Route path="import" element={<DataImportPage />} />{" "}
              {/* <-- Activate this route */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
