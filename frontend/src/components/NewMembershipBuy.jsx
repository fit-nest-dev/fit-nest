import { Box, CircularProgress, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Signup from '../pages/signup/Signup';
import axios from 'axios';
import toast from 'react-hot-toast';

const NewMembershipBuy = () => {
  const navigate = useNavigate();
  const { type: rawType, price: rawPrice } = useParams();
  const [showPay, setShowPay] = useState(false);
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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [showPay]);
  useEffect(() => {
   window.scrollTo(0, 0);
  }, []);
  // Call helper function and set initial state
  const { type, price } = HelperFunction();
  const [Loading, SetLoading] = useState(false);
  const handlePayment = async () => {
    const userId = localStorage.getItem('AuthuserId').replace(/^"|"$/g, '');
    try {
      // Step 1: Create Razorpay order
      const orderResponse = await axios.post(
        'http://3.25.86.182:5000/api/Payment/create-order-for-new-membership',
        {
          type: type,
          amount: price,
          userId: userId
        }, { withCredentials: true }
      );

      const { orderId } = orderResponse.data; // Get orderId from response
      SetLoading(true);
      // Step 2: Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Replace with Razorpay Key ID
        amount: price * 100, // Amount in paise
        currency: 'INR',
        name: 'FIT-NEST-GYM',
        description: `Payment for ${type} subscription\n Order for ${orderId}`,
        order_id: orderId, // Razorpay Order ID
        handler: async (response) => {
          // On payment success, verify the payment
          try {

            const verifyResponse = await axios.post(
              'http://3.25.86.182:5000/api/Payment/verify-payment-for-new-membership',
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                razorpay_order_id: response.razorpay_order_id,
                type: type,
                userId: userId,
                amount: price,

              }, { withCredentials: true }
            );

            // Check if payment is verified successfully
            if (verifyResponse.data.success) {
              const invoice_url = verifyResponse.data.invoice_url;
              const userDetails = verifyResponse.data.ChangedUser;
              SetLoading(false);
              toast.success('Payment Successful!');
              navigate(
                `/SuccessNewMembership/${orderId}/${userId}/${type}/${price}`, { state: { invoice_url, userDetails } }
              );
            } else {
              // alert('Payment verification failed.');
              SetLoading(false);
              navigate(`/Check-Status/${response.razorpay_payment_id}/${price}`);
            }
          } catch (error) {
            SetLoading(false);
            // console.error('Error verifying payment:', error);
            navigate(`/Check-Status/${response.razorpay_payment_id}/${price}`);
            alert('Error verifying payment. Please contact support.');
          }
        },
        modal: {
          /**
           * Callback function that is invoked when the Razorpay payment modal is dismissed.
           * This function sets the loading state to false and logs a message indicating that
           * the payment window was closed without completing the transaction.
           */

          ondismiss: () => {
            SetLoading(false);
          }
        },
        prefill: {
          name: localStorage.getItem('AuthuserId').replace(/^"|"$/g, ''),
          // email: 'john.doe@example.com',
          // contact: '9876543210',
        },
        theme: {
          color: '#F37254',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      // SetLoading(false);
    } catch (error) {
      console.error('Error creating order:', error);
      SetLoading(false);
      alert('Failed to create an order. Please try again.');
    }
    finally {
      SetLoading(false);
    }
  };
  return (
    <div className='mt-[130px]'

    >
      {showPay &&
        <div className="h-full flex items-center justify-center bg-black" >
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
              disabled={Loading}
            >
              {Loading ? 'Processing...' : 'PAY NOW'}
            </button>
          </div>
        </div>
      }
      <div className='flex gap-1 justify-around bg-black'

      >
        <div

        > {!showPay && <Signup type={type} showPay={showPay} setShowPay={setShowPay} />}</div>

      </div>
      {Loading && (
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
              Processing your payment
            </Typography>
          </Box>
        </Box>
      )}
    </div>
  )
}

export default NewMembershipBuy