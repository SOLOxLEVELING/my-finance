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
import MainLayout from "./components/MainLayout";
import {SidebarProvider} from "./context/SidebarContext"; // <-- Import the new provider

function App() {
    return (
        <AuthProvider>
            <CurrencyProvider>
                {/* --- Add the SidebarProvider wrapper here --- */}
                <SidebarProvider>
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
                </SidebarProvider>
                {/* --- End of SidebarProvider wrapper --- */}
            </CurrencyProvider>
        </AuthProvider>
    );
}

export default App;