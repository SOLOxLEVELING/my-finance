import React, { useState, useEffect } from "react";
import apiClient from "../api/axios";
import FilterControls from "../components/FilterControls";
import { useAuth } from "../context/AuthContext";

// --- Helper Functions ---
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value
  );

// REVISED: This new version correctly handles timezones
const formatDateForInput = (dateString) => {
  const date = new Date(dateString);
  // Adjust for the user's local timezone offset before creating the string
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
  return adjustedDate.toISOString().split("T")[0];
};

const formatDateDDMMYYYY = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// ... (The rest of the file, including AddTransactionForm and TransactionListPage, remains exactly the same as the last version) ...
// The full, correct code for the rest of the file is included below for safety.

const AddTransactionForm = ({ categories, onTransactionAdded }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transaction_date, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [category_id, setCategoryId] = useState("");
  const [type, setType] = useState("expense");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalAmount =
      type === "expense" ? -Math.abs(amount) : Math.abs(amount);
    try {
      await apiClient.post("/transactions", {
        description,
        amount: finalAmount,
        transaction_date,
        category_id: category_id || null,
      });
      setDescription("");
      setAmount("");
      setCategoryId("");
      setType("expense");
      setTransactionDate(new Date().toISOString().split("T")[0]);
      onTransactionAdded();
    } catch (error) {
      console.error("Failed to add transaction", error);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New Transaction</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end"
      >
        <input
          type="date"
          value={transaction_date}
          onChange={(e) => setTransactionDate(e.target.value)}
          required
          className="md:col-span-1 block w-full border border-gray-300 rounded-md p-2"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
          className="md:col-span-2 block w-full border border-gray-300 rounded-md p-2"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          required
          step="0.01"
          className="block w-full border border-gray-300 rounded-md p-2"
        />
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`w-full p-2 rounded text-sm ${
              type === "expense" ? "bg-red-500 text-white" : "bg-gray-200"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`w-full p-2 rounded text-sm ${
              type === "income" ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
          >
            Income
          </button>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </form>
    </div>
  );
};

const TransactionListPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const { accountId, userId } = useAuth();

  const fetchData = async () => {
    if (!accountId || !userId) return;
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    try {
      const [transactionsRes, categoriesRes] = await Promise.all([
        apiClient.get(`/transactions/account?${params.toString()}`),
        apiClient.get("/categories"),
      ]);
      setTransactions(transactionsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [accountId, userId, filters]);

  const handleEditClick = (transaction) => {
    setEditingTransactionId(transaction.id);
    setEditFormData({
      description: transaction.description,
      amount: parseFloat(transaction.amount).toFixed(2),
      transaction_date: formatDateForInput(transaction.transaction_date),
      categoryId: transaction.category_id || "",
    });
  };

  const handleCancelClick = () => setEditingTransactionId(null);

  const handleEditFormChange = (e) =>
    setEditFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSaveClick = async (transactionId) => {
    try {
      await apiClient.put(`/transactions/${transactionId}`, {
        description: editFormData.description,
        amount: editFormData.amount,
        transaction_date: editFormData.transaction_date,
        categoryId: editFormData.categoryId,
      });
      setEditingTransactionId(null);
      fetchData();
    } catch (error) {
      console.error("Failed to update transaction", error);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await apiClient.delete(`/transactions/${id}`);
        fetchData();
      } catch (error) {
        console.error("Failed to delete transaction", error);
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Transactions
      </h1>
      <div className="mt-6">
        <AddTransactionForm
          categories={categories}
          onTransactionAdded={fetchData}
        />
        <FilterControls
          filters={filters}
          onFilterChange={(name, value) =>
            name === "clear"
              ? setFilters({ search: "", startDate: "", endDate: "" })
              : setFilters((p) => ({ ...p, [name]: value }))
          }
        />

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {loading ? (
              <li className="px-4 py-4 text-center">Loading...</li>
            ) : (
              transactions.map((tx) => (
                <li key={tx.id} className="px-4 py-4 sm:px-6">
                  {editingTransactionId === tx.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <input
                        type="date"
                        name="transaction_date"
                        value={editFormData.transaction_date}
                        onChange={handleEditFormChange}
                        className="md:col-span-2 text-sm border rounded p-1"
                      />
                      <input
                        type="text"
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditFormChange}
                        className="md:col-span-4 text-sm border rounded p-1"
                      />
                      <input
                        type="number"
                        name="amount"
                        value={editFormData.amount}
                        onChange={handleEditFormChange}
                        step="0.01"
                        className="md:col-span-2 text-sm border rounded p-1 text-right"
                      />
                      <select
                        name="categoryId"
                        value={editFormData.categoryId}
                        onChange={handleEditFormChange}
                        className="md:col-span-2 text-sm border-gray-300 rounded-md p-1"
                      >
                        <option value="">Uncategorized</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <div className="md:col-span-2 flex justify-end space-x-2">
                        <button
                          onClick={() => handleSaveClick(tx.id)}
                          className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelClick}
                          className="text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <p className="md:col-span-2 text-sm text-gray-500">
                        {formatDateDDMMYYYY(tx.transaction_date)}
                      </p>
                      <p className="md:col-span-4 text-sm font-medium text-gray-900 truncate">
                        {tx.description}
                      </p>
                      <p
                        className={`md:col-span-2 text-sm font-semibold text-right ${
                          tx.amount < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {formatCurrency(tx.amount)}
                      </p>
                      <p className="md:col-span-2 text-sm text-gray-500">
                        {tx.category_name || "Uncategorized"}
                      </p>
                      <div className="md:col-span-2 flex justify-end space-x-4">
                        <button
                          onClick={() => handleEditClick(tx)}
                          className="text-sm text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="text-sm text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TransactionListPage;
