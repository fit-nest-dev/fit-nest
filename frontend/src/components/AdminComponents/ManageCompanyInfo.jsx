import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageCompanyInfo = () => {
  const [companyInfo, setCompanyInfo] = useState({
    companyAddress: "",
    companyEmail: "",
    companyMobile: "",
    twitterLink: "",
    instagramLink: "",
    linkedinLink: "",
    facebookLink: "",
  });

  // Fetch company info on component load
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/Admin/get-footer-info`, { withCredentials: true });
        setCompanyInfo(response.data[0]);
      } catch (err) {
        console.error("Error fetching company info:", err);
      }
    };

    fetchCompanyInfo();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo({ ...companyInfo, [name]: value });
  };

  // Save company info
  const handleSaveChanges = async () => {
    try {
      const response = await axios.put("http://localhost:5000/api/Admin/update-footer-info", companyInfo, { withCredentials: true });
      alert(response.data.message || "Company info updated successfully!");
    } catch (err) {
      console.error("Error saving company info:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-black text-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-semibold mb-6">Manage Company Info (FOR FOOTER DISPLAY)</h2>

      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Company Address</label>
        <input
          type="text"
          name="companyAddress"
          value={companyInfo.companyAddress}
          onChange={handleInputChange}
          className=" w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter company address"
        />
      </div>

      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Company Email</label>
        <input
          type="email"
          name="companyEmail"
          value={companyInfo.companyEmail}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter company email"
        />
      </div>

      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Company Mobile</label>
        <input
          type="text"
          name="companyMobile"
          value={companyInfo.companyMobile}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter company mobile number"
        />
      </div>

      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Twitter Profile Link</label>
        <input
          type="url"
          name="twitterLink"
          value={companyInfo.twitterLink}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter Twitter profile link"
        />
      </div>

      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Instagram Profile Link</label>
        <input
          type="url"
          name="instagramLink"
          value={companyInfo.instagramLink}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter Instagram profile link"
        />
      </div>

      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">LinkedIn Profile Link</label>
        <input
          type="url"
          name="linkedinLink"
          value={companyInfo.linkedinLink}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter LinkedIn profile link"
        />
      </div>

      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Facebook Profile Link</label>
        <input
          type="url"
          name="facebookLink"
          value={companyInfo.facebookLink}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter Facebook profile link"
        />
      </div>

      <button
        onClick={handleSaveChanges}
        className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Save Changes
      </button>
    </div>

  );
};

export default ManageCompanyInfo;
