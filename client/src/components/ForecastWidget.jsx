import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import apiClient from "../api/axios"; // Your configured axios client
import { useCurrency } from "../hooks/useCurrency";

const ForecastWidget = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { format } = useCurrency();

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await apiClient.get("/forecasts");
        setData(response.data); // Assuming API returns an array for the chart
      } catch (error) {
        console.error("Could not fetch forecast", error);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  if (loading)
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm">
        Loading forecast...
      </div>
    );

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">
        30-Day Spending Forecast
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => format(value, 0)} />
          <Tooltip formatter={(value) => format(value)} />
          <Legend />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={2}
            name="Actual Spending"
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#0284c7"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Forecasted Spending"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastWidget;
