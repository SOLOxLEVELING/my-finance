// src/App.jsx

import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionListPage from "./pages/TransactionListPage";
import CategoryManagerPage from "./pages/CategoryManagerPage";
import BudgetSetupPage from "./pages/BudgetSetupPage";
import DataImportPage from "./pages/DataImportPage";
import SettingsPage from "./pages/SettingsPage";
import CurrencyProvider from "./context/CurrencyProvider";
import MainLayout from "./components/MainLayout"; // <-- Import our new layout

// The old AppLayout component is gone. We have removed it from this file.

function App() {
    return (
        <AuthProvider>
            <CurrencyProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/register" element={<RegisterPage/>}/>

                        {/* Protected Routes */}
                        <Route element={<ProtectedRoute/>}>
                            {/* Use MainLayout for the protected routes */}
                            <Route path="/" element={<MainLayout/>}>
                                <Route index element={<DashboardPage/>}/>
                                <Route path="transactions" element={<TransactionListPage/>}/>
                                <Route path="categories" element={<CategoryManagerPage/>}/>
                                <Route path="budgets" element={<BudgetSetupPage/>}/>
                                <Route path="import" element={<DataImportPage/>}/>
                                <Route path="/settings" element={<SettingsPage/>}/>
                            </Route>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </CurrencyProvider>
        </AuthProvider>
    );
}

export default App;