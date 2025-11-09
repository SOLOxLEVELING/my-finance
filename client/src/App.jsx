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
import {SidebarProvider} from "./context/SidebarContext";

// --- 1. Import your new LandingPage ---
// (Assuming this is the correct path)
import LandingPage from "./pages/LandingPage";

function App() {
    return (
        <AuthProvider>
            <CurrencyProvider>
                <SidebarProvider>
                    <BrowserRouter>
                        <Routes>
                            {/* --- ROUTE 1: New Public Landing Page --- */}
                            {/* This is now the homepage */}
                            <Route path="/" element={<LandingPage/>}/>

                            {/* --- ROUTE 2: Public App Routes --- */}
                            {/* Moved from /login to /app/login */}
                            <Route path="/app/login" element={<LoginPage/>}/>
                            {/* Moved from /register to /app/register */}
                            <Route path="/app/register" element={<RegisterPage/>}/>

                            {/* --- ROUTE 3: Protected App Routes --- */}
                            <Route element={<ProtectedRoute/>}>
                                {/* This path is changed from "/" to "/app" */}
                                <Route path="/app" element={<MainLayout/>}>
                                    {/* 'index' is now the default for /app */}
                                    <Route index element={<DashboardPage/>}/>
                                    <Route path="transactions" element={<TransactionListPage/>}/>
                                    <Route path="categories" element={<CategoryManagerPage/>}/>
                                    <Route path="budgets" element={<BudgetSetupPage/>}/>
                                    <Route path="import" element={<DataImportPage/>}/>
                                    {/* Changed path from "/settings" to "settings" to be relative */}
                                    <Route path="settings" element={<SettingsPage/>}/>
                                </Route>
                            </Route>

                            {/* You can add a 404 Not Found page here if you like */}
                            {/* <Route path="*" element={<NotFoundPage />} /> */}

                        </Routes>
                    </BrowserRouter>
                </SidebarProvider>
            </CurrencyProvider>
        </AuthProvider>
    );
}

export default App;