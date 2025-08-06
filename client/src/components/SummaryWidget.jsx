import React from "react";
import { useCurrency } from "../hooks/useCurrency";

// Helper components for icons
const ArrowUpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19V5m0 0l-4 4m4-4l4 4"
    />
  </svg>
);

const ArrowDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 5v14m0 0l-4-4m4 4l4-4"
    />
  </svg>
);

const PiggyBankIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M15 11.01h.01M9 11.01h.01M4 10h16v10H4zM4 10L3 8m1 2l1-2m13 2l1-2m-1 2l-1-2"
    />
  </svg>
);

const StatCard = ({ title, value, colorClass, Icon }) => {
  const { format } = useCurrency();
  return (
    <div
      className={`flex items-center p-4 bg-white rounded-2xl shadow-sm border-l-4 ${colorClass}`}
    >
      <div
        className={`p-3 rounded-full ${colorClass
          .replace("border", "bg")
          .replace("-600", "-100")
          .replace("-500", "-100")}`}
      >
        <Icon />
      </div>
      <div className="ml-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <p className="text-2xl font-semibold text-slate-800">{format(value)}</p>
      </div>
    </div>
  );
};

const SummaryWidget = ({ summaryData }) => {
  if (!summaryData) return <p>Loading summary...</p>;
  const { totalIncome, totalExpenses, netSavings } = summaryData;

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-4">
        Financial Overview
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          title="Total Income"
          value={totalIncome}
          colorClass="border-emerald-500 text-emerald-500"
          Icon={ArrowUpIcon}
        />
        <StatCard
          title="Total Expenses"
          value={Math.abs(totalExpenses)}
          colorClass="border-rose-500 text-rose-500"
          Icon={ArrowDownIcon}
        />
        <StatCard
          title="Net Savings"
          value={netSavings}
          colorClass={
            netSavings >= 0
              ? "border-sky-500 text-sky-500"
              : "border-amber-500 text-amber-500"
          }
          Icon={PiggyBankIcon}
        />
      </div>
    </div>
  );
};

export default SummaryWidget;
