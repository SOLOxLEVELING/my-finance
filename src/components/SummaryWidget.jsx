import React from "react";

// A helper function to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const StatCard = ({ title, value, colorClass }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
      <p className={`mt-1 text-3xl font-semibold ${colorClass}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
};

const SummaryWidget = ({ summaryData }) => {
  if (!summaryData) {
    return <p>Loading summary...</p>;
  }

  const { totalIncome, totalExpenses, netSavings } = summaryData;

  return (
    // This component will span the full width of its grid container
    <div className="col-span-1 lg:col-span-3">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Financial Overview
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          title="Total Income"
          value={totalIncome}
          colorClass="text-green-600"
        />
        <StatCard
          title="Total Expenses"
          value={Math.abs(totalExpenses)}
          colorClass="text-red-600"
        />
        <StatCard
          title="Net Savings"
          value={netSavings}
          colorClass={netSavings >= 0 ? "text-blue-600" : "text-yellow-600"}
        />
      </div>
    </div>
  );
};

export default SummaryWidget;
