import React, { createContext, useState, useContext, useEffect } from 'react';
const CartContext = createContext();
/**

 * The CartProvider component wraps the app in the CartContext.Provider,
 * exposing the cartItems state and the setCartItems function to the app.
 * The children component is passed as a prop to the CartProvider component.
 * 
 * @param {React.ReactElement} children - The children component to be rendered.
 * @returns {React.ReactElement} The CartProvider component.
 */
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  return (
    <CartContext.Provider value={{ cartItems, setCartItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
