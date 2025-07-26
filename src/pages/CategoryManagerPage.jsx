import React, { useState, useEffect } from "react";
import apiClient from "../api/axios";
import { useCurrency } from "../hooks/useCurrency"; // Imported the hook

const CategoryManagerPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [message, setMessage] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const { format } = useCurrency();

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
      await apiClient.post("/categories", { name: newCategoryName });
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
      await apiClient.put(`/categories/${id}`, { name });
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
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Manage Categories
      </h1>

      <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
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
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Create
          </button>
        </form>
        {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800">Your Categories</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li
                key={category.id}
                className="px-6 py-4 flex justify-between items-center"
              >
                {editingCategory?.id === category.id ? (
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
                    className="text-sm font-medium text-gray-900 border rounded px-2 py-1"
                    autoFocus
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">
                    {category.name}
                  </p>
                )}
                <div className="flex items-center space-x-4">
                  <p
                    className={`text-sm font-semibold ${
                      category.totalSpending < 0
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {format(category.totalSpending)}
                  </p>
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagerPage;
