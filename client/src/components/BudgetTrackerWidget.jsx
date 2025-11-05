// src/components/BudgetTrackerWidget.jsx

import React from "react";
import {useCurrencyRates} from "../context/CurrencyProvider";

const BudgetTrackerWidget = ({budgets, currency}) => {
    const {rates} = useCurrencyRates();

    if (!rates)
        return (
            <div className="p-6 bg-white rounded-lg shadow-lg min-h-[150px] flex items-center justify-center">
                <p className="text-gray-500">Loading rates...</p>
            </div>
        );
    if (!budgets || budgets.length === 0) return null;

    const totalBudgetUSD = budgets.reduce(
        (sum, b) => sum + (b.budgetAmountUSD || 0),
        0
    );
    const totalSpentUSD = budgets.reduce(
        (sum, b) => sum + (b.spentAmountUSD || 0),
        0
    );
    const totalBudgetConverted = totalBudgetUSD * (rates[currency] || 1);
    const totalSpentConverted = totalSpentUSD * (rates[currency] || 1);
    const totalPercent =
        totalBudgetConverted > 0
            ? (totalSpentConverted / totalBudgetConverted) * 100
            : 0;

    const totalProgressBarColor =
        totalPercent >= 100
            ? "bg-red-500"
            : totalPercent >= 80
                ? "bg-yellow-400"
                : "bg-green-500";

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Budget Progress
            </h3>
            <p className="text-sm text-gray-500 mb-4">
                Your spending summary for the month.
            </p>

            {/* Overall Progress */}
            <div className="mb-6">
                <div className="flex justify-between items-end mb-1">
          <span className="text-base font-medium text-gray-700">
            Overall Budget
          </span>
                    <span className="text-base font-semibold text-gray-800">
            {currency} {totalSpentConverted.toFixed(2)} /{" "}
                        <span className="text-gray-500">
              {currency} {totalBudgetConverted.toFixed(2)}
            </span>
          </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className={`${totalProgressBarColor} h-2.5 rounded-full`}
                        style={{width: `${Math.min(totalPercent, 100)}%`}}
                    ></div>
                </div>
            </div>

            <div className="space-y-4">
                {budgets
                    .filter((b) => b.budgetAmountUSD > 0)
                    .map((b) => {
                        const spent = b.spentAmountUSD * (rates[currency] || 1);
                        const budget = b.budgetAmountUSD * (rates[currency] || 1);
                        const percent = budget > 0 ? (spent / budget) * 100 : 0;
                        const progressBarColor =
                            percent >= 100
                                ? "bg-red-500"
                                : percent >= 80
                                    ? "bg-yellow-400"
                                    : "bg-green-500";
                        const lightBgColor =
                            percent >= 100
                                ? "bg-red-100"
                                : percent >= 80
                                    ? "bg-yellow-100"
                                    : "bg-green-100";

                        return (
                            <div key={b.categoryId}>
                                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium text-gray-600">
                    {b.categoryName}
                  </span>
                                    <span className="text-gray-500">
                    {currency} {spent.toFixed(2)} / {currency}{" "}
                                        {budget.toFixed(2)}
                  </span>
                                </div>
                                <div className={`w-full ${lightBgColor} rounded-full h-2`}>
                                    <div
                                        className={`${progressBarColor} h-2 rounded-full`}
                                        style={{width: `${Math.min(percent, 100)}%`}}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default BudgetTrackerWidget;