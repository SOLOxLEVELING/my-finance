// src/pages/TransactionListPage.jsx

import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom"; // <-- Import hooks
import apiClient from "../api/axios";
import FilterControls from "../components/FilterControls";
import {useAuth} from "../context/AuthContext";
import {useCurrency} from "../hooks/useCurrency";
import {Pencil, Plus, Trash2, X} from "lucide-react";

// (formatDateForInput and formatDateDDMMYYYY functions remain unchanged)
const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
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

// --- AddTransactionForm (Modal) (unchanged) ---
const AddTransactionForm = ({categories, onTransactionAdded, isOpen, onClose}) => {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [transaction_date, setTransactionDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [category_id, setCategoryId] = useState("");
    const [type, setType] = useState("expense");

    if (!isOpen) return null;

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
            onClose();
        } catch (error) {
            console.error("Failed to add transaction", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="p-6 bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Add New Transaction</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X size={24}/>
                    </button>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    {/* ... (rest of the form is unchanged) ... */}
                    {/* Date */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={transaction_date}
                            onChange={(e) => setTransactionDate(e.target.value)}
                            required
                            className="block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Amount */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            required
                            step="0.01"
                            className="block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., Coffee shop"
                            required
                            className="block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Category */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={category_id}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">Uncategorized</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Type */}
                    <div className="md:col-span-1 flex items-end">
                        <div className="flex space-x-2 w-full">
                            <button
                                type="button"
                                onClick={() => setType("expense")}
                                className={`w-full p-2 rounded-md text-sm font-medium ${
                                    type === "expense" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                }`}
                            >
                                Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("income")}
                                className={`w-full p-2 rounded-md text-sm font-medium ${
                                    type === "income" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                }`}
                            >
                                Income
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-2 flex justify-end pt-2">
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white p-2 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                        >
                            Add Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- TransactionListPage Component ---
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
    const {accountId, userId} = useAuth();
    const {format} = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const location = useLocation(); // <-- Get location
    const navigate = useNavigate(); // <-- Get navigate

    // --- NEW useEffect to check for quick-add signal ---
    useEffect(() => {
        if (location.state?.openModal) {
            setIsModalOpen(true);
            // Clear the state from history so it doesn't re-open
            navigate(location.pathname, {replace: true, state: {}});
        }
    }, [location, navigate]);

    const fetchData = async () => { /* ... (unchanged) ... */
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

    // --- (All handler functions remain unchanged) ---
    const handleEditClick = (transaction) => { /* ... (unchanged) ... */
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
        setEditFormData((prev) => ({...prev, [e.target.name]: e.target.value}));
    const handleSaveClick = async (transactionId) => { /* ... (unchanged) ... */
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
    const handleDeleteTransaction = async (id) => { /* ... (unchanged) ... */
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
        <div className="space-y-6">
            <AddTransactionForm
                categories={categories}
                onTransactionAdded={fetchData}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <FilterControls
                filters={filters}
                onFilterChange={(name, value) =>
                    name === "clear"
                        ? setFilters({search: "", startDate: "", endDate: ""})
                        : setFilters((p) => ({...p, [name]: value}))
                }
            />

            {/* --- Main Card (unchanged) --- */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                <div
                    className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 border-b border-gray-200 space-y-3 sm:space-y-0">
                    <h2 className="text-xl font-semibold text-gray-900">Your Transactions</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors w-full sm:w-auto justify-center"
                    >
                        <Plus size={16} className="mr-2"/>
                        Add Transaction
                    </button>
                </div>

                {/* --- Table (unchanged) --- */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* ... (thead and tbody are unchanged) ... */}
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Loading...</td>
                            </tr>
                        ) : (
                            transactions.map((tx) => (
                                <React.Fragment key={tx.id}>
                                    {editingTransactionId === tx.id ? (
                                        // --- Editing Row ---
                                        <tr className="bg-indigo-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="date"
                                                    name="transaction_date"
                                                    value={editFormData.transaction_date}
                                                    onChange={handleEditFormChange}
                                                    className="text-sm border-gray-300 rounded-md p-1 shadow-sm"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    name="description"
                                                    value={editFormData.description}
                                                    onChange={handleEditFormChange}
                                                    className="text-sm border-gray-300 rounded-md p-1 w-full shadow-sm"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    name="categoryId"
                                                    value={editFormData.categoryId}
                                                    onChange={handleEditFormChange}
                                                    className="text-sm border-gray-300 rounded-md p-1 shadow-sm"
                                                >
                                                    <option value="">Uncategorized</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowG.rap text-right">
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    value={editFormData.amount}
                                                    onChange={handleEditFormChange}
                                                    step="0.01"
                                                    className="text-sm border-gray-300 rounded-md p-1 text-right w-28 shadow-sm"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                                                <button
                                                    onClick={() => handleSaveClick(tx.id)}
                                                    className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelClick}
                                                    className="text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md"
                                                >
                                                    Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    ) : (
                                        // --- Display Row ---
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDateDDMMYYYY(tx.transaction_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs">
                                                {tx.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {tx.category_name || "Uncategorized"}
                                            </td>
                                            <td
                                                className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                                                    tx.amount < 0 ? "text-red-600" : "text-green-600"
                                                }`}
                                            >
                                                {format(tx.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                <button
                                                    onClick={() => handleEditClick(tx)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16}/>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTransaction(tx.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransactionListPage;