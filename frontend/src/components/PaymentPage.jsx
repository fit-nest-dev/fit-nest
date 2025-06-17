import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Paper,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";

/**
 * The PaymentPage component renders the payment page where the user can review their order details
 * and make the payment. This component is only accessible when the user has selected products and
 * has logged in or filled in the guest details form.
 *
 * @returns The PaymentPage component.
 */
const PaymentPage = () => {
  const { Authuser, productsMap, setProductsMap } = useAuthContext();
  const [loading, setloading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, setCartItems } = useCart();

  /**
   * Fetches all products from the backend and updates the product map in the context.
   * Additionally, stores the product map in local storage for persistence.
   * The map is a dictionary where the keys are product IDs and values are product objects.
   * Handles and logs any errors encountered during the fetch operation.
   * @async
   * @returns {Promise<void>}
   */

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://3.25.86.182:5000/api/products/AllProducts",
        { withCredentials: true }
      );
      const map = {};
      response.data.forEach((product) => {
        map[product._id] = product;
      });
      setProductsMap(map);
      localStorage.setItem("gym-products-map", JSON.stringify(map));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchCartProductsOfUser = async (id) => {
    if (id === null) {
      return;
    }
    else {
      try {
        const response = await axios.get(`http://3.25.86.182:5000/api/Cart/GetCarts/${id}`, { withCredentials: true });
        setCartItems(response.data);
      }
      catch (error) {
        console.error('Error fetching user:', error);
      }
    }
  }
  useEffect(() => {
    if (!Authuser) {
      const localCart = localStorage.getItem("LocalCart")
        ? JSON.parse(localStorage.getItem("LocalCart"))
        : [];
      setCartItems(localCart);
    }
  }, [Authuser]);
  useEffect(() => {
    fetchCartProductsOfUser(Authuser ? Authuser._id : null);

  }, [])
  useEffect(() => {
    fetchProducts();
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { selectedProducts, profileData, discount, GuestDetails } = location.state || {};
  if (!selectedProducts || selectedProducts.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="#fff">
          No products selected for payment.
        </Typography>
        <button
          // variant="contained"
          onClick={() => navigate("/shop")}
          className="bg-[#4caf50] text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300 ease-in-out"
        >
          Back to Shop
        </button>

      </Box>
    );
  }

  const totalPrice = selectedProducts.reduce((total, product) => {
    const productDetails = productsMap[product.productId];
    return total + (productDetails?.price || 0) * product.count;
  }, 0);
  // const handleRemoveFromCart = async (selectedProducts) => { 
  //   try {
  //     selectedProducts.forEach(async (product) => {
  //       const response = await axios.delete(
  //         `http://3.25.86.182:5000/api/Cart/DeleteFromCartAfterOrder/${Authuser._id}/${product.productId}`
  //         ,{withCredentials:true}
  //       );
  //       if (response.data.message === "Product deleted from cart successfully") {
  //       }
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  const handleRemoveFromCart = async (selectedProducts) => {
    if (!Authuser) {
      try {
        for (const product of selectedProducts) {
          const response = await axios.put(
            `http://3.25.86.182:5000/api/Cart/DeleteFromCartAfterOrder-guest/${product.productId}`
            , { count: product.count }
            , { withCredentials: true }
          );
          if (response.data.message !== "Product deleted from cart successfully") {
            throw new Error(`Failed to remove product from cart: ${product.productId}`);
          }
        }
        localStorage.removeItem("LocalCart");
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        // Remove items from the authenticated user's cart
        for (const product of selectedProducts) {
          const response = await axios.delete(
            `http://3.25.86.182:5000/api/Cart/DeleteFromCartAfterOrder/${Authuser._id}/${product.productId}`,
            { withCredentials: true }
          );
          if (response.data.message !== "Product deleted from cart successfully") {
            throw new Error(`Failed to remove product from cart: ${product.productId}`);
          }
        }
      } catch (error) {
        console.error("Error deleting products from cart:", error);
      }
    }
  };
  const handlePlaceLockOnOrder = async (selectedProducts) => {
    if (!Authuser) {
      try {
        for (const product of selectedProducts) {
          const response = await axios.put(`http://3.25.86.182:5000/api/Cart/lockProductDuringPay-guest/${product.productId}`,
            { count: product.count },
            { withCredentials: true });
          if (response.data.message !== "Product locked successfully") {
            throw new Error("Failed to lock product");
          }
        }
      }
      catch (err) {
        console.log(err);
      }
    }
    try {
      for (const product of selectedProducts) {
        const response = await axios.put(`http://3.25.86.182:5000/api/Cart/lockProductDuringPay/${product.productId}/${Authuser._id}`, {}, { withCredentials: true });
        if (response.data.message !== "Product locked successfully") {
          throw new Error("Failed to lock product");
        }
      }
    }
    catch (err) {
      console.log(err);
    }
  }
  const handleReleaseLockDue = async (selectedProducts) => {
    if (!Authuser) {
      try {
        for (const product of selectedProducts) {
          const response = await axios.put(`http://3.25.86.182:5000/api/Cart/releaseLockDueToPayFailure-guest/${product.productId}`,
            { count: product.count },
            { withCredentials: true });
          if (response.data.message !== "Product unlocked successfully") {
            throw new Error("Failed to unlock product");
          }
        }
      }
      catch (err) {
        console.log(err);
      }
    }
    try {
      for (const product of selectedProducts) {
        const response = await axios.put(`http://3.25.86.182:5000/api/Cart/releaseLockDueToPayFailure/${product.productId}/${Authuser._id}`, {}, { withCredentials: true });
        if (response.data.message !== "Product unlocked successfully") {
          throw new Error("Failed to unlock product");
        }
      }
    }
    catch (err) {
      console.log(err);
    }
  }
  const handlePayment = async () => {
    const response = await fetch('/api/Cart/validate-stock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartItems }), // Pass the cartItems array as is
    });

    const result = await response.json();
    if (response.status === 400) {
      result.outOfStock.forEach(product => {
        toast.error(`Requested count of ${productsMap[product.productId].product_name} is not availaible, decrement the count`, { duration: 6000 });
      });
      return;
    }
    try {
      const orderResponse = await axios.post(
        Authuser ? "http://3.25.86.182:5000/api/Payment/create-order-multiple"
          : "http://3.25.86.182:5000/api/Payment/create-order-multiple-guest",
        {
          userId: !Authuser ? 'GUEST_USER' : Authuser._id,
          products: selectedProducts,
          totalPrice: totalPrice - Math.ceil(discount),
          address: !Authuser ? GuestDetails.address : Authuser?.Address,
        },
        { withCredentials: true }
      );
      const { orderId, amount, currency } = orderResponse.data;
      await handlePlaceLockOnOrder(selectedProducts);
      setloading(true);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Replace with your Razorpay Key ID
        amount: amount * 100, // Amount in paise
        currency: currency,
        name: "FIT-NEST-GYM",
        description: `Order Payment for ${orderId}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            fetchProducts();
            const verificationResponse = await axios.post(
              Authuser ? "http://3.25.86.182:5000/api/Payment/verify-payment-for-multiple" :
                "http://3.25.86.182:5000/api/Payment/verify-payment-for-multiple-guest",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                AuthUserId: !Authuser ? 'GUEST_USER' : Authuser._id,
                UserEmail: !Authuser ? GuestDetails?.email : Authuser?.email,
                UserContact: !Authuser ? GuestDetails?.contact : Authuser?.mobile_number,
                UserName: !Authuser ? GuestDetails?.first_name + " " + GuestDetails?.last_name : Authuser?.first_name + " " + Authuser?.last_name,
                products: selectedProducts.map((product) => ({
                  productId: product.productId,
                  quantity: product.count,
                  price: productsMap[product.productId]?.price,
                  productName: productsMap[product.productId]?.product_name,
                })),
                totalAmount: totalPrice - Math.ceil(discount),
                address: !Authuser ? GuestDetails.address : Authuser?.Address,
                email: !Authuser ? GuestDetails?.email : Authuser?.email,
                first_name: !Authuser ? GuestDetails?.first_name : Authuser?.first_name,
                last_name: !Authuser ? GuestDetails?.last_name : Authuser?.last_name,
              }, { withCredentials: true }
            );
            if (verificationResponse.data.success) {
              setloading(false);
              toast.success("Payment successful!");
              navigate(
                "/success/" + orderId + "/" + (!Authuser ? "GUEST_USER" : Authuser._id),
                {
                  state: {
                    selectedProducts,
                    invoice_url: verificationResponse.data.invoice_url,
                    GuestDetails: !Authuser ? GuestDetails : "",
                  },
                }
              );
              handleRemoveFromCart(selectedProducts);
            } else {
              setloading(false);
              await handleReleaseLockDue(selectedProducts);
              toast.error("Payment verification failed. Please contact support.");
              navigate(
                `/Check-Status/${response.razorpay_payment_id}/${totalPrice.toFixed(
                  2
                ) - Math.ceil(discount)}`
              );
            }
          } catch (error) {
            setloading(false);
            await handleReleaseLockDue(selectedProducts);
            toast.error("Payment verification failed. Please contact support.");
            console.error("Payment verification failed:", error);
            navigate(
              `/Check-Status/${response.razorpay_payment_id}/${totalPrice.toFixed(
                2
              ) - Math.ceil(discount)}`
            );
          }
        },
        modal: {
          ondismiss: async () => {
            await handleReleaseLockDue(selectedProducts);
            setloading(false);
          }
        },
        prefill: {
          name: !Authuser ? GuestDetails.first_name + " " + GuestDetails.last_name : Authuser.first_name + " " + Authuser.last_name,
          email: !Authuser ? GuestDetails.email : Authuser.email,
        },
        theme: {
          color: "#28a745",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bgcolor="black"
      color="white"
      minHeight="100vh"
      p={4}
    >
      <Typography
        variant="h3"
        fontWeight="900"
        mb={5}
        color="#28a745"
        letterSpacing={1.5}
      >
        Review Your Order
      </Typography>
      <Paper
        sx={{
          width: "100%",
          maxWidth: 700,
          bgcolor: "#000000",
          p: 3,
          borderRadius: 2,
          boxShadow: "0px 4px 12px rgba(117, 112, 112, 0.4)",
          marginBottom: "5",
        }}
      >
        {/* Personal Details Section */}
        <Box
          sx={{ width: "100%", bgcolor: "#000000", p: 3, borderRadius: 1, mb: 2 }}
        >
          <Typography variant="h5" fontWeight="bold" color="#fff">
            Personal Details
          </Typography>
          <Divider sx={{ bgcolor: "#444", my: 2 }} />
          <Typography color="#fff">
            <strong>Name:</strong> {!Authuser ? GuestDetails?.first_name + " " + GuestDetails?.last_name : Authuser?.first_name + " " + Authuser?.last_name}
          </Typography>
          <Typography color="#fff">
            <strong>Email:</strong> {!Authuser ? GuestDetails?.email : Authuser?.email}
          </Typography>
          <Typography color="#fff">
            <strong>Contact:</strong> {!Authuser ? GuestDetails?.contact : Authuser?.mobile_number}
          </Typography>
          <Typography color="#fff">
            <strong>Address:</strong>  {!Authuser ? GuestDetails?.address : Authuser?.Address}
          </Typography>
        </Box>

        {/* Order Details Section */}
        <Box sx={{ width: "100%", bgcolor: "#000000", p: 3, borderRadius: 1 }}>
          <Typography variant="h5" fontWeight="bold" color="#fff">
            Order Details
          </Typography>
          <Divider sx={{ bgcolor: "#444", my: 2 }} />
          <List
            sx={{
              maxHeight: "300px",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#555",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#777",
              },
            }}
          >
            {selectedProducts.map((product, index) => {
              const productDetails = productsMap[product.productId];
              return (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography
                          color="#ffffff"
                          fontWeight="bold"
                          variant="h6"
                        >
                          {productDetails?.product_name || "Unknown Product"}
                        </Typography>
                      }
                      secondary={
                        <Typography color="gray" fontSize="small">
                          Price: ₹{productDetails?.price || 0} x{" "}
                          {product.count}
                        </Typography>
                      }
                    />
                    <Typography
                      color="#28a745"
                      fontWeight="bold"
                      variant="h6"
                    >
                      ₹
                      {productDetails?.price
                        ? productDetails.price * product.count
                        : 0}
                    </Typography>
                  </ListItem>
                  <Divider sx={{ bgcolor: "#444" }} />
                </React.Fragment>
              );
            })}
            <ListItem>
              <Box width="100%" display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="gray">Total Price:</Typography>
                  <Typography color="white">
                    ₹{totalPrice.toFixed(2)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="gray">Discount:</Typography>
                  <Typography color="#28a745">
                    -₹{Math.ceil(discount)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography
                    variant="h6"
                    color="#28a745"
                    fontWeight="bold"
                  >
                    Payable Amount:
                  </Typography>
                  <Typography
                    variant="h6"
                    color="white"
                    fontWeight="bold"
                  >
                    ₹{(totalPrice - Math.ceil(discount)).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
          </List>
        </Box>
      </Paper>
      <Button
        variant="contained"
        sx={{
          mt: 6,
          bgcolor: "#28a745",
          color: "white",
          boxShadow: "0px 4px 8px rgba(0,0,0,0.3)",
          transition: "0.3s",
          "&:hover": {
            transform: "scale(1.05)",
            bgcolor: "#1f8735",
          },
        }}
        onClick={handlePayment}
      >
        Confirm and Pay
      </Button>
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
              Processing your payment and order...
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PaymentPage;
