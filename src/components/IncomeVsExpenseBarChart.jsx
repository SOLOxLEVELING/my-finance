import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useCurrency } from "../hooks/useCurrency"; // 1. Import the hook

const IncomeVsExpenseBarChart = ({ data }) => {
  const { format } = useCurrency(); // 2. Call the hook

  if (!data || data.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md flex items-center justify-center h-full">
        <p className="text-gray-500">Not enough monthly data to display.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Monthly Income vs. Expenses
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => format(value)} />{" "}
          {/* 3. Use the format function */}
          <Legend />
          <Bar dataKey="income" fill="#22c55e" />
          <Bar dataKey="expenses" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeVsExpenseBarChart;
