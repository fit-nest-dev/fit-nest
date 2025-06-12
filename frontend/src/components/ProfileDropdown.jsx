import React, { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import useLogout from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import default_pic from '../assets/DEFAULT3.jpeg';
// import default-profile 
/**
 * A dropdown component that displays a profile picture and a dropdown menu when clicked.
 *
 * The dropdown menu contains the user's name, email, and contact number.
 *
 * The component also contains a logout button that logs the user out when clicked.
 *
 * @returns {JSX.Element} The rendered component.
 */
const ProfileDropdown = () => {
  const { Authuser } = useAuthContext();
  const { logout } = useLogout();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const toggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <div className="relative">
      {/* Profile Picture Icon */}
      <button
        onClick={() => { navigate('/profile-page') }}
        className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center hover:shadow-md transition duration-300"
      >
        <img
          src={default_pic || "https://via.placeholder.com/150"}
          alt="Profile"
          className="w-full h-full rounded-full object-cover"
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-[300px] bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <h2 className="text-sm text-gray-600 font-bold">Name: {Authuser?.first_name} {Authuser?.last_name}</h2>
            <p className="text-sm text-gray-600 font-bold">Email: {Authuser?.email}</p>
            <p className="text-sm text-gray-600 font-bold">Contact: {Authuser?.mobile_number || "N/A"}</p>
          </div>
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full text-white bg-red-600 py-2 rounded-md hover:bg-red-700 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
