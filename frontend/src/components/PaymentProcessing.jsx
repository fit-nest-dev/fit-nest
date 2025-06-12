import React, { useState } from 'react';

/**
 * A component that displays a payment page with a button to simulate processing.
 * When the button is clicked, a loading animation is displayed for 5 seconds.
 * The loading animation is a spinning blue circle with a white text message.
 * The component uses the `useState` hook to manage the state of the loading animation.
 * The component uses the `setTimeout` function to simulate the processing time.
 */
const PaymentProcessing = () => {
  const [loading, setLoading] = useState(false);

  const startProcessing = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 5000); // Simulate processing
  };

  return (
    <div className="relative">
      {/* Main Content */}
      <div className={`p-8 ${loading ? 'blur-sm' : ''}`}>
        <h1 className="text-2xl font-bold">Payment Page</h1>
        <button
          onClick={startProcessing}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start Processing
        </button>
      </div>

      {/* Loading Animation */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
            <p className="mt-4 text-white font-semibold">
              PROCESSING YOUR PAYMENT AND ORDER
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentProcessing;
