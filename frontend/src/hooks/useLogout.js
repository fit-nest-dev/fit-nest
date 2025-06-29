import { useState } from "react"
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
/**
 * useLogout hook
 * 
 * The useLogout hook provides functionality to log the user out of the application.
 * It returns an object with two properties: loading and logout.
 * The loading property is a boolean that indicates whether the logout request is in progress.
 * The logout property is a function that logs the user out by making a POST request
 * to the '/api/auth/logout' endpoint, removes user data from local storage, and updates the 
 * authentication context. If the logout is successful, it clears the authentication context.
 * If an error occurs during the process, an error message is displayed to the user.
 * 
 * @returns {{loading: boolean, logout: () => void}}
 */
const useLogout = () => {
    const [loading, setloading] = useState(false);
    const {  setAuthuser } = useAuthContext();
    const navigate = useNavigate();
    const logout = async () => {
        setloading(true)
        try {
            const res = await fetch('http://3.25.86.182:5000/api/auth/logout', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const data = await res.json();
            if (data.error) {
                throw new Error(data.error);
            }
            toast.success("Logout successful!",{duration:3000});
            localStorage.removeItem('gym-user');
            setAuthuser(null);
            navigate('/login');
        } catch (error) {
            toast.error(error.message);
        }
        finally {
            setloading(false)
        }
    }
    return { loading, logout };
}
export default useLogout
