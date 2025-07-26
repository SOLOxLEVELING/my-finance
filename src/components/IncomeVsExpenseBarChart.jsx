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
import { useCurrency } from "../hooks/useCurrency";

const IncomeVsExpenseBarChart = ({ data }) => {
  const { format } = useCurrency();

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full min-h-[300px]">
          <p className="text-slate-500">Not enough monthly data to display.</p>
        </div>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="month"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => format(value, 0)}
          />
          <Tooltip
            formatter={(value) => format(value)}
            containerStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "10px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "14px" }} />
          <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">
        Monthly Overview
      </h3>
      {renderChart()}
    </div>
  );
};

export default IncomeVsExpenseBarChart;
