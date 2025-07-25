import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryManagerPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [message, setMessage] = useState('');

  // --- Hardcoded user ID for now ---
  const userId = 1;

  // Function to fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/categories/${userId}`);
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
      await axios.post('http://localhost:3001/api/categories', {
        name: newCategoryName,
        userId: userId,
      });
      setNewCategoryName('');
      setMessage(`Category "${newCategoryName}" created successfully!`);
      fetchCategories(); // Refresh the list
    } catch (error) {
      setMessage('Failed to create category. It might already exist.');
      console.error("Failed to create category", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage Categories</h1>

      {/* Create Category Form */}
      <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800">Create New Category</h2>
        <form onSubmit={handleCreateCategory} className="flex items-end space-x-4 mt-4">
          <div className="flex-grow">
            <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              id="category-name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Groceries"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Create
          </button>
        </form>
        {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
      </div>

      {/* List of Existing Categories */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800">Your Categories</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id} className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900">{category.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagerPage;