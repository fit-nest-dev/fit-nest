import React, { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Component to manage suggested products on the home page.
 * Allows Admins to view, select, and save up to 4 products to be shown on the home page.
 * Fetches all products and the current suggested products from the backend on load.
 * Provides a button to save the selected products, and displays a success message on success.
 * @component
 * @returns {JSX.Element} A JSX element that renders the manage suggested products interface.
 */
const ManageSuggestedProducts = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [resources, setResources] = useState([]);
  const fetchResources = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/Admin/AllResources');
      setResources(response.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    // Fetch all products on component load
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products/AllProducts', { withCredentials: true }); // Update with your backend route
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
    fetchResources();
  }, []);

  /**
   * Handles product selection by either adding or removing the product from the
   * selected products array. If the selected products array is full (4 products),
   * an alert is shown to the user.
   * @param {string} productId - The ID of the product to be selected or deselected.
   */
  const handleProductSelect = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else if (selectedProducts.length < 4) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      alert('You can only select up to 4 products.');
    }
  };

  /**
   * Saves the selected products as the suggested products on the home page.
   * If the selected products array is not full (4 products), an alert is shown to the user.
   * Otherwise, sends a POST request to the server to update the suggested products resource.
   * If the server responds with a success message, clears the selected products array, fetches the updated resources, and shows a success alert.
   * If the server responds with an error, logs the error to the console.
   */
  const saveSuggestedProducts = async () => {
    if (selectedProducts.length !== 4) {
      alert('Please select exactly 4 products.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/Admin/save-suggested-products', { productIds: selectedProducts }
        , { withCredentials: true }
      );
      setSelectedProducts([]);
      fetchResources();
      alert('Suggested products updated successfully!');
    } catch (error) {
      console.error('Error saving suggested products:', error);
    }
  };

  return (
    <div className="p-1 bg-black text-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-white">Manage Suggested Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="p-6 bg-black border border-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-white mb-2">{product.product_name}</h2>
            <p className="text-green-400 font-semibold text-lg">₹{product.price}</p>

            <button
              className={`mt-4 px-6 py-2 rounded-lg font-medium text-white ${selectedProducts.includes(product._id) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                } transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              onClick={() => handleProductSelect(product._id)}
            >
              {selectedProducts.includes(product._id) ? 'Remove' : resources.find((resource) => resource.title === 'SUGGESTED_PRODUCTS')?.customResource?.map((product) => product._id).includes(product._id) ? 'Deselect' : 'Select'}
            </button>

            {resources.find((resource) => resource.title === 'SUGGESTED_PRODUCTS')?.customResource?.map((product) => product._id).includes(product._id) && (
              <div className="mt-3 text-green-400 p-2 bg-black text-sm rounded-lg">
                Shown on home page
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={saveSuggestedProducts}
        className="bg-gradient-to-r from-green-500 to-green-700 text-white py-4  px-8 font-bold mt-5 hover:from-green-600 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        Save Suggested Products
      </button>
    </div>

  );
};

export default ManageSuggestedProducts;
