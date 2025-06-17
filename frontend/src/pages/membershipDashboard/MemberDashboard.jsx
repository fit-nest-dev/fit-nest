import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import axios from "axios";
import "./MemberDashboard.css";
import MemberDetailForm from "../../components/MemberDetailForm";
import useLogout from "../../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import FeedbackDialog from "../../components/FeedbackDialog";
import RateTrainerDialog from "../../components/TrainerComponents/RateTrainerDialog";
import TrainersAssignedToUsers from "../../components/TrainerComponents/TrainersAssignedToUsers";
import toast from "react-hot-toast";
import { FaBars, FaTimes } from "react-icons/fa";
import default_pic from '../../assets/DEFAULT3.jpeg'
import { Box, Typography } from "@mui/material";
const MemberDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const { Authuser} = useAuthContext();
  const [loading, setLoading]=useState(false);
  const [activeSection, setActiveSection] = useState("Personal Information");
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  const [editableInfo, setEditableInfo] = useState({
    first_name: Authuser?.first_name || "",
    last_name: Authuser?.last_name || "",
    mobile_number: Authuser?.mobile_number || "",
    email: Authuser?.email || "",
    Address: Authuser?.Address || "",
  });
  const handleInputErrors=({first_name, last_name, mobile_number, email})=>{
    if(!first_name || !last_name || !mobile_number || !email){
      toast.error("Please fill in all fields");
      return false;
    }
    if(mobile_number.length!==10){
      toast.error("Please enter a valid mobile number");
      return false;
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleLogout = async () => {
    logout(); 
    navigate("/"); 
  };
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const FetchUserById= async()=>{
    if(Authuser){ 
    try{
      setLoading(true)
      const response = await axios.get(`http://3.25.86.182:5000/api/users/GetUserById/${Authuser._id}`, { withCredentials: true })
      localStorage.setItem('gym-user', JSON.stringify(response.data));
    }
    catch(err){
      console.log(err)
    }
    finally{
      setLoading(false);
    }
  }
  }
  useEffect(()=>{
    FetchUserById();
  },[])
  const handleFormSubmit = async (formData) => {
    const bmi = (formData.weight * 10000) / (formData.height * formData.height);

    // You can send this data to the backend or process it further
    try {
      const res = await axios.post(
        `http://3.25.86.182:5000/api/users/workoutDietPdfReguest/${Authuser._id}`,
        {
          age: formData?.age,
          height: formData?.height,
          weight: formData?.weight,
          bmi,
          email: Authuser?.email,
          gender: formData?.gender,
          fitnessGoal: formData?.fitnessGoal,
        },{
          withCredentials: true,}
      );
      const data = await res.data;
      if (data.error) {
        toast.error(data.error);
      }
      toast.success("Request Submitted");
    } catch (err) {
      console.log(err, "Hello");
      alert(err?.response?.data?.error);
    }
  };
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setEditableInfo({ ...editableInfo, [name]: value });
  };

  const handleInfoSubmit = async () => {
    try {
      const requestPayload = {
        userId: Authuser._id,
        requestedChanges: editableInfo,
      };
     if(!handleInputErrors(editableInfo)){
      return;
     }
      const response = await axios.post(
        `http://3.25.86.182:5000/api/users/requestToChangeInfo`,
        requestPayload, { withCredentials: true }
              );
              if(response.status===200){
      toast.success(
        "Your request has been submitted and is pending admin approval."
      ,
      {
        duration: 5000,
        position: "top-center",
      });
      
      setEditableInfo({
        first_name: Authuser?.first_name,
        last_name: Authuser?.last_name,
        mobile_number: Authuser?.mobile_number,
        email: Authuser?.email,
        Address: Authuser?.Address,
      });
    }
    } catch (error) {
      toast.error(error.response.data.error);
      console.error("Error submitting update request:", error);
    }
  };
  if (!Authuser) return <div>Please log in to view your dashboard.</div>;
  if(loading) return <div>Loading...</div>
  return (
    <div className="dashboard w-full">
      {/* Sidebar */}
       {/* Hamburger Icon */}
       {!isSidebarOpen && (
        <div className="hamburger-icon" onClick={toggleSidebar}>
          <FaBars />
        </div>
      )}
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        {/* Close Button */}
        {isSidebarOpen && (
          <div className="close-btn" onClick={toggleSidebar}>
            <FaTimes />
          </div>
        )}
        <h2>Hello, {Authuser?.first_name}</h2>
        <ul>
          <li onClick={() => {setActiveSection("Personal Information")
          toggleSidebar();
          }}>
            Personal Information
          </li>
          <li
            onClick={async () => {
              setActiveSection("Workout Plan");
              toggleSidebar();
            }}
          >
            Workout & Diet Plan
          </li>
          <li onClick={() =>
            { setActiveSection("Feedback")
              toggleSidebar();
            }}>Feedback</li>
          {!Authuser.isAdmin && (
            <>
              <li onClick={() => {setActiveSection("rateTrainers")
              toggleSidebar();
              }}>
                Rate Trainers
              </li>
              <li
                onClick={() => {
                  setActiveSection("PersonalTrainers");
                  toggleSidebar();
                }}
              >
                Personal Trainers
              </li>
            </>
          )}
          <li className="logout-btn" onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </div>
{/* Main Content */}
<div className="main-content px-4 sm:px-1 lg:px-16 sm:translate-x-[-30px]" >

  {activeSection === "Personal Information" && (
    <section
      className="text-black bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-md shadow-lg"
    >
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-green-400 mb-4 text-center hidden sm:block">
        Personal Information
      </h2>

      {/* Scrollable Container for Small Screens */}
      <div className="overflow-y-auto sm:overflow-visible max-h-[70vh] sm:max-h-none">
        {/* Profile Image Section */}
        <div className="profile-image-container flex flex-col items-center mb-6">
          <img
            src={
            default_pic 
            }
            alt="Profile"
            className="profile-image w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 border-2 border-white"
          />
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="input-group">
            <label className="text-gray-300 block mb-1">First Name:</label>
            <input
              type="text"
              name="first_name"
              value={editableInfo.first_name}
              onChange={handleInfoChange}
              className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-400"
            />
          </div>
          <div className="input-group">
            <label className="text-gray-300 block mb-1">Last Name:</label>
            <input
              type="text"
              name="last_name"
              value={editableInfo.last_name}
              onChange={handleInfoChange}
              className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-400"
            />
          </div>
          <div className="input-group">
            <label className="text-gray-300 block mb-1">Mobile:</label>
            <input
              type="text"
              name="mobile_number"
              value={editableInfo.mobile_number}
              onChange={handleInfoChange}
              className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-400"
            />
          </div>
          <div className="input-group">
            <label className="text-gray-300 block mb-1">Email:</label>
            <input
              type="text"
              name="email"
              value={editableInfo.email}
              onChange={handleInfoChange}
              className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-400"
            />
          </div>
          <div className="input-group">
            <label className="text-gray-300 block mb-1">Address:</label>
            <input
              type="text"
              name="Address"
              value={editableInfo.Address}
              onChange={handleInfoChange}
              className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-400"
            />
          </div>
          <div className="input-group">
            <label className="text-gray-300 block mb-1">Member ID:</label>
            {/* <input
              // type="text"
              name="Member ID"
              value={Authuser.membership_details.membership_id}
              className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-400"
            /> */}
            <div className="text-white">
            {Authuser.membership_details.membership_id}
            </div>
          </div>
          
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={handleInfoSubmit}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-800 transition duration-300"
          >
            Update Information
          </button>
          <button
            onClick={() => navigate("/changepassword")}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
          >
            Change Password
          </button>
        </div>
      </div>
    </section>
  )}


{/* Workout Plan Section */}
{activeSection === "Workout Plan" && (
  <section className="max-h-[530px] overflow-y-hidden">
    {Authuser?.membership_details?.status === "Expired" ? (
      <div className="overlay">
        <img
          src="/src/assets/member.png"
          alt=""
          className="overlay-image left-focused"
        />
        <button onClick={() => (window.location.href = "/members")}>
          Upgrade your membership
        </button>
      </div>
    ) : (
      <div className="dashboard">
        {/* Other content */}
        <div className="overlay">
          <img
            src="/src/assets/member.png"
            alt=""
            className="overlay-image left-focused"
          />
          <button onClick={handleOpenModal}>
            Get your workout & diet plan
          </button>
        </div>

        {/* Modal */}
        <MemberDetailForm
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleFormSubmit}
        />
      </div>
    )}
  </section>
)}


{activeSection === "Feedback" && (
          <section>
           <FeedbackDialog userId={Authuser._id} />
          </section>
        )}
         {activeSection === "rateTrainers" &&  (
         <section><RateTrainerDialog  /> </section> )}
          {activeSection === "PersonalTrainers" &&  (
         <TrainersAssignedToUsers  userId={Authuser._id}/> )}
      </div>
    </div>
  );
};

export default MemberDashboard;
