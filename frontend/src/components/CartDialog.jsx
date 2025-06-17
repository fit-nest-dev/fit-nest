import React, { useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Grid,
  Box,
  Checkbox,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";

/**
 * A dialog component that renders a list of products in the cart.
 * Each item in the list displays the product name, price, and quantity.
 * The user can select products to place an order.
 * The user can also remove products from the cart.
 * The component also handles the increment and decrement of the product quantity.
 * If the user is not logged in, the component will display a message to log in.
 * @param {boolean} open Whether the dialog is open or not.
 * @param {function} handleClose Function to close the dialog.
 * @param {array} cartItems The list of products in the cart.
 * @param {function} setcartItems Function to update the cart items.
 * @param {function} handleRemoveFromCart Function to remove a product from the cart.
 * @param {object} ProductMap The map of products.
 * @returns {JSX.Element} The dialog component.
 */
const CartDialog = ({ open, handleClose, cartItems, setcartItems, handleRemoveFromCart, ProductMap }) => {
  const { Authuser } = useAuthContext();
  const navigation = useNavigate();
  const { setOrderingProduct, productsMap, setProductsMap } = useAuthContext();
  const { socket } = useContext(SocketContext);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    socket.on("RemoveFromCart", (data) => {
      const { productId } = data;
      handleRemoveFromCart(productId);
    });
    return () => {
      socket.off("RemoveFromCart");
    };
  }, [socket]);
  /**
   * Fetches all products from the backend and updates the product map in the context.
   * The product map is a dictionary where the keys are the product IDs and the values are the product objects.
   * This function is called once when the component mounts.
   * @async
   */
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://3.25.86.182:5000/api/products/AllProducts', { withCredentials: true });
      const map = {};
      response.data.forEach(product => {
        map[product._id] = product;
      });
      setProductsMap(map);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  useEffect(() => {
    fetchProducts()
  }, [])
  const handleIncrement = async (product) => {
    try {
      const response = await axios.put(
        `http://3.25.86.182:5000/api/Cart/AddToCart/${Authuser._id}/${product.cart.product}`, {}, { withCredentials: true }
      );
      if (response.data.message === "Product added to cart successfully") {
        setcartItems((prev) =>
          prev.map((p) => (p._id === product._id ? response.data.cartItem : p))
        );
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };
  const handleDecrement = async (product) => {
    try {
      const response = await axios.put(
        `http://3.25.86.182:5000/api/Cart/DecrementCart/${Authuser._id}/${product.cart.product}`
        , {}, { withCredentials: true }
      );
      if (response.data.message === "Product deleted from cart successfully") {
        setcartItems((prev) =>
          prev.map((p) => (p._id === product._id ? response.data.cartItem : p))
        );
      }
    } catch (error) {
      console.error("Error decrementing product count:", error);
    }
  };

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
  console.log(productsMap)

  const handlePlaceOrder = () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product to place the order.");
      return;
    }
    setOrderingProduct(selectedProducts);
    navigation(`/payment`, { state: { selectedProducts } });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Your Cart</DialogTitle>
      <DialogContent>
        {cartItems && cartItems.length > 0 ? (
          <List>
            {cartItems.map((item, index) => {
              const product = ProductMap[item?.cart?.product];
              const isSelected = selectedProducts.some((p) => p.productId === item.cart.product);

              return (
                <ListItem key={index} divider>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleSelectProduct(item)}
                  />
                  <ListItemText
                    primary={product?.product_name}
                    secondary={`Price: $${product?.price}`}
                  />
                  <Box display="flex" alignItems="center">
                    <IconButton onClick={() => handleDecrement(item)}>
                      <RemoveCircleIcon />
                    </IconButton>
                    <Typography>{item?.cart?.count}</Typography>
                    <IconButton onClick={() => handleIncrement(item)}>
                      <AddCircleIcon />
                    </IconButton>
                  </Box>
                  <IconButton onClick={() => handleRemoveFromCart(item.cart.product)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography>Your cart is empty.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button disabled={selectedProducts.length === 0} variant="contained" onClick={handlePlaceOrder}>
          Place Order
        </Button >
        <button onClick={() => navigation("/test")}>
          cart new
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default CartDialog;
