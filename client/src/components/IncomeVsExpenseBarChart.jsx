// src/components/IncomeVsExpenseBarChart.jsx

import React from "react";
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";
import {useCurrency} from "../hooks/useCurrency";

const IncomeVsExpenseBarChart = ({data}) => {
    const {format} = useCurrency();

    const renderChart = () => {
        if (!data || data.length === 0) {
            return (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                    <p className="text-gray-500">Not enough monthly data to display.</p>
                </div>
            );
        }
        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={data}
                    margin={{top: 5, right: 20, left: -10, bottom: 5}}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/> {/* Lighter grid */}
                    <XAxis
                        dataKey="month"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        stroke="#6b7280" // Gray text
                    />
                    <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        stroke="#6b7280" // Gray text
                        tickFormatter={(value) => format(value, 0)}
                    />
                    <Tooltip
                        formatter={(value) => format(value)}
                        contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem", // 8px
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                    />
                    <Legend wrapperStyle={{fontSize: "14px", color: "#374151"}}/>
                    <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]}/> {/* Green */}
                    <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]}/> {/* Red */}
                </BarChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Monthly Overview
            </h3>
            {renderChart()}
        </div>
    );
};

export default IncomeVsExpenseBarChart;