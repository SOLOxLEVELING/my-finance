// src/pages/DashboardPage.jsx

import React, {useEffect, useState} from "react";
import {useAuth} from "../context/AuthContext";
import apiClient from "../api/axios";
import {useCurrencyRates} from "../context/CurrencyProvider";
import StatCard from "../components/StatCard";
import MonthlyOverviewChart from "../components/MonthlyOverviewChart";
import ExpensePieChart from "../components/ExpensePieChart";
import BudgetTrackerWidget from "../components/BudgetTrackerWidget";
import {PiggyBank, TrendingDown, TrendingUp} from "lucide-react";

const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const {userId, accountId, dataVersion, currency} = useAuth();
    const {rates, loading: ratesLoading} = useCurrencyRates();

    useEffect(() => {
        if (!userId || !accountId || !currency || ratesLoading) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError("");

            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const currentMonthForQuery = `${year}-${month}-01`;

            try {
                // --- UPDATED: Removed barChartRes ---
                const [summaryRes, pieChartRes, budgetRes] =
                    await Promise.all([
                        apiClient.get("/transactions/summary"),
                        apiClient.get("/charts/expenses-by-category"),
                        apiClient.get(`/budgets/${currentMonthForQuery}`),
                    ]);

                // --- UPDATED: Removed barChart data ---
                setDashboardData({
                    summary: summaryRes.data,
                    pieChart: pieChartRes.data,
                    budgets: budgetRes.data,
                });
            } catch (err) {
                setError("Failed to load dashboard data. Please try again later.");
                console.error("Dashboard fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId, accountId, dataVersion, currency, ratesLoading]);

    return (
        <div className="space-y-6">
            <div className="hidden lg:flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Dashboard
                </h1>
            </div>

            {isLoading && (
                <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <p className="text-center text-gray-500">Loading dashboard data...</p>
                </div>
            )}

            {error && (
                <div className="p-6 bg-red-100 text-red-700 rounded-lg shadow-md border border-red-200">
                    <p className="text-center font-medium">{error}</p>
                </div>
            )}

            {!isLoading && !error && dashboardData && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            title="Total Income"
                            value={dashboardData.summary.totalIncome}
                            icon={TrendingUp}
                            colorTheme="green"
                            // --- UPDATED ---
                            linkTo="/app/transactions" // was /transactions
                            showQuickAdd={true}
                        />
                        <StatCard
                            title="Total Expenses"
                            value={dashboardData.summary.totalExpenses}
                            icon={TrendingDown}
                            colorTheme="red"
                            // --- UPDATED ---
                            linkTo="/app/transactions" // was /transactions
                            showQuickAdd={true}
                        />
                        <StatCard
                            title="Net Savings"
                            value={dashboardData.summary.netSavings}
                            icon={PiggyBank}
                            colorTheme="blue"
                            // --- UPDATED ---
                            linkTo="/app/transactions" // was /transactions
                        />
                    </div>

                    <div className="grid grid-cols-1">
                        {/* --- UPDATED: No longer passing data prop --- */}
                        <MonthlyOverviewChart/>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3">
                            <BudgetTrackerWidget
                                budgets={dashboardData.budgets}
                                currency={currency}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <ExpensePieChart data={dashboardData.pieChart}/>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardPage;