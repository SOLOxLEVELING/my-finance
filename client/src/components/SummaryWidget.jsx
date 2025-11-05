// src/components/SummaryWidget.jsx

import React from "react";
import {useCurrency} from "../hooks/useCurrency";
import {ArrowDown, ArrowUp, PiggyBank} from "lucide-react";

const StatCard = ({title, value, colorClass, Icon}) => {
    const {format} = useCurrency();
    return (
        <div className="flex items-center p-5 bg-white rounded-lg shadow-lg">
            <div
                className={`p-3 rounded-full ${colorClass.replace(
                    "text",
                    "bg"
                )}-100 ${colorClass}`}
            >
                <Icon size={24}/>
            </div>
            <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <p className="text-2xl font-semibold text-gray-900">{format(value)}</p>
            </div>
        </div>
    );
};

const SummaryWidget = ({summaryData}) => {
    if (!summaryData) return <p>Loading summary...</p>;
    const {totalIncome, totalExpenses, netSavings} = summaryData;

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Financial Overview
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <StatCard
                    title="Total Income"
                    value={totalIncome}
                    colorClass="text-green-600"
                    Icon={ArrowUp}
                />
                <StatCard
                    title="Total Expenses"
                    value={Math.abs(totalExpenses)}
                    colorClass="text-red-600"
                    Icon={ArrowDown}
                />
                <StatCard
                    title="Net Savings"
                    value={netSavings}
                    colorClass={netSavings >= 0 ? "text-blue-600" : "text-yellow-600"}
                    Icon={PiggyBank}
                />
            </div>
        </div>
    );
};

export default SummaryWidget;