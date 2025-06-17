import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import Link for routing
import {
  FaHome,
  FaShoppingCart,
  FaInfoCircle,
  FaEnvelope,
  FaBars,
  FaTimes,
  FaSignInAlt,
} from 'react-icons/fa';
import { IoMdPerson } from 'react-icons/io';
import { useAuthContext } from '../context/AuthContext';
import axios from 'axios';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { Authuser } = useAuthContext();
  const location = useLocation();
  const navigate =useNavigate();
  const hideLoginButton = location.pathname === '/login';
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAllResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://3.25.86.182:5000/api/Admin/AllResources');
      setResources(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllResources();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-black text-white p-4 sm:py-2 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <img
          style={{cursor:'pointer'}}
            onClick={() => navigate('/')}
            src={resources.find((item) => item.title === 'HOME_LOGO')?.resourceLink}
            alt="FITNEST"
            className="h-10 mr-3"
          />
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
          >
            {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
        </div>

        {/* Navigation Links for Desktop */}
        <ul className="hidden md:flex space-x-2 ml-auto items-center">
          {[
            { href: '/', label: 'Home', icon: <FaHome /> },
            { href: '/shop', label: 'Shop', icon: <FaShoppingCart /> },
            { href: '/aboutus', label: 'About Us', icon: <FaInfoCircle /> },
            { href: '/tariff', label: 'Membership', icon: <IoMdPerson /> },
            { href: '/footer', label: 'Contact Us', icon: <FaEnvelope /> },
          ].map((link, idx) => (
            <li key={idx} className="group relative">
              <a
                href={link.href}
                className="flex items-center text-white font-medium py-2 px-3 hover:text-green-500 transition duration-300"
              >
                <span className="hidden md:block">{link.icon}</span>
                <span className="ml-2">{link.label}</span>
              </a>
              <span className="absolute left-0 bottom-0 h-0.5 w-full bg-green-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </li>
          ))}
        </ul>

        {/* Register and Login Buttons */}
        <div className="hidden md:flex space-x-3 ml-auto">
          {!Authuser && !hideLoginButton && (
            <Link to="/login">
              <button className="flex items-center justify-center bg-green-600 text-white px-6 py-2 rounded-md hover:shadow-xl transition duration-300">
                <FaSignInAlt className="mr-2" />
                Login
              </button>
            </Link>
          )}
          {Authuser && <ProfileDropdown />}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <ul className="flex flex-col items-center space-y-2 mt-4">
            {[
              { href: '/', label: 'Home' },
              { href: '/shop', label: 'Shop' },
              { href: '/aboutus', label: 'About Us' },
              { href: '/tariff', label: 'Membership' },
              { href: '/footer', label: 'Contact Us' },
            ].map((link, idx) => (
              <li key={idx} className="group relative w-full text-center">
                <a
                  href={link.href}
                  className="block w-full text-white font-medium py-2 px-3 hover:text-green-500 transition duration-300"
                  onClick={handleMenuClose}
                >
                  {link.label}
                </a>
                <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 h-0.5 w-3/4 bg-green-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </li>
            ))}
            {/* Mobile Buttons for Login */}
            <div className="flex flex-col items-center space-y-3 mt-4">
              {!Authuser && !hideLoginButton && (
                <Link to="/login" onClick={handleMenuClose}>
                  <button className="flex items-center justify-center bg-green-600 text-white px-6 py-2 rounded-md hover:shadow-xl transition duration-300">
                    <FaSignInAlt className="mr-2" />
                    Login
                  </button>
                </Link>
              )}
              {Authuser && <ProfileDropdown />}
            </div>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
