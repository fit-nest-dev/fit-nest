import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthContext } from '../../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const PaymentForMembership = () => {
  const navigate = useNavigate();
  const { type: rawType, price: rawPrice, userId } = useParams();
  const { Authuser } = useAuthContext();
  // Helper function to process `type` and `price`
  const HelperFunction = () => {
    const price = Number(
      rawPrice.replace(',', '').replace('₹', '').replace('/-', '')
    );
    let type = 'Monthly'; // Default value
    if (rawType.toLocaleLowerCase().includes('bi-monthly')) type = 'BiMonthly';
    else if (rawType.toLocaleLowerCase().includes('monthly')) type = 'Monthly';
    else if (rawType.toLocaleLowerCase().includes('quarterly')) type = 'Quarterly';
    else if (rawType.toLocaleLowerCase().includes('quadrimester')) type = 'Quadrimester';
    else if (rawType.toLocaleLowerCase().includes('semi-annual')) type = 'SemiAnnual';
    else if (rawType.toLocaleLowerCase().includes('annual')) type = 'Annual';
    return { type, price };
  };

  // Call helper function and set initial state
  const { type, price } = HelperFunction();
console.log(type, price)
  // States
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // Function to handle both order creation and payment
  const handlePayment = async () => {

    try {
      // Step 1: Create Razorpay order
      const orderResponse = await axios.post(
        'http://3.25.86.182:5000/api/Payment/create-order-for-membership',
        {
          type: type,
          amount: price,
          userId,
        }, { withCredentials: true }
      );

      const { orderId } = orderResponse.data; // Get orderId from response
      setLoading(true);
      // Step 2: Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Replace with Razorpay Key ID
        amount: price * 100, // Amount in paise
        currency: 'INR',
        name: 'FIT-NEST-GYM',
        description: `Payment for ${type} subscription`,
        order_id: orderId, // Razorpay Order ID
        handler: async (response) => {
          // On payment success, verify the payment
          try {
            const verifyResponse = await axios.post(
              'http://3.25.86.182:5000/api/Payment/verify-payment-for-membership',
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                razorpay_order_id: response.razorpay_order_id,
                type: type,
                userId,
                amount: price,
              }, { withCredentials: true }
            );

            // Check if payment is verified successfully
            if (verifyResponse.data.success) {
              toast.success('Payment successful!');
              navigate(
                `/SuccessMembership/${orderId}/${userId}/${type}/${price}`, { state: { invoice_url: verifyResponse.data.invoice_url, userDetails: verifyResponse.data.ChangedUser } }
              );

              localStorage.setItem('gym-user', JSON.stringify(verifyResponse.data.ChangedUser));
            } else {
              // alert('Payment verification failed.');
              navigate(`/Check-Status/${response.razorpay_payment_id}/${price}`);
            }
          } catch (error) {
            toast.error('Error verifying payment. Please contact support.');
            navigate(`/Check-Status/${response.razorpay_payment_id}/${price}`);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        },
        prefill: {
          name: Authuser.first_name + " " + Authuser.last_name,
          email: Authuser.email,
          contact: Authuser.mobile_number,
        },
        theme: {
          color: '#F37254',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      setLoading(false);
    } catch (error) {
      console.error('Error creating order:', error);
      setLoading(false);
      alert('Failed to create an order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full bg-[#1E1E1E] p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Payment for Membership</h2>
        <div className="bg-[#1E1E1E] p-4 rounded-lg mb-6">
          <p className="text-xl  bg-[#1E1E1E] text-white mb-2">
            You are about to buy a <b>{type}</b> subscription for <b>₹{price}</b>
          </p>
        </div>

        <button
          onClick={handlePayment}
          className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition duration-300 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'PAY NOW'}
        </button>
      </div>
      {loading && (
        <Box
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
          sx={{ transition: "opacity 0.3s ease-in" }}
        >
          <Box className="text-center">
            <CircularProgress sx={{ color: "#28a745", size: "50px" }} />
            <Typography
              mt={2}
              variant="h6"
              color="white"
              fontWeight="bold"
            >
              Processing your payment for membership
            </Typography>
          </Box>
        </Box>
      )}
    </div>
  );
};
export default PaymentForMembership;

