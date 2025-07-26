import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/axios";
import SummaryWidget from "../components/SummaryWidget";
import ExpensePieChart from "../components/ExpensePieChart";
import IncomeVsExpenseBarChart from "../components/IncomeVsExpenseBarChart";
import BudgetTrackerWidget from "../components/BudgetTrackerWidget";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { userId, accountId, dataVersion } = useAuth();

  useEffect(() => {
    if (!userId || !accountId) return;

    const fetchData = async () => {
      // FIX: Corrected the function call from setLoading(true) to setIsLoading(true)
      setIsLoading(true);
      setError(""); // Clear previous errors on a new fetch

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const currentMonthForQuery = `${year}-${month}-01`;

      try {
        const [summaryRes, pieChartRes, barChartRes, budgetRes] =
          await Promise.all([
            apiClient.get("/transactions/summary"),
            apiClient.get("/charts/expenses-by-category"),
            apiClient.get("/charts/monthly-summary"),
            apiClient.get(`/budgets/${currentMonthForQuery}`),
          ]);
        setDashboardData({
          summary: summaryRes.data,
          pieChart: pieChartRes.data,
          barChart: barChartRes.data,
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
  }, [userId, accountId, dataVersion]);

  if (isLoading) {
    return <p className="text-center py-10">Loading your dashboard...</p>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
    );
  }

  if (!dashboardData) {
    return <p className="text-center py-10">No data available to display.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Dashboard
      </h1>
      <SummaryWidget summaryData={dashboardData.summary} />
      <BudgetTrackerWidget data={dashboardData.budgets} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <IncomeVsExpenseBarChart data={dashboardData.barChart} />
        </div>
        <div className="lg:col-span-2">
          <ExpensePieChart data={dashboardData.pieChart} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
