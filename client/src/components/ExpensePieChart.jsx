// src/components/ExpensePieChart.jsx

import React from "react";
import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip,} from "recharts";
import {useCurrency} from "../hooks/useCurrency";

const COLORS = [
    "#6366f1",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
];

const ExpensePieChart = ({data}) => {
    const {format} = useCurrency();

    const renderChart = () => {
        if (!data || data.length === 0) {
            return (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                    <p className="text-gray-500">No expense data to display.</p>
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
                        contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                    />
                    <Legend
                        wrapperStyle={{fontSize: "14px", color: "#374151"}}
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>
        );
    };

    return (
        // --- UPDATED CLASSES ---
        <div
            className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Spending by Category
            </h3>
            {renderChart()}
        </div>
    );
};

export default ExpensePieChart;