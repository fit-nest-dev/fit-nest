import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory
import { FaShoppingCart, FaArrowLeft, FaShippingFast} from "react-icons/fa"; // Import icons
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";


/**
 * Renders a description box for a product, allowing users to view product details
 * and add the product to their cart. The component uses the useAuthContext hook
 * to access the authenticated user and uses the useNavigate hook for navigation.
 * It also retrieves the product information from the location state.
 *
 * The component displays the product image, name, price, and description.
 * It includes a button to navigate back to the shop and a button to add the
 * product to the cart. When the "Add to Cart" button is clicked, an API request
 * is made to add the product to the user's cart. If successful, an alert is shown.
 * If the product is unavailable, an error message is displayed using toast.
 *
 * @component
 */
const DescriptionBox = () => {
  const { cartItems, setCartItems } = useCart();
  console.log(cartItems);
  const { Authuser } = useAuthContext();
  const navigate = useNavigate(); // Using useNavigate hook for navigation
  const location = useLocation();
  const { product } = location.state || {};
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [count, setCount] = useState(1);

  // Increment handler
  const handleIncrementcount = () => {
    if (count < product.stock_quantity) {
      setCount(count + 1);
    }
  };
  // Decrement handler
  const handleDecrementcount = () => {
    if (count > 0) {
      setCount(count - 1);
    }
  };
  // Function to go to the previous image
  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? product.image_url.length - 1 : prevIndex - 1
    );
  };

  // Function to go to the next image
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === product.image_url.length - 1 ? 0 : prevIndex + 1
    );
  };
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
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const handleAddToCart = async (product) => {
    if (!Authuser) {
      try {
        // Get the current cart from local storage or initialize an empty array
        const localCart = JSON.parse(localStorage.getItem("LocalCart")) || [];
        // Check if the product is already in the cart
        const existingProductIndex = localCart.findIndex(
          (item) => item.cart.product === product._id
        );
        if (existingProductIndex !== -1) {
          const cartItem = localCart[existingProductIndex];
          const response = await axios.put(
            `http://localhost:5000/api/products/decrementProduct-guestDescBox/${product._id}`,
            { cartItem,count:cartItem.cart.count+count },
            { withCredentials: true }
          );
          if (response.data.message === 'Product stock updated') {
            toast.success('Added to cart');
            localCart[existingProductIndex].cart.count += count;
            ;navigate("/checkout")
          }
        } else {
          // Create a new cart item and send it to the API
          const newCartItem = {
            cart: { product: product._id, count: 0 },
          };
          const response = await axios.put(
            `http://localhost:5000/api/products/decrementProduct-guestDescBox/${product._id}`,
            { cartItem: newCartItem ,count:count },
            { withCredentials: true }
          );
          if (response.data.message === 'Product stock updated') {
            toast.success('Added to cart');
            newCartItem.cart.count = count;
            ;navigate("/checkout")
          }
          // If the response is successful, add the new item to local storage
          localCart.push(newCartItem);
        }

        // Save the updated cart back to local storage
        localStorage.setItem("LocalCart", JSON.stringify(localCart));
      } catch (error) {
        toast.error(error.response.data.error);
        console.error("Error decrementing product stock:", error);
      }
      return;
    }
    try {
      const response = await axios.put(`http://localhost:5000/api/Cart/AddToCartDescBox/${Authuser._id}/${product._id}`
        , {count:count},
      );
      if (response.data.message === 'Product added to cart successfully') {
        toast.success('Product added to cart successfully');
        ;navigate("/checkout")
        const { cartItem } = response.data;
        // Use the ProductId-to-Product mapping to get full product details
        const detailedProduct = productsMap[cartItem.cart.product];
        if (detailedProduct) {
          // Create a new cart item object
          const newCartItem = {
            cart: { ...cartItem.cart },
          };
        }
        fetchCartProductsOfUser(Authuser._id);
      }
    }
    catch (error) {
      toast.error(error.response.data.error)
      console.error('Error adding product to cart:', error);
    }
  };
  // Navigate back to shop
  const goBack = () => {
    navigate("/shop"); 
  };
  return (
    <div className="bg-black min-h-screen text-white p-8 font-poppins relative">
      <div className="max-w-6xl mx-auto flex flex-col space-y-8">
        {/* Back Button */}
        <button
          onClick={goBack}
          className="flex items-center space-x-2 text-white hover:text-gray-300 transition duration-300"
        >
          <FaArrowLeft className="text-xl" />
          <span className="text-lg font-medium">Back to Shop</span>
        </button>
  
        {/* Product Section */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          {/* Product Image Section */}
          <div className="relative w-full md:w-1/2">
  {product.image_url && product.image_url.length > 0 && (
    <>
      <img
        src={product.image_url[currentImageIndex]}
        alt={`${product.product_name} ${currentImageIndex + 1}`}
        className="w-full h-auto rounded-lg object-cover transition-transform duration-300 hover:scale-105"
      />
      {/* Navigation Buttons */}
      {product.image_url.length > 1 && (
        <div className="absolute inset-0 flex justify-between items-center px-4">
          {/* Left Button */}
          <button
            onClick={handlePrevImage}
            className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 flex items-center justify-center"
          >
            <ChevronLeftIcon style={{ fontSize: 24 }} />
          </button>
          {/* Right Button */}
          <button
            onClick={handleNextImage}
            className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 flex items-center justify-center"
          >
            <ChevronRightIcon style={{ fontSize: 24 }} />
          </button>
        </div>
      )}
    </>
  )}
</div>
          {/* Product Details Section */}
          <div className="w-full md:w-1/2 space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold">{product.product_name}</h3>
           <div className="flex gap-3">
          
            <div className="text-3xl md:text-4xl font-semibold">₹{product.price}</div>
            <div className="text-3xl md:text-xl line-through mt-2 text-gray-300 font-semibold">{product.MRP? "₹":""}{product.MRP? product.MRP : ""}</div>
            <div className="text-3xl md:text-4xl text-green-600 font-semibold">  {product.MRP? "-":""}
            {product.MRP ? Math.round(((product.MRP - product.price) / product.MRP) * 100) : ""}
            {product.MRP? "%":""}
              </div>
           </div>
            {/* Product Description */}
            <ul className="list-disc pl-5 text-white text-base leading-relaxed">
              {product.description.split('. ').map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <div className="flex items-center space-x-3 text-white text-lg font-semibold bg-black p-1 rounded-lg shadow-md">
  <FaShippingFast className="text-green-400 text-2xl" />
  <span>Estimated delivery : <span className="font-bold">5 days</span></span>
</div>
            {/* Add to Cart Section */}
            <div className="flex items-center space-x-4">
              {/* Quantity Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDecrementcount}
                  className="bg-white text-black px-4 py-2 rounded-lg disabled:opacity-50"
                  disabled={
                    count === 0
                  }
                >
                  -
                </button>
                <span className="text-lg bg-white font-semibold text-black px-4 py-2 rounded-lg">
                {count}
                </span>
                <button
                  onClick={handleIncrementcount}
                  className="bg-white text-black px-4 py-2 rounded-lg"
                  disabled={count >= product.stock_quantity} 
                >
                  +
                </button>
              </div>
              {/* Add to Cart Button */}
              <button
              disabled={count === 0}
                onClick={() => {handleAddToCart(product);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-gradient-to-r from-green-400 to-green-500 text-black flex items-center space-x-2 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-green-500/50"
              >
                <FaShoppingCart className="text-xl" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default DescriptionBox;
