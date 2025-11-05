// src/pages/BudgetSetupPage.jsx

import React, {useEffect, useState} from "react";
import {useAuth} from "../context/AuthContext";
import apiClient from "../api/axios";
import {useCurrency} from "../hooks/useCurrency";
import {useCurrencyRates} from "../context/CurrencyProvider";

const BudgetSetupPage = () => {
    const [budgetData, setBudgetData] = useState([]);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [message, setMessage] = useState("");
    const {symbol, currency} = useCurrency();
    const {rates, loading} = useCurrencyRates();
    const {refreshData} = useAuth();

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

    const handleInputChange = (categoryId, amount) => {
        if (amount === "") {
            setBudgetData((prev) =>
                prev.map((item) =>
                    item.categoryId === categoryId
                        ? {...item, budgetAmountOriginal: ""}
                        : item
                )
            );
            return;
        }
        const newAmount = parseFloat(amount);
        setBudgetData((prev) =>
            prev.map((item) =>
                item.categoryId === categoryId
                    ? {...item, budgetAmountOriginal: isNaN(newAmount) ? 0 : newAmount}
                    : item
            )
        );
    };

    const handleSaveChanges = async () => {
        if (loading || !rates) {
            setMessage("Error: Currency rates not loaded yet.");
            return;
        }

        try {
            const payload = {
                budgets: budgetData.map(({categoryId, budgetAmountOriginal}) => {
                    return {
                        categoryId,
                        amount: parseFloat(budgetAmountOriginal) || 0, // original
                    };
                }),
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
        <div className="space-y-6">
            {/* H1 is gone (handled by Header) */}

            {/* Month Selector */}
            <div>
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
                    className="mt-1 block w-full max-w-xs px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            {/* Budget Settings Card */}
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <div className="space-y-4">
                    {budgetData.map((item) => (
                        <div
                            key={item.categoryId}
                            // --- THIS IS THE UPDATED LINE ---
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
                        >
              <span className="text-sm font-medium text-gray-800 mb-2 sm:mb-0">
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
                                    // --- Added w-full for mobile, sm:w-40 for desktop ---
                                    className="block w-full sm:w-40 pl-7 pr-2 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end items-center">
                    {message && (
                        <p className="text-sm text-green-600 mr-4">{message}</p>
                    )}
                    <button
                        onClick={handleSaveChanges}
                        className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BudgetSetupPage;