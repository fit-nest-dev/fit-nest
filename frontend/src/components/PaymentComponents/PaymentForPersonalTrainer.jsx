import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Box, CircularProgress, Typography } from '@mui/material';

const PaymentForPersonalTrainer = () => {
    const { TrainerId, userId, startDate, endDate, amount } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // State to control loading
    const { Authuser } = useAuthContext();
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };


    const handlePayment = async () => {
        try {
            // Check if Razorpay is loaded
            if (!window.Razorpay) {
                toast.error("Payment gateway not loaded. Please refresh the page and try again.");
                return;
            }

            // Check if Razorpay key is available
            if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
                console.error("VITE_RAZORPAY_KEY_ID not found in environment variables");
                toast.error("Payment configuration error. Please contact support.");
                return;
            }

            // Step 1: Create Razorpay order
            const orderResponse = await axios.post('http://3.25.86.182:5000/api/Payment/create-order-for-trainer', {
                TrainerId,
                userId,
                amount: amount,
            }, { withCredentials: true });

            if (!orderResponse.data.orderId) {
                toast.error(orderResponse.data.error || "Failed to create order");
                return;
            }

            const { orderId } = orderResponse.data; // Get orderId from response
            setLoading(true);
            
            // Step 2: Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Replace with Razorpay Key ID
                amount: amount * 100, // Amount in paise
                currency: 'INR',
                name: 'FIT-NEST-GYM',
                description: `Payment for Trainer ${TrainerId}`,
                order_id: orderId, // Razorpay Order ID
                handler: async (response) => {
                    // On payment success, verify the payment
                    try {
                        const verifyResponse = await axios.post(
                            'http://3.25.86.182:5000/api/Payment/verify-payment-for-trainer',
                            {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                razorpay_order_id: response.razorpay_order_id,
                                trainerId: TrainerId,
                                userId,
                                startDate,
                                email: Authuser.email,
                                Name: Authuser.first_name + " " + Authuser.last_name,
                                endDate,
                                amount,
                            }, { withCredentials: true }
                        );

                        // Check if payment is verified successfully
                        if (verifyResponse.data.success) {
                            setLoading(false);
                            toast.success('Payment successful!');
                            navigate(`/Success/:${orderId}/${userId}/${TrainerId}/${amount}`, { 
                                state: { 
                                    invoice_url: verifyResponse.data.invoice_url, 
                                    trainer: verifyResponse.data.trainer 
                                } 
                            });
                        } else {
                            setLoading(false);
                            const errorMsg = verifyResponse.data.error || verifyResponse.data.message || "Payment verification failed";
                            toast.error(errorMsg);
                            navigate(`/Check-Status/${response.razorpay_payment_id}/${amount}`);
                        }
                    } catch (error) {
                        setLoading(false);
                        console.error('Payment verification error:', error);
                        
                        let errorMessage = 'Error verifying payment. Please contact support.';
                        if (error.response?.data?.error) {
                            errorMessage = error.response.data.error;
                        } else if (error.response?.data?.message) {
                            errorMessage = error.response.data.message;
                        } else if (error.message) {
                            errorMessage = error.message;
                        }
                        
                        toast.error(errorMessage);
                        navigate(`/Check-Status/${response.razorpay_payment_id}/${amount}`);
                    }
                },
                prefill: {
                    name: Authuser.first_name + " " + Authuser.last_name,
                    email: Authuser.email,
                    contact: Authuser.mobile_number,
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    }
                },
                theme: {
                    color: '#4CAF50',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Error creating order:', error);
            setLoading(false);
            
            let errorMessage = 'An error occurred. Please try again.';
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.heading}>Payment Confirmation</h1>
                <p style={styles.text}>
                    You are paying <span style={styles.amount}>₹{amount}</span> as a part of Trainer's Fee
                </p>
                <p style={styles.text}>
                    Training Period: <span style={styles.date}>{formatDate(startDate)}</span> to <span style={styles.date}>{formatDate(endDate)}</span>
                </p>

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    style={loading ? { ...styles.button, ...styles.disabledButton } : styles.button}
                >
                    {loading ? 'Processing Payment...' : 'PAY NOW'}
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
                            Processing your payment For Personal Trainer
                        </Typography>
                    </Box>
                </Box>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#fff',
    },
    card: {
        backgroundColor: '#1E1E1E',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
        maxWidth: '400px',
        textAlign: 'center',
    },
    heading: {
        fontSize: '24px',
        marginBottom: '20px',
        color: '#fff',
        fontWeight: 'bold',
    },
    text: {
        fontSize: '16px',
        marginBottom: '10px',
    },
    amount: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    trainerId: {
        color: '#4CAF50',
    },
    date: {
        color: '#FFF',
        fontWeight: 'bold',
        marginBottom: '10px'
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#16A34A',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '16px',
        marginTop: '10px',
        width: '100%'
    },
    disabledButton: {
        backgroundColor: '#666',
        cursor: 'not-allowed',
    },
};

export default PaymentForPersonalTrainer;
