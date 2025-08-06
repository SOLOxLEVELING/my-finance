import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useCurrency } from "../hooks/useCurrency";

const COLORS = [
  "#0284c7",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const ExpensePieChart = ({ data }) => {
  const { format } = useCurrency();

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full min-h-[300px]">
          <p className="text-slate-500">No expense data to display.</p>
        </div>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            fill="#8884d8"
            paddingAngle={5}
            // --- FIX: The label prop has been completely removed ---
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => format(value)}
            containerStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "10px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "14px" }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">
        Spending by Category
      </h3>
      {renderChart()}
    </div>
  );
};

export default ExpensePieChart;
