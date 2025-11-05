// src/pages/CategoryManagerPage.jsx

import React, {useEffect, useState} from "react";
import apiClient from "../api/axios";
import {useCurrency} from "../hooks/useCurrency";
import {Pencil, Trash2} from "lucide-react"; // Import icons

const CategoryManagerPage = () => {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [message, setMessage] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const {format} = useCurrency();

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get("/categories/with-spending");
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            await apiClient.post("/categories", {name: newCategoryName});
            setNewCategoryName("");
            setMessage(`Category "${newCategoryName}" created successfully!`);
            setTimeout(() => setMessage(""), 3000);
            fetchCategories();
        } catch (error) {
            setMessage("Failed to create category. It may already exist.");
        }
    };

    const handleUpdateCategory = async (id, name) => {
        try {
            await apiClient.put(`/categories/${id}`, {name});
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            console.error("Failed to update category", error);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (
            window.confirm(
                "Are you sure? This will remove the category and uncategorize all its transactions."
            )
        ) {
            try {
                await apiClient.delete(`/categories/${id}`);
                fetchCategories();
            } catch (error) {
                console.error("Failed to delete category", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* H1 is gone (handled by Header) */}

            {/* Create New Category Card */}
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800">
                    Create New Category
                </h2>
                <form
                    onSubmit={handleCreateCategory}
                    className="flex items-end space-x-4 mt-4"
                >
                    <div className="flex-grow">
                        <label
                            htmlFor="category-name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Category Name
                        </label>
                        <input
                            type="text"
                            id="category-name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="e.g., Groceries"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Create
                    </button>
                </form>
                {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
            </div>

            {/* Your Categories Card */}
            <div className="bg-white shadow-lg overflow-hidden rounded-lg">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Your Categories</h2>
                </div>

                {/* Using a simple list, but could be converted to a table like transactions */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total
                                Spending
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.id}>
                                {editingCategory?.id === category.id ? (
                                    // --- Editing Cell ---
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="text"
                                            defaultValue={category.name}
                                            onBlur={(e) =>
                                                handleUpdateCategory(category.id, e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter")
                                                    handleUpdateCategory(category.id, e.target.value);
                                            }}
                                            className="text-sm font-medium text-gray-900 border-gray-300 rounded-md px-2 py-1"
                                            autoFocus
                                        />
                                    </td>
                                ) : (
                                    // --- Display Cell ---
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm font-medium text-gray-900">
                                            {category.name}
                                        </p>
                                    </td>
                                )}
                                {/* Total Spending */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <p
                                        className={`text-sm font-semibold ${
                                            category.totalSpending < 0
                                                ? "text-red-600"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        {format(category.totalSpending)}
                                    </p>
                                </td>
                                {/* Actions */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button
                                        onClick={() => setEditingCategory(category)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        title="Edit"
                                    >
                                        <Pencil size={16}/>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Delete"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CategoryManagerPage;