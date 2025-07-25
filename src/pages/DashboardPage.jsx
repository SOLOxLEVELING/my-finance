import React, { useState, useEffect } from "react";
import axios from "axios";
import SummaryWidget from "../components/SummaryWidget";
import ExpensePieChart from "../components/ExpensePieChart";
import IncomeVsExpenseBarChart from "../components/IncomeVsExpenseBarChart";
import BudgetTrackerWidget from "../components/BudgetTrackerWidget"; // <-- Import new widget

// Helper to get the first day of the current month in YYYY-MM-DD format
const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .split("T")[0];
};

const DashboardPage = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [budgetData, setBudgetData] = useState([]); // <-- Add state for budget data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ... (Hardcoded IDs)
  const accountId = 1;
  const userId = 1;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      const currentMonth = getFirstDayOfMonth(new Date());

      try {
        const [summaryRes, pieChartRes, barChartRes, budgetRes] =
          await Promise.all([
            // <-- Fetch budget data
            axios.get(
              `http://localhost:3001/api/transactions/summary/${accountId}`
            ),
            axios.get(
              `http://localhost:3001/api/charts/expenses-by-category/${userId}`
            ),
            axios.get(
              `http://localhost:3001/api/charts/monthly-summary/${accountId}`
            ),
            axios.get(
              `http://localhost:3001/api/budgets/${userId}/${currentMonth}`
            ), // <-- API call
          ]);
        setSummaryData(summaryRes.data);
        setPieChartData(pieChartRes.data);
        setBarChartData(barChartRes.data);
        setBudgetData(budgetRes.data); // <-- Set budget data
      } catch (err) {
        // ... (error handling)
      } finally {
        // ... (setIsLoading)
      }
    };

    fetchData();
  }, [accountId, userId]);

  // ... (loading and error JSX)

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Summary Widget takes full width */}
        <div className="lg:col-span-3">
          <SummaryWidget summaryData={summaryData} />
        </div>

        {/* Budget Tracker */}
        <div className="lg:col-span-1">
          <BudgetTrackerWidget data={budgetData} />
        </div>

        {/* Pie and Bar Charts */}
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpensePieChart data={pieChartData} />
          <IncomeVsExpenseBarChart data={barChartData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
