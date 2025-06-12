import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import axios from "axios";
/**
 * useSignup hook
 * 
 * The useSignup hook returns an object with two properties: loading and signup.
 * The loading property is a boolean that is set to true when the signup
 * request is in progress and false when it is complete.
 * The signup property is a function that takes an object with the following
 * properties: firstName, lastName, mobileNumber, email and password. The
 * signup function will return false if the input is invalid. If the signup
 * is successful, it will store the user data in local storage and update the
 * authentication context.
 * 
 * @returns {{loading: boolean, signup: (data: {firstName: string, lastName: string, mobileNumber: string, email: string, password: string}) => void}}
 */
const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthuser } = useAuthContext();

  const signup = async ({ firstName, lastName, mobileNumber, email, password }) => {
    const success = handleInputErrors({ firstName, lastName, mobileNumber, email, password });
    if (!success) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, mobileNumber, email, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Save user data and update auth context
      localStorage.setItem('gym-user', JSON.stringify(data));
      setAuthuser(data);
      toast.success("Registration successful!");
    } catch (error) {
      toast.error(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };
  /**
   * The signupAfterPayment property is a function that takes an object with the following
   * properties: firstName, lastName, mobileNumber, email, password and type. The
   * signupAfterPayment function will return false if the input is invalid. If the
   * signup is successful, it will store the user data in local storage and update the
   * authentication context.
   *
   * @param {{firstName: string, lastName: string, mobileNumber: string, email: string, password: string, type: string}} data
   * @returns {Promise<void>}
   */
const signupAfterPayment = async ({ firstName, lastName, mobileNumber, email, password , confirmPassword,address,type}) => {
  const success = handleInputErrors({ firstName, lastName, mobileNumber, email, password });
  if (!success) return;

  setLoading(true);
  try {
  const response=await axios.post(`http://localhost:5000/api/auth/signup-after-pay-for-new-membership`,{
    firstName, lastName, mobileNumber, email, password,type,address
  });
  if(response.data.message==='SUCCESS'){
    toast.success("Registration successful!");  
    localStorage.setItem('AuthuserId', JSON.stringify(response.data.AuthuserId));
    setLoading(false);
  }
  } catch (error) {
    // setLoading(false);
    console.log(error)
    toast.error(error.response.data.error);
  }
 
}
  return { loading, signup,signupAfterPayment };
};

export default useSignup;

/**
 * Validates the input fields for signup.
 *
 * This function checks if all the fields are filled.
 * It also validates the mobile number and email format using regular expressions.
 * If any validation fails, an error message is displayed and the function
 * returns false. If all validations pass, the function returns true.
 *
 * @param {{firstName: string, lastName: string, mobileNumber: string, email: string, password: string}} data
 * @returns {boolean} - Returns true if all validations pass, otherwise false
 */
function handleInputErrors({ firstName, lastName, mobileNumber, email, password }) {
  if (!firstName || !lastName || !mobileNumber || !email || !password) {
    toast.error("Please fill in all fields");
    return false;
  }

  // Validate mobile number format
  if (!/^\d{10}$/.test(mobileNumber)) {
    toast.error("Mobile number must be 10 digits");
    return false;
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    toast.error("Invalid email address");
    return false;
  }

  // Validate password and confirm password

  if (password.length < 6) {
    toast.error("Password must be at least 6 characters");
    return false;
  }

  return true;
}
