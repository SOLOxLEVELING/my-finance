import React, { useState, useEffect } from "react";
import axios from "axios";
import FilterControls from "../components/FilterControls";

// Helper function to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

// The Transaction List Component
const TransactionList = ({ transactions, categories, onCategoryChange }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {transactions.length === 0 ? (
          <li className="px-4 py-4 text-center text-gray-500">
            No transactions found.
          </li>
        ) : (
          transactions.map((tx) => (
            <li
              key={tx.id}
              className="px-4 py-4 sm:px-6 flex items-center justify-between"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {tx.description}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(tx.transaction_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <p
                  className={`text-sm font-semibold ${
                    tx.amount < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatCurrency(tx.amount)}
                </p>
                <select
                  value={tx.category_id || ""}
                  onChange={(e) => onCategoryChange(tx.id, e.target.value)}
                  className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

const initialFilterState = {
  search: "",
  startDate: "",
  endDate: "",
};

// The Page Component
const TransactionListPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilterState);

  // --- Hardcoded IDs ---
  const accountId = 1;
  const userId = 1;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Build query parameters from the filters state
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      try {
        // Fetch both transactions and categories in parallel
        const [transactionsRes, categoriesRes] = await Promise.all([
          axios.get(
            `http://localhost:3001/api/transactions/account/${accountId}?${params.toString()}`
          ),
          axios.get(`http://localhost:3001/api/categories/${userId}`),
        ]);

        setTransactions(transactionsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [accountId, userId, filters]); // This effect now correctly depends on filters

  const handleFilterChange = (name, value) => {
    if (name === "clear") {
      setFilters(initialFilterState);
    } else {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [name]: value,
      }));
    }
  };

  const handleCategoryChange = async (transactionId, categoryId) => {
    // Optimistically update the UI
    const originalTransactions = [...transactions];
    const updatedTransactions = transactions.map((tx) =>
      tx.id === transactionId
        ? { ...tx, category_id: categoryId ? parseInt(categoryId) : null }
        : tx
    );
    setTransactions(updatedTransactions);

    try {
      await axios.put(
        `http://localhost:3001/api/transactions/${transactionId}`,
        {
          categoryId: categoryId || null,
        }
      );
    } catch (error) {
      console.error("Failed to update category", error);
      setTransactions(originalTransactions); // Revert on failure
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Transactions
      </h1>
      <div className="mt-6">
        <FilterControls filters={filters} onFilterChange={handleFilterChange} />
        {loading ? (
          <p>Loading transactions...</p>
        ) : (
          <TransactionList
            transactions={transactions}
            categories={categories}
            onCategoryChange={handleCategoryChange}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionListPage;
