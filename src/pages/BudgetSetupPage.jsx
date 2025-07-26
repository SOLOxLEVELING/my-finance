import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/axios";
import { useCurrency } from "../hooks/useCurrency";

const BudgetSetupPage = () => {
  const [budgetData, setBudgetData] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [message, setMessage] = useState("");
  const { symbol } = useCurrency();
  const { refreshData } = useAuth();

  const fetchBudgetData = async (currentMonth) => {
    try {
      const response = await apiClient.get(`/budgets/${currentMonth}-01`);
      setBudgetData(response.data);
    } catch (error) {
      console.error("Failed to fetch budget data", error);
      setMessage("Error: Could not load budget data.");
    }
  };

  useEffect(() => {
    fetchBudgetData(month);
  }, [month]);

  // FIX #1: This function now correctly updates the 'budgetAmountOriginal' property
  const handleInputChange = (categoryId, amount) => {
    // Allow the input to be temporarily empty while typing
    if (amount === "") {
      setBudgetData(
        budgetData.map((item) =>
          item.categoryId === categoryId
            ? { ...item, budgetAmountOriginal: "" }
            : item
        )
      );
      return;
    }
    const newAmount = parseFloat(amount);
    setBudgetData(
      budgetData.map((item) =>
        item.categoryId === categoryId
          ? { ...item, budgetAmountOriginal: isNaN(newAmount) ? 0 : newAmount }
          : item
      )
    );
  };

  const handleSaveChanges = async () => {
    setMessage("");
    try {
      const payload = {
        // FIX #2: Ensure the payload sends the correct property
        budgets: budgetData.map(({ categoryId, budgetAmountOriginal }) => ({
          categoryId,
          amount: budgetAmountOriginal || 0,
        })),
        month: `${month}-01`,
      };
      await apiClient.post("/budgets/bulk-update", payload);
      setMessage("Budgets saved successfully!");
      refreshData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save budgets", error);
      setMessage("Error: Failed to save budgets.");
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
          Select Month:
        </label>
        <input
          type="month"
          id="month-select"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="mt-1 block w-full max-w-xs px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
        <div className="space-y-4">
          {budgetData.map((item) => (
            <div
              key={item.categoryId}
              className="flex items-center justify-between"
            >
              <span className="text-sm font-medium text-gray-800">
                {item.categoryName}
              </span>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  {symbol}
                </span>
                <input
                  type="number"
                  value={item.budgetAmountOriginal}
                  onChange={(e) =>
                    handleInputChange(item.categoryId, e.target.value)
                  }
                  className="block w-40 pl-7 pr-2 py-2 border border-gray-300 rounded-md shadow-sm"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end items-center">
          {message && <p className="text-sm text-gray-600 mr-4">{message}</p>}
          <button
            onClick={handleSaveChanges}
            className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetSetupPage;
