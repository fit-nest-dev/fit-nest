import React, { useEffect, useMemo, useState,useRef }from "react";
import { Box, Typography, TextField, Button, Grid, IconButton, Divider } from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Importing ArrowBackIcon
import "@fontsource/montserrat"; // Importing Montserrat font
import "@fontsource/lora"; // Importing Lora font
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import axios from "axios";
import toast from "react-hot-toast";
const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, setCartItems } = useCart();
  const [guestDetails, setGuestDetails] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact: "",
    address: "",
  });
  const { productsMap, Authuser, setProductsMap, setOrderingProduct } = useAuthContext();
  const [editedAddress, setEditedAddress] = useState(Authuser?.Address || "");
  const GetProductById = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/product-by-id/${id}`, { withCredentials: true });
      if (response.status === 200) {
        return response.data;
      }
    }
    catch (Err) {
      console.log(Err);
    }
  }
  const fetchCartProductsOfUser = async (id) => {
    if (id === null) {
      return;
    }
    else {
      try {
        const response = await axios.get(`http://localhost:5000/api/Cart/GetCarts/${id}`, { withCredentials: true });
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
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [coupon, setCoupon] = useState("");
  const isInitialRender = useRef(true);
  const [discount, setDiscount] = useState(0);
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    contact: "+1 234 567 890",
    address: Authuser ? Authuser?.Address : "",
  });

  //   const [totalAmount, setTotalAmount] = useState(0);
  const [discountedAmount, setDiscountedAmount] = useState(0);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(Authuser?.Address);
  //   const totalAmount = selectedProducts.reduce((total, product) => {
  //     const productDetails = productsMap[product.productId];
  //     return total + (productDetails?.price || 0) * product.count ;
  //   }, 0) ;
  const [discountCodes, setDiscountCodes] = useState([]);
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
  const totalAmount = cartItems?.reduce((total, item) => total + (productsMap[item?.cart?.product]?.price || 0) * item?.cart?.count, 0);
  useEffect(() => {
    setProductsMap(JSON.parse(localStorage.getItem("gym-products-map")));
  }, [])
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/AllProducts', { withCredentials: true });
      const map = {};
      response.data.forEach(product => {
        map[product._id] = product;
      });
      localStorage.setItem("gym-products-map", JSON.stringify(map));
      setProductsMap(map);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  useEffect(() => {
    fetchProducts()
  }, []);
  const handleSelectProduct = (product) => {
    const existingProduct = selectedProducts.find((p) => p.productId === product.cart.product);
    if (existingProduct) {
      setSelectedProducts((prev) => prev.filter((p) => p.productId !== product.cart.product));
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        { productId: product.cart.product, count: product.cart.count },
      ]);
    }
  };
  // const handlePlaceOrder = () => {
  //   if(!Authuser){
  //   const products=localStorage.getItem("LocalCart")?JSON.parse(localStorage.getItem("LocalCart")):[]
  //   }
  //   const products = cartItems.map(item => ({
  //       productId: item.cart.product, // Assuming product is the ID
  //       count: item.cart.count,
  //     }));
  //     setSelectedProducts(products);
  //   setOrderingProduct(products);
  //   navigate(`/payment`, { state: {selectedProducts:products ,profileData,discount:totalAmount * discount,GuestDetails:guestDetails} });
  // };

  const handlePlaceOrder = async () => {
    let products = [];
    let localCart = [];
    // Handle case for non-authenticated users
    if (!Authuser) {
      localCart = localStorage.getItem("LocalCart")
        ? JSON.parse(localStorage.getItem("LocalCart"))
        : [];
      // Map local cart items to the products format
      products = localCart.map(item => ({
        productId: item.cart.product, // Assuming cart.product contains the product ID
        count: item.cart.count,
      }));
      // Validate guest details
      if (!guestDetails.first_name || !guestDetails.last_name || !guestDetails.email || !guestDetails.contact || !guestDetails.address) {
        toast.error("Please fill in all guest details to proceed.");
        return;
      }
    } else {
      // For authenticated users, map from `cartItems`
      products = cartItems.map(item => ({
        productId: item.cart.product, // Assuming cart.product is the product ID
        count: item.cart.count,
      }));
    }
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
    // Set selected products and navigate to the payment page
    setSelectedProducts(products);
    setOrderingProduct(products);
    navigate(`/payment`, {
      state: {
        selectedProducts: products,
        profileData, // Use Authuser if logged in, otherwise guestDetails
        discount: totalAmount * discount,
        GuestDetails: guestDetails, // Pass guest details if not logged in
        cartItems: Authuser ? cartItems : localCart,
      },
    });
  };
  const handleIncrement = async (product) => {
    if (!Authuser) {
      try {
        const localCart = JSON.parse(localStorage.getItem("LocalCart")) || [];
        // Check if the product is already in the cart
        const existingProductIndex = localCart.findIndex(
          (item) => item.cart.product === product.cart.product
        );
        if (existingProductIndex !== -1) {
          // Send the existing cart item to the API
          const cartItem = localCart[existingProductIndex];
          const response = await axios.put(
            `http://localhost:5000/api/products/decrementProduct-guest/${product.cart.product}`,
            { cartItem },
            { withCredentials: true }
          );
          if (response.data.message === 'Product stock updated') {
            toast.success('INCREMENTED');
            localCart[existingProductIndex].cart.count += 1;
            setCartItems(localCart);
            setSelectedProducts((prev) =>
              prev.map((p) => (p.productId === product.cart.product ? { ...p, count: p.count - 1 } : p))
            );
          }
        } else {
          // Create a new cart item and send it to the API
          const newCartItem = {
            cart: { product: product.cart.product, count: 1 },
          };

          const response = await axios.put(
            `http://localhost:5000/api/products/decrementProduct-guest/${product.cart.product}`,
            { cartItem: newCartItem },
            { withCredentials: true }
          );
          localCart.push(newCartItem);
        }
        localStorage.setItem("LocalCart", JSON.stringify(localCart));
      } catch (error) {
        toast.error(error.response.data.error);
        console.error("Error decrementing product stock:", error);
      }
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:5000/api/Cart/AddToCart/${Authuser._id}/${product.cart.product}`, {}, { withCredentials: true }
      );
      if (response.data.message === "Product added to cart successfully") {
        toast.success('INCREMENTED');
        setCartItems((prev) =>
          prev.map((p) => (p._id === product._id ? response.data.cartItem : p))
        );
        setSelectedProducts((prev) =>
          prev.map((p) => (p.productId === product.cart.product ? { ...p, count: p.count + 1 } : p))
        );
      }
    } catch (error) {
      toast.error(error.response.data.error);
      console.error("Error adding product to cart:", error);
    }
  };
  const handleDecrement = async (product) => {
    if (!Authuser) {
      try {
        toast.success('one product removed from cart');
        const localCart = localStorage.getItem("LocalCart")
          ? JSON.parse(localStorage.getItem("LocalCart"))
          : [];
        const updatedCart = localCart
          .map((item) =>
            item.cart.product === product.cart.product
              ? { ...item, cart: { ...item.cart, count: item.cart.count - 1 } }
              : item
          )
          .filter((item) => item.cart.count > 0); // Remove items with count 0
        localStorage.setItem("LocalCart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        setSelectedProducts((prev) =>
          prev.map((p) => (p.productId === product.cart.product ? { ...p, count: p.count - 1 } : p))
        );
      }
      catch (error) {
        console.log('Error decrementing product count:', error);
      }
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:5000/api/Cart/DecrementCart/${Authuser._id}/${product.cart.product}`
        , {}, { withCredentials: true }
      );
      if (response.data.message === "Product removed from cart successfully") {
        toast.success('one product removed from cart');
        setCartItems((prev) =>
          prev.map((p) => (p._id === product._id ? response.data.cartItem : p))
        );
        setSelectedProducts((prev) =>
          prev.map((p) => (p.productId === product.cart.product ? { ...p, count: p.count - 1 } : p))
        );
      }
    } catch (error) {
      console.error("Error decrementing product count:", error);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!Authuser) {
      const localCart = localStorage.getItem("LocalCart")
        ? JSON.parse(localStorage.getItem("LocalCart"))
        : [];
      const updatedCart = localCart.filter(
        (item) => item.cart.product !== productId
      );
      localStorage.setItem("LocalCart", JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      setSelectedProducts((prev) => prev.filter((product) => product.productId !== productId));
      return;
    }
    try {
      const response = await axios.delete(`http://localhost:5000/api/Cart/DeleteFromCart/${Authuser._id}/${productId}`,
        { withCredentials: true }
      );
      if (response.data.message === 'Product deleted from cart successfully') {
        setCartItems(prevItems => prevItems.filter(item => item.cart.product !== productId));
        setSelectedProducts(prevProducts => prevProducts.filter(product => product.productId !== productId));
      }
    }
    catch (error) {

    }
  };

  const handleApplyCoupon = () => {
    const couponObj = discountCodes.find((codeObj) => codeObj.code === coupon);

    if (couponObj) {
      setDiscount(couponObj.value); // Set the discount percentage dynamically
      setDiscountedAmount(totalAmount - totalAmount * couponObj.value); // Calculate the discounted amount
      alert(`Coupon applied! You saved ${(couponObj.value * 100).toFixed(0)}%.`);
    } else {
      setDiscount(0); // Reset discount if the coupon is invalid
      alert("Invalid coupon code.");
    }
  };

  useEffect(() => {  
    if (isInitialRender.current) {
      isInitialRender.current = false; // Prevent toast on initial render
      return;
    }
    if (cartItems?.length === 0) {
      toast.error('Your cart is empty');
    }
  }, [cartItems?.length]);
  const handleSaveAddress = async () => {
    if (!Authuser) {
      setProfileData({ ...profileData, address: newAddress });
      setIsEditingAddress(false); // Exit editing mode after saving
      return;
    }
    else {
      try {
        const response = await axios.put(`http://localhost:5000/api/users/change-address/${Authuser._id}`, { address: editedAddress }, { withCredentials: true });
        if (response.status === 200) {
          toast.success('Address updated successfully');
          localStorage.setItem("gym-user", JSON.stringify(response.data));

          setProfileData({ ...profileData, address: newAddress });
          setIsEditingAddress(false); // Exit editing mode after saving
        }
      }
      catch (err) {
        console.error('Error saving address:', err);
      }
    }
  };

  const handleBack = () => {
    window.history.back(); // Going back to the previous page
  };

  return (
    <Box sx={{
      padding: "40px",
      fontFamily: "'Montserrat', sans-serif", // Using Montserrat font
      backgroundColor: "#000000",
      color: "#fff",
      minHeight: "100vh",
    }}>
      <Box sx={{
        position: "absolute",
        top: "20px",
        left: "20px",
      }}>
        <IconButton onClick={handleBack} sx={{
          color: "#4caf50",
          "&:hover": {
            backgroundColor: "#333",
            color: "#fff",
          },
        }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Typography variant="h4" sx={{
        textAlign: "center",
        marginBottom: "20px",
        letterSpacing: "2px",
        color: "#ffffff",
        fontWeight: 1000,
      }}>
        Your Cart
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              padding: "20px",
              background: "#000000",
              borderRadius: "16px",
              boxShadow: "0 0 5px rgba(0, 255, 0, 0.3)",
              transition: "transform 0.3s ease-in-out",
              maxHeight: "740px", // Further increased height to make the box more spacious
              overflowY: "auto",
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            {cartItems?.length > 0 ? (
              cartItems?.map((item, index) => (
                <Grid container spacing={2} key={index} sx={{ marginBottom: "20px" }}>
                  <Grid item xs={12} sm={4}>
                    <img
                      src={productsMap[item?.cart?.product]?.image_url}
                      alt={productsMap[item?.cart?.product]?.product_name}
                      style={{
                        width: "100%",
                        borderRadius: "12px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Box sx={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: "1.25rem",
                          fontWeight: "600",
                          color: "#fff",
                        }}
                      >
                        {productsMap[item?.cart?.product]?.product_name}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        marginBottom: "10px",
                        fontSize: "1rem",
                        color: "#bbb",
                      }}
                    >
                      <strong>Price:</strong> ₹{productsMap[item?.cart?.product]?.price * item?.cart?.count}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "20px",
                        justifyContent: "space-between",
                        width: "160px",
                        borderRadius: "12px",
                        backgroundColor: "#333",
                        padding: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      <IconButton
                        disabled={item.cart.count === 1}
                        onClick={() => handleDecrement(item)}
                        sx={{
                          color: "#fff",
                          "&:hover": { backgroundColor: "#f44336", color: "#fff" },
                        }}
                      >
                        <RemoveCircleIcon />
                      </IconButton>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "1.2rem",
                          color: "#fff",
                          fontWeight: "600",
                        }}
                      >
                        {item?.cart?.count}
                      </Typography>
                      <IconButton
                        onClick={() => handleIncrement(item)}
                        sx={{
                          color: "#fff",
                          "&:hover": { backgroundColor: "#4caf50", color: "#fff" },
                        }}
                      >
                        <AddCircleIcon />
                      </IconButton>
                    </Box>
                    <IconButton
                      onClick={() => handleRemoveFromCart(item?.cart?.product)}
                      sx={{
                        color: "#fff",
                        marginTop: "10px",
                        "&:hover": { color: "#fff", backgroundColor: "#f44336" },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))
            ) : (
              <>
              <Typography
                variant="h6"
                textAlign="center"
                color="#888"
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: "500",
                  fontFamily: "'Roboto', sans-serif",
                }}
                >
                Your cart is empty.
              </Typography>
                </>
              
            )}
          </Box>

        </Grid>


        {/* Right Section (Checkout and Profile) */}
        <Grid item xs={12} md={4}>

          <Box
            sx={{
              background: "#000000", // Updated gradient
              borderRadius: "16px",
              boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.25)", // Added shadow
              padding: "24px",
              maxWidth: "600px",
              margin: "0 auto", // Center align
              color: "#FFFFFF",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                marginBottom: "24px",
                textAlign: "center",
                color: "#4caf50",
              }}
            >
              Your Profile
            </Typography>

            <Typography variant="body1" sx={{ marginBottom: "15px" }}>
              <label className="block text-white font-medium mb-2">First Name:</label>
              {Authuser ? (
                <input
                  type="text"
                  className="text-black bg-white w-full border border-gray-300 rounded-md px-4 py-2 focus:ring focus:ring-[#4caf50]"
                  value={Authuser?.first_name}
                  onChange={(e) =>
                    Authuser((prev) => ({ ...prev, first_name: e.target.value }))
                  }
                />
              ) : (
                <input
                  type="text"
                  placeholder="Enter your first name"
                  className="text-black bg-white w-full border border-gray-300 rounded-md px-4 py-2 focus:ring focus:ring-[#4caf50]"
                  value={guestDetails?.first_name}
                  onChange={(e) =>
                    setGuestDetails((prev) => ({ ...prev, first_name: e.target.value }))
                  }
                />
              )}
            </Typography>

            <Typography variant="body1" sx={{ marginBottom: "15px" }}>
              <label className="block text-white font-medium mb-2">Last Name:</label>
              {Authuser ? (
                <input
                  type="text"
                  className="text-black bg-white w-full border border-gray-300 rounded-md px-4 py-2 focus:ring focus:ring-[#4caf50]"
                  value={Authuser?.last_name}
                  onChange={(e) =>
                    Authuser((prev) => ({ ...prev, last_name: e.target.value }))
                  }
                />
              ) : (
                <input
                  type="text"
                  placeholder="Enter your last name"
                  className="text-black bg-white w-full border border-gray-300 rounded-md px-4 py-2 focus:ring focus:ring-[#4caf50]"
                  value={guestDetails.last_name}
                  onChange={(e) =>
                    setGuestDetails((prev) => ({ ...prev, last_name: e.target.value }))
                  }
                />
              )}
            </Typography>

            <Typography variant="body1" sx={{ marginBottom: "15px" }}>
              <label className="block text-white font-medium mb-2">Email:</label>
              {Authuser ? (
                <input
                  type="email"
                  className="text-black bg-white w-full border border-gray-300 rounded-md px-4 py-2 focus:ring focus:ring-[#4caf50]"
                  value={Authuser.email}
                  onChange={(e) =>
                    Authuser((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              ) : (
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="text-black bg-white w-full border border-gray-300 rounded-md px-4 py-2 focus:ring focus:ring-[#4caf50]"
                  value={guestDetails.email}
                  onChange={(e) =>
                    setGuestDetails((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              )}
            </Typography>

            <Typography variant="body1" sx={{ marginBottom: "15px" }}>
              <label className="block text-white font-medium mb-2">Contact:</label>
              {Authuser ? (
                <input
                  type="tel"
                  className="text-black bg-white w-full border border-gray-300 rounded-md px-4 py-2 focus:ring focus:ring-[#4caf50]"
                  value={Authuser.mobile_number}
                  onChange={(e) =>
                    Authuser((prev) => ({ ...prev, mobile_number: e.target.value }))
                  }
                />
              ) : (
                <input
                  type="tel"
                  placeholder="Enter your contact number"
                  className="text-black bg-white w-full border border-gray-300 rounded-md px-4 py-2 focus:ring focus:ring-[#4caf50]"
                  value={guestDetails.contact}
                  onChange={(e) =>
                    setGuestDetails((prev) => ({ ...prev, contact: e.target.value }))
                  }
                />
              )}
            </Typography>

            <Typography variant="body1" sx={{ marginBottom: "15px" }}>
              <label className="block text-white font-medium mb-2">Address:</label>
              {Authuser ? (
                <input
                  type="text"
                  className="text-black bg-white w-full border border-gray-300 rounded-md px-4 py-2 focus:ring focus:ring-[#4caf50]"
                  value={editedAddress}
                  onChange={(e) => setEditedAddress(e.target.value)}
                  onBlur={handleSaveAddress}
                />
              ) : (
                <input
                  type="text"
                  placeholder="Enter your address"
                  className="text-black bg-white w-full border border-gray-300 rounded-md px-4 py-2 focus:ring focus:ring-[#4caf50]"
                  value={guestDetails.address}
                  onChange={(e) =>
                    setGuestDetails((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
              )}
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginTop: "24px",
              }}
            >
            </Box>



          </Box>


          <Divider sx={{ margin: "20px 0", borderColor: "#444" }} />
          <Box sx={{
            padding: "20px",
            background: "#000000", // Updated gradient with less green
            borderRadius: "12px",
            // Green shadow effect
            transition: "transform 0.3s ease-in-out",
            // Spacing between checkout and profile
          }}>
            <Typography variant="h5" sx={{
              fontWeight: "bold",
              marginBottom: "20px",
              textAlign: "center",
              color: "#4caf50",
              fontFamily: "'Roboto', sans-serif",
            }}>
              Apply a Promo Code
            </Typography>
            <TextField
              label="Promo Code"
              variant="outlined"
              fullWidth
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              sx={{
                marginBottom: "10px",
                backgroundColor: "black", // Background color for the TextField
                borderRadius: "8px",
                '& .MuiOutlinedInput-root': {
                  backgroundColor: "black", // Background for the input area
                  color: "white", // Text color inside the input
                  '& fieldset': {
                    borderColor: "#4caf50", // Green border color
                  },
                  '&:hover fieldset': {
                    borderColor: "#4caf50", // Green border on hover
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: "#4caf50", // Green border on focus
                  },
                },
                '& .MuiInputLabel-root': {
                  color: "white", // Label color
                  '&.Mui-focused': {
                    color: "#4caf50", // Label color when focused
                  },
                },
              }}
            />


            <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "green",
                    color: "#fff",
                    padding: "8px 16px", // Reduced padding for a more compact button
                    // Slightly rounded corners for a modern look
                    fontWeight: "bold",
                    fontSize: "14px", // Reduced font size for better balance
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 8px rgba(76, 175, 80, 0.3)", // Lighter shadow for a subtler effect
                    "&:hover": {
                      backgroundColor: "#388e3c",
                      boxShadow: "0 6px 12px rgba(56, 142, 60, 0.4)",
                      transform: "translateY(-2px)", // Slight lift effect on hover
                    },
                    "&:active": {
                      backgroundColor: "#2e7d32",
                      boxShadow: "0 2px 4px rgba(46, 125, 50, 0.4)", // Subtle active effect
                      transform: "translateY(0)",
                    },
                    mt: 2, // Added margin-top for spacing
                  }}
                  onClick={handleApplyCoupon}
                >
                  Apply Coupon
                </Button>
              </Box>

            </Box>
            <Divider sx={{ margin: "20px 0", borderColor: "#444" }} />
            <Box sx={{
              padding: "20px",
              background: "#000000", // Updated gradient with less green
              borderRadius: "12px",
              // Green shadow effect
              transition: "transform 0.3s ease-in-out",
              // Spacing between checkout and profile
            }}></Box>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{
                marginBottom: "10px",
                fontSize: "18px",
                fontWeight: "500",
                color: "white",
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              <strong>Subtotal</strong>: ₹{totalAmount.toFixed(2)}
            </Typography>

            <Typography
              variant="body1"
              textAlign="center"
              sx={{
                marginBottom: "10px",
                fontSize: "18px",
                fontWeight: "500",
                color: "white",
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              <strong>Order Discount</strong>: ₹{Math.ceil(totalAmount * discount).toFixed(2)}
            </Typography>

            <Typography
              variant="body1"
              textAlign="center"
              sx={{
                marginTop: "20px",
                fontSize: "20px",
                fontWeight: "600",
                color: "#4caf50",
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              <strong>Grand Total</strong>: ₹{(totalAmount - Math.ceil(totalAmount * discount)).toFixed(2)}
            </Typography>


            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "20px", // Space above the button
              }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "green",
                  color: "#fff",
                  padding: "8px 16px", // Reduced padding for a more compact button
                  // Slightly rounded corners for a modern look
                  fontWeight: "bold",
                  fontSize: "14px", // Reduced font size for better balance
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 8px rgba(76, 175, 80, 0.3)", // Lighter shadow for a subtler effect
                  "&:hover": {
                    backgroundColor: "#388e3c",
                    boxShadow: "0 6px 12px rgba(56, 142, 60, 0.4)",
                    transform: "translateY(-2px)", // Slight lift effect on hover
                  },
                  "&:active": {
                    backgroundColor: "#2e7d32",
                    boxShadow: "0 2px 4px rgba(46, 125, 50, 0.4)", // Subtle active effect
                    transform: "translateY(0)",
                  },
                  mt: "2",
                }}
                onClick={() => handlePlaceOrder()}
              >
                Checkout
              </Button>
            </Box>
            <Divider sx={{ margin: "20px 0", borderColor: "#444" }} />
          </Box>

          {/* Profile Section */}

        </Grid>
      </Grid>
    </Box>
  );
};

export default CartPage;