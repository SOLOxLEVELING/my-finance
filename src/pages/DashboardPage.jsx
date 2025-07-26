import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/axios";
import SummaryWidget from "../components/SummaryWidget";
import ExpensePieChart from "../components/ExpensePieChart";
import IncomeVsExpenseBarChart from "../components/IncomeVsExpenseBarChart";
import BudgetTrackerWidget from "../components/BudgetTrackerWidget";

const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .split("T")[0];
};

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { userId, accountId } = useAuth();

  useEffect(() => {
    if (!userId || !accountId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      const currentMonth = getFirstDayOfMonth(new Date());

      try {
        const [summaryRes, pieChartRes, barChartRes, budgetRes] =
          await Promise.all([
            apiClient.get("/transactions/summary"),
            apiClient.get("/charts/expenses-by-category"),
            apiClient.get("/charts/monthly-summary"),
            apiClient.get(`/budgets/${currentMonth}`),
          ]);
        setDashboardData({
          summary: summaryRes.data,
          pieChart: pieChartRes.data,
          barChart: barChartRes.data,
          budgets: budgetRes.data,
        });
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId, accountId]);

  if (isLoading) {
    return <p className="text-center py-10">Loading your dashboard...</p>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
    );
  }

  // This check prevents a crash if data is still null after loading/error checks
  if (!dashboardData) {
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-3">
          <SummaryWidget summaryData={dashboardData.summary} />
        </div>
        <div className="lg:col-span-1">
          <BudgetTrackerWidget data={dashboardData.budgets} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpensePieChart data={dashboardData.pieChart} />
          <IncomeVsExpenseBarChart data={dashboardData.barChart} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
