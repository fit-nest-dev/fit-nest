import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Component to manage discount codes in the admin dashboard.
 * Fetches the existing discount codes from the server on component load.
 * Allows the admin to add new discount codes and remove existing ones.
 * Saves the updated discount codes to the server when the "Save Discount Codes" button is clicked.
 */
const ManageDiscountCodes = () => {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [newCoupon, setNewCoupon] = useState('');
  const [newDiscountValue, setNewDiscountValue] = useState('');

  // Fetch discount codes on component load
  useEffect(() => {
    const fetchDiscountCodes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/Admin/get-discount-codes', { withCredentials: true }); // Update with your backend route
        setDiscountCodes(response.data || []);
      } catch (error) {
        console.error('Error fetching discount codes:', error);
      }
    };

    fetchDiscountCodes();
  }, []);

  /**
   * Adds a new discount code to the list of discount codes if the input is valid.
   * Checks that the coupon code is not empty and that the discount value is a
   * valid number between 0 and 1 (inclusive). If the input is invalid, shows an
   * alert message. If the input is valid, adds the new discount code to the list
   * and clears the input fields.
   */
  const handleAddCoupon = () => {
    if (!newCoupon.trim()) {
      alert('Coupon code cannot be empty.');
      return;
    }

    const discountValue = parseFloat(newDiscountValue);
    if (isNaN(discountValue) || discountValue <= 0 || discountValue > 1) {
      alert('Discount value must be between 0 and 1 (e.g., 0.15 for 15%).');
      return;
    }

    setDiscountCodes([...discountCodes, { code: newCoupon.trim(), value: discountValue }]);
    setNewCoupon('');
    setNewDiscountValue('');
  };

  /**
   * Removes the discount code at the given index from the list of discount codes.
   * Uses the filter() method to create a new array with all elements except the
   * one at the given index, and then updates the discountCodes state with the
   * new array.
   * @param {number} index - The index of the discount code to remove.
   */
  const handleRemoveCoupon = (index) => {
    const updatedCoupons = discountCodes.filter((_, i) => i !== index);
    setDiscountCodes(updatedCoupons);
  };

  /**
   * Saves the current list of discount codes to the server.
   * 
   * Sends a POST request to the server with the discount codes data. 
   * If the request is successful, an alert is shown indicating success.
   * If an error occurs during the request, it logs the error to the console.
   * 
   * @returns {Promise<void>}
   */

  const saveDiscountCodes = async () => {
    try {
      await axios.post('http://localhost:5000/api/Admin/discount-codes', { discountCodes }, { withCredentials: true });
      alert('Discount codes updated successfully!');
    } catch (error) {
      console.error('Error saving discount codes:', error);
    }
  };
  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-4">Manage Discount Codes</h1>

      <div className="space-y-4">
        {discountCodes?.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 border rounded shadow">
            <span>
              <strong>{item.code}</strong>: {item.value * 100}%
            </span>
            <button
              onClick={() => handleRemoveCoupon(index)}
              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 mt-6 border rounded shadow">
        <h2 className="text-lg font-bold mb-2">Add New Coupon Code</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <input
              type="text"
              value={newCoupon}
              onChange={(e) => setNewCoupon(e.target.value)}
              placeholder="Enter coupon code"
              className="flex-1 p-2 border rounded mr-2"
            />
            <input
              type="number"
              value={newDiscountValue}
              onChange={(e) => setNewDiscountValue(e.target.value)}
              placeholder="Enter discount value (e.g., 0.15 for 15%)"
              className="flex-1 p-2 border rounded mr-2"
            />
            <button
              onClick={handleAddCoupon}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={saveDiscountCodes}
        className="mt-6 bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
      >
        Save Discount Codes
      </button>
    </div>
  );
};

export default ManageDiscountCodes;
