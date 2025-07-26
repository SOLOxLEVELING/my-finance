import React from "react";
import { useCurrency } from "../hooks/useCurrency";

const BudgetProgressBar = ({ categoryName, spent, budget }) => {
  const { format } = useCurrency();
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const isOverBudget = percentage > 100;

  let barColor = "bg-green-500";
  if (percentage > 75) barColor = "bg-yellow-400";
  if (percentage > 90) barColor = "bg-orange-500";
  if (isOverBudget) barColor = "bg-red-600";

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">
          {categoryName}
        </span>
        <span className="text-sm text-gray-500">
          {format(spent)} / {format(budget)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${barColor} h-2.5 rounded-full`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

const BudgetTrackerWidget = ({ data }) => {
  // FIX: Changed this line to filter for any item that has a budget set,
  // regardless of whether there has been spending yet.
  const budgetedItems = data.filter((item) => item.budgetAmountUSD > 0);

  if (!data || budgetedItems.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-gray-500">No budgets set for this month.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Budget Progress
      </h3>
      <div className="space-y-4">
        {budgetedItems.map((item) => (
          <BudgetProgressBar
            key={item.categoryId}
            categoryName={item.categoryName}
            spent={item.spentAmountUSD}
            budget={item.budgetAmountUSD}
          />
        ))}
      </div>
    </div>
  );
};

export default BudgetTrackerWidget;
