import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * Component to manage home media including HOME_LOGO, HOME_PAGE_VIDEO, and custom media.
 * 
 * This component allows users to view, update, and add new media resources for the home page.
 * It includes input fields to update the home logo and home page video, along with functionality
 * to add new custom media items. The component fetches existing media data from the server on load
 * and provides options to save changes or add new media items.
 *
 * @component
 * @returns {JSX.Element} A JSX element that renders the manage home media interface.
 */
const ManageHomeMedia = () => {
  const [homeLogo, setHomeLogo] = useState(""); // For HOME_LOGO
  const [homePageVideo, setHomePageVideo] = useState(""); // For HOME_PAGE_VIDEO
  const [customMedia, setCustomMedia] = useState([]); // For custom images and videos
  const [newMedia, setNewMedia] = useState({
    title: "",
    resourceType: "Image",
    resourceLink: "",
  });

  // Fetch existing media on load
  useEffect(() => {
    /**
     * Fetches the home media (HOME_LOGO, HOME_PAGE_VIDEO, and custom media)
     * from the server and updates the state accordingly.
     *
     * @returns {Promise<void>}
     */
    const fetchMedia = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/Admin/home-media", {
          withCredentials: true,
        });
        const { homeLogo, homePageVideo, customMedia } = response.data;
        setHomeLogo(homeLogo || "");
        setHomePageVideo(homePageVideo || "");
        setCustomMedia(customMedia || []);
      } catch (err) {
        console.error("Error fetching media:", err);
        // alert("Failed to fetch media");
      }
    };

    fetchMedia();
  }, []);

  // Handle input change for HOME_LOGO and HOME_PAGE_VIDEO
  const handleMediaChange = (e) => {
    const { name, value } = e.target;
    if (name === "homeLogo") setHomeLogo(value);
    if (name === "homePageVideo") setHomePageVideo(value);
  };

  // Handle input change for new custom media
  const handleNewMediaChange = (e) => {
    const { name, value } = e.target;
    setNewMedia({ ...newMedia, [name]: value });
  };

  // Save changes for HOME_LOGO and HOME_PAGE_VIDEO
  const handleSaveHomeMedia = async () => {
    try {
      const response = await axios.put("http://localhost:5000/api/Admin/put-home-media", {
        homeLogo,
        homePageVideo,
      }, {
        withCredentials: true,
      });
      alert(response.data.message || "Home media updated successfully!");
    } catch (err) {
      console.error("Error saving home media:", err);
      // alert("Failed to save home media");
    }
  };

  // Add new custom media
  const handleAddCustomMedia = async () => {
    if (!newMedia.title || !newMedia.resourceLink) {
      alert("Please provide both title and resource link");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/Admin/custom-media", newMedia, {
        withCredentials: true,
      });
      setCustomMedia([...customMedia, newMedia]);
      setNewMedia({ title: "", resourceType: "Image", resourceLink: "" });
      alert(response.data.message || "Custom media added successfully!");
    } catch (err) {
      console.error("Error adding custom media:", err);
      alert("Failed to add custom media");
    }
  };

  // Delete custom media

  return (
    <div className="max-w-4xl mx-auto p-2 bg-black text-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-semibold mb-6">Manage Home Media</h2>

      {/* HOME_LOGO */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Home Page Logo</label>
        <input
          type="url"
          name="homeLogo"
          value={homeLogo}
          onChange={handleMediaChange}
          className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter logo link"
        />
      </div>

      {/* HOME_PAGE_VIDEO */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Home Page Image</label>
        <input
          type="url"
          name="homePageVideo"
          value={homePageVideo}
          onChange={handleMediaChange}
          className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter Home Page Image link"
        />
      </div>

      <button
        onClick={handleSaveHomeMedia}
        className="px-8 py-3 mb-6 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Save Home Media
      </button>
    </div>
  );
};

export default ManageHomeMedia;
