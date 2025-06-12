import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
/**
 * useLogin hook
 * 
 * The useLogin hook returns an object with two properties: loading and login.
 * The loading property is a boolean that is set to true when the login
 * request is in progress and false when it is complete.
 * The login property is a function that takes an email and a password as
 * arguments and logs the user in to the application. The login function
 * will return false if the email or password is invalid. If the login is
 * successful, it will store the user data in local storage and update the
 * authentication context.
 * 
 * @returns {{loading: boolean, login: (email: string, password: string) => void}}
 */
const useLogin = () => {
  const [loading, setLoading] = useState(false); // loading state
  const { setAuthuser } = useAuthContext(); // authentication context
  const navigate=useNavigate();
  /**
   * Logs the user in to the application.
   * 
   * The login function takes an email and a password as arguments and logs
   * the user in to the application. If the login is successful, it will store
   * the user data in local storage and update the authentication context.
   * If the login fails, it will display an error to the user.
   * 
   * @param {string} email The user's email address
   * @param {string} password The user's password
   */
  const login = async (email, password) => {
    const success = handleInputErrors(email, password);
    if (!success) return;
  
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }) // Sending email and password
        ,credentials: "include",
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      // Store user data and set authentication context
      localStorage.setItem('gym-user', JSON.stringify(data));
      setAuthuser(data);
      if(data.isAdmin){
      navigate('/');
      }
      else{
        navigate('/profile-page');
      }
      toast.success("Login successful!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  const loginAsAdmin = async (email, password) => {
    const success = handleInputErrors(email, password);
    if (!success) return;
  
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login-admin', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }) ,// Sending email and password,
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        throw new Error(data.error);
      }
      // Store user data and set authentication context
      localStorage.setItem('gym-user', JSON.stringify(data));
      setAuthuser(data);
      navigate('/');
      toast.success("Login successful!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, login ,loginAsAdmin};
};

export default useLogin;

/**
 * Validates the input fields for login.
 *
 * This function checks if the email and password fields are filled.
 * It also validates the email format using a regular expression.
 * If any validation fails, an error message is displayed and the function
 * returns false. If all validations pass, the function returns true.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {boolean} - Returns true if all validations pass, otherwise false.
 */
function handleInputErrors(email, password) {
  if (!email || !password) {
    toast.error("Please fill in all fields");
    return false;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    toast.error("Please enter a valid email address");
    return false;
  }

  return true;
}
