import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast'; // Optional: for showing toast notifications
import { useAuthContext } from '../context/AuthContext';

/**
 * Component for changing user password either by verifying the old password
 * or through an OTP (One-Time Password) sent to the user's email.
 * 
 * This component provides two methods for changing the password:
 * 1. Using the old password for verification.
 * 2. Using an OTP sent to the user's email for verification.
 * 
 * The user can toggle between these two methods using a button. The component
 * manages the state for the current password, new password, OTP, and email,
 * as well as a loading state for indicating ongoing operations.
 * 
 * The component uses the `useAuthContext` hook to get the authenticated user
 * and the `react-hot-toast` library to show notifications for success or error
 * messages.
 * 
 * @returns {JSX.Element} The rendered component for changing the password.
 */

const ChangePassword = () => {
  const [usingOldPassword, setUsingOldPassword] = useState(true); // Switch between old password and OTP methods
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { Authuser } = useAuthContext()

  // Switch between old password and OTP methods
  const toggleMethod = () => setUsingOldPassword(!usingOldPassword);

  // Function to handle password change using the old password
  const handleChangePasswordWithOldPassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error('Please provide both old and new passwords.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`http://3.25.86.182:5000/api/auth/changepasswordbyoldpassword/${Authuser._id}`, {
        currentPassword,
        newPassword,
      }, { withCredentials: true });

      if (response.data.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        toast.error('Failed to change password.');
      }
    } catch (error) {
      toast.error('Error changing password.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle password change via OTP
  const handleChangePasswordWithOtp = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword) {
      toast.error('Please provide OTP and new password.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`http://3.25.86.182:5000/api/auth/changepasswordbyotp/${Authuser._id}`, {
        email,
        otp,
        newPassword,
      }, { withCredentials: true });

      if (response.data.success) {
        toast.success('Password changed successfully!');
        setOtp('');
        setNewPassword('');
        setEmail('');
      } else {
        toast.error('Invalid OTP or failed to change password.');
      }
    } catch (error) {
      toast.error(`Error changing password. ${error}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Function to request OTP
  const requestOtp = async () => {
    if (!email) {
      toast.error('Please enter your email to receive OTP.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`http://3.25.86.182:5000/api/auth/send-otp`, { email }, { withCredentials: true });
      if (response.status === 200) {
        toast.success('OTP sent to your email!');
      } else {
        toast.error('Failed to send OTP.');
      }
    } catch (error) {
      toast.error('Error sending OTP.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-800 text-white rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Change Password</h2>

      {/* Option to toggle between old password and OTP */}
      <div className="mb-4">
        <button
          className={`px-4 py-2 rounded ${usingOldPassword ? 'bg-green-600' : 'bg-gray-600'}`}
          onClick={toggleMethod}
        >
          {usingOldPassword ? 'Change via OTP' : 'Change via Old Password'}
        </button>
      </div>

      {/* Form for changing password with old password */}
      {usingOldPassword ? (
        <form onSubmit={handleChangePasswordWithOldPassword}>
          <div className="mb-4">
            <label className="block mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded"
              placeholder="Enter current password"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded"
              placeholder="Enter new password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-600 rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      ) : (
        // Form for changing password with OTP
        <form onSubmit={handleChangePasswordWithOtp}>
          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded"
              placeholder="Enter your email"
            />
            <button
              type="button"
              onClick={requestOtp}
              className="w-full py-3 bg-blue-600 rounded mt-2 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Request OTP'}
            </button>
          </div>

          <div className="mb-4">
            <label className="block mb-2">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded"
              placeholder="Enter OTP sent to your email"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded"
              placeholder="Enter new password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-600 rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ChangePassword;
