import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, Divider, CircularProgress, Paper } from '@mui/material';
import { useAuthContext } from '../context/AuthContext';

/**
 * A component that displays a success page after a successful order.
 * 
 * This component fetches order details based on the user's authentication status.
 * If the user is not authenticated, it fetches the order details for a guest user.
 * If the user is authenticated, it fetches the order details for the authenticated user.
 * Displays a loading indicator while fetching data.
 * Shows order details, personal information, and order summary upon successful data retrieval.
 * Provides a link to the invoice and a button to return to the home page.
 * 
 * @returns {JSX.Element} The rendered success page component.
 */

const SuccessPage = () => {
  const { orderId, AuthUserId } = useParams();
  const { Authuser } = useAuthContext();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { invoice_url, GuestDetails } = location.state || {};
  useEffect(() => {
    /**
     * Fetches order details based on the user's authentication status.
     * If the user is not authenticated, fetches order details for a guest user.
     * If the user is authenticated, fetches order details for the authenticated user.
     * Logs any errors encountered during the fetch operation.
     * Sets the loading state to false after the fetch operation is complete.
     */
    const fetchOrderDetails = async () => {
      if (!Authuser) {
        try {
          const response = await axios.get(`http://localhost:5000/api/Order/order-details-guest/${orderId}`);
          setOrderDetails(response.data);
        }
        catch (err) {
          console.log(err)
        }
        finally {
          setLoading(false);
        }
        return;
      }
      try {
        const response = await axios.post(
          `http://localhost:5000/api/Order/order-details/${orderId}/${AuthUserId}`, {}, { withCredentials: true }
        );
        setOrderDetails(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId, AuthUserId]);

  if (loading) {
    return <CircularProgress color="primary" />;
  }

  if (!orderDetails) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '20%' }}>Error loading order details. Please try again later.</div>;
  }

  return (
    <Box
      style={{
        backgroundColor: 'black',
        color: 'white',
        minHeight: '100vh',
        padding: '20px',
        display: 'flex',
        borderRadius: 2,
        boxShadow: "0px 4px 12px rgba(117, 112, 112, 0.4)",
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Typography variant="h3" style={{ fontWeight: 'bold', color: '#4caf50' }}>
          🎉 Payment Successful! 🎉
        </Typography>

        <Typography variant="h6" style={{ marginTop: '10px' }}>
          Thank you for your purchase!
        </Typography>
      </div>
      {/* Personal Details Section */}
      <Paper sx={{
        padding: 3, marginBottom: 3, backgroundColor: '#000000', borderRadius: 2, width: '50%',
        boxShadow: "0px 4px 12px rgba(117, 112, 112, 0.4)"
      }}>
        <Typography variant="h5" fontWeight="bold" color="#fff">Personal Details</Typography>
        <Divider sx={{ bgcolor: "#444", my: 2 }} />
        <Typography color="#fff"><strong>Name:</strong>  {!Authuser ? GuestDetails?.first_name : Authuser?.first_name} {!Authuser ? GuestDetails?.last_name : Authuser?.last_name}</Typography>
        <Typography color="#fff"><strong>Email:</strong>  {!Authuser ? GuestDetails?.email : Authuser?.email}</Typography>
        <Typography color="#fff"><strong>Contact:</strong>  {!Authuser ? GuestDetails?.contact : Authuser?.mobile_number}</Typography>
        <Typography color="#fff"><strong>Address:</strong>  {!Authuser ? GuestDetails?.address : Authuser?.Address} </Typography>
        {/* <Typography color="#fff"><strong>Address:</strong> {profileData?.address || 'No Address Available'}</Typography> */}
      </Paper>

      {/* Order Summary Section */}
      <Paper sx={{
        padding: 3, backgroundColor: '#000000', borderRadius: 2, width: '50%',
        boxShadow: "0px 4px 12px rgba(117, 112, 112, 0.4)",
      }}>
        <Typography variant="h5" fontWeight="bold" color="#fff">Order Summary</Typography>
        <Divider sx={{ bgcolor: "#444", my: 2 }} />
        <Box
          sx={{
            maxHeight: '300px', // Limit height for scrollbar
            overflowY: 'auto',  // Enable vertical scroll when content overflows
          }}
        >
          {orderDetails?.products?.map((product, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <Box sx={{ flex: 3 }}>
                <Typography color="#ffffff" fontWeight="bold">{product?.productName}</Typography>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Typography color="white" fontSize="small">₹{product?.price} x {product?.quantity}</Typography>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Typography color="#28a745" fontWeight="bold" variant="h6">
                  ₹{product?.price * product?.quantity}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Divider sx={{ bgcolor: "#444" }} />
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Typography color="white">Total Amount:</Typography>
          <Typography color="white">₹{orderDetails?.totalAmount}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography color="white">Estimated Delivery:</Typography>
          <Typography color="white">{new Date(orderDetails?.deliveryDate).toLocaleDateString() || 'N/A'}</Typography>
        </Box>
      </Paper>

      {/* Invoice Link */}
      {invoice_url && (
        <Box mt={4} textAlign="center">
          <Typography variant="body1" color="#fff">
            Here is your invoice:
            <a
              href={typeof invoice_url === "string" ? invoice_url : invoice_url?.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4caf50', textDecoration: 'underline' }}
            >
              {typeof invoice_url === "string" ? invoice_url : invoice_url?.url}
            </a>
          </Typography>
        </Box>
      )}

      {/* Back to Home Button */}
      <Button
        onClick={() => window.location.href = '/'}
        style={{
          marginTop: '30px',
          padding: '10px 20px',
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        Back to Home
      </Button>
    </Box>
  );
};

export default SuccessPage;
