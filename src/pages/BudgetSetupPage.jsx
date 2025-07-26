import React, { useState, useEffect } from "react";
import apiClient from "../api/axios";
import { useAuth } from "../context/AuthContext";

const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .split("T")[0];
};

const BudgetSetupPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [month, setMonth] = useState(getFirstDayOfMonth(new Date()));
  const [message, setMessage] = useState("");
  const { userId } = useAuth(); // Get the logged-in user's ID

  useEffect(() => {
    if (!userId) return; // Don't fetch if there's no user

    const fetchBudgets = async () => {
      try {
        // Use apiClient and the correct, shorter URL
        const response = await apiClient.get(`/budgets/${month}`);
        setBudgets(response.data);
      } catch (error) {
        console.error("Failed to fetch budgets", error);
      }
    };
    fetchBudgets();
  }, [userId, month]);

  const handleBudgetChange = (categoryId, amount) => {
    const updatedBudgets = budgets.map((b) =>
      b.categoryId === categoryId ? { ...b, budgetAmount: amount } : b
    );
    setBudgets(updatedBudgets);
  };

  const handleSaveBudget = async (categoryId, amount) => {
    try {
      // Use apiClient, which sends the user's token automatically
      await apiClient.post("/budgets", {
        categoryId,
        amount: amount || 0,
        month,
      });
      setMessage(`Budget for category saved!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save budget", error);
      setMessage("Error saving budget.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Set Monthly Budgets
      </h1>

      <div className="mt-4">
        <label
          htmlFor="month-select"
          className="block text-sm font-medium text-gray-700"
        >
          Select Month
        </label>
        <input
          type="month"
          id="month-select"
          value={month.slice(0, 7)}
          onChange={(e) =>
            setMonth(getFirstDayOfMonth(new Date(e.target.value)))
          }
          className="mt-1 block w-full max-w-xs px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {budgets.map(({ categoryId, categoryName, budgetAmount }) => (
            <li
              key={categoryId}
              className="px-4 py-4 sm:px-6 flex items-center justify-between"
            >
              <p className="text-sm font-medium text-gray-900">
                {categoryName}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">$</span>
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) =>
                    handleBudgetChange(categoryId, e.target.value)
                  }
                  onBlur={(e) => handleSaveBudget(categoryId, e.target.value)}
                  className="w-32 px-2 py-1 border border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BudgetSetupPage;
