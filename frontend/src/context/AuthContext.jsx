import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();
export const useAuthContext = () => {
    return useContext(AuthContext);
}
/**
 * The AuthContextProvider component is a context provider that wraps the
 * application. It is responsible for providing the AuthUser and
 * OrderingProduct state to the application, as well as the functions to
 * update them. The AuthContextProvider is used by the useAuthContext hook.
 * 
 * The AuthContextProvider accepts a single prop, 'children', which should be
 * the JSX elements that make up the application.
 * 
 * The AuthContextProvider uses the useState hook to initialize the AuthUser
 * and OrderingProduct state to null. If the user is logged in, the AuthUser
 * state is set to the user object from local storage. The
 * OrderingProduct is used to keep track of the product that the user is
 * currently ordering.
 * 
 * The AuthContextProvider wraps the application in a Context.Provider
 * component, which makes the AuthUser and OrderingProduct state available
 * to all components in the application. The Provider also passes down the
 * functions to update the state to any component that requests them.
 * 
 * @param {Object} props The props object should contain a single property
 * called 'children', which should be the JSX elements that make up the
 * application.
 * @returns {Object} The AuthContextProvider returns a Context.Provider
 * component that wraps the application.
 */

export const AuthContextProvider = ({ children }) => {
    const [Authuser, setAuthuser] = useState(JSON.parse(localStorage.getItem("gym-user")) || null);
    const [OrderingProduct, setOrderingProduct] = useState(null);
    const [productsMap, setProductsMap] = useState(localStorage.getItem('gym-products-map') ? JSON.parse(localStorage.getItem('gym-products-map')) : {});
    const [resources, setResources] = useState(localStorage.getItem('gym-resources') ? JSON.parse(localStorage.getItem('gym-resources')) : []);
    return <AuthContext.Provider value={{
        Authuser, setAuthuser, OrderingProduct, setOrderingProduct,
        productsMap, setProductsMap, resources, setResources
    }}>
        {children}
    </AuthContext.Provider>
}


