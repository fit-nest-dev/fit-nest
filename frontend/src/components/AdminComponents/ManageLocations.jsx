import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Component to manage locations for the "ABOUT US" section.
 * 
 * Retrieves and displays a list of locations from the backend, allowing users to
 * add, edit, and remove location information including title, description, and image URL.
 * Users can save the updated list of locations back to the server.
 * 
 * @returns {JSX.Element} A JSX element that renders the manage locations interface with
 * options to add, edit, and remove locations.
 */

const ManageLocations = () => {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({
    title: '',
    description: '',
    image: '',
  });
  useEffect(() => {
    /**
     * Fetches the list of locations for the "ABOUT US" section from the server.
     *
     * Tries to fetch the list of locations from the server, and if successful, updates
     * the component state with the response data. If an error occurs, logs the error
     * to the console.
     *
     * @returns {Promise<void>}
     */
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://3.25.86.182:5000/api/Admin/about-us', { withCredentials: true }); // Update with your backend route
        setLocations(response.data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);
  /**
   * Updates the location at the given index with the new value for the given key.
   * @param {number} index - The index of the location to update.
   * @param {string} key - The key of the location property to update.
   * @param {any} value - The new value for the location property.
   */
  const handleLocationChange = (index, key, value) => {
    const updatedLocations = [...locations];
    updatedLocations[index][key] = value;
    setLocations(updatedLocations);
  };

  /**
   * Adds a new location to the list of locations by updating the component state.
   *
   * Checks if all required fields are filled in for the new location, and if so,
   * adds the new location to the list of locations and resets the new location
   * state to be empty. If any required fields are empty, shows an alert to the user.
   */
  const handleAddLocation = () => {
    if (!newLocation.title || !newLocation.description || !newLocation.image) {
      alert('All fields are required for a new Image.');
      return;
    }
    setLocations([...locations, { ...newLocation, id: Date.now() }]);
    setNewLocation({ title: '', description: '', image: '' });
  };

  /**
   * Removes the location at the given index from the list of locations by updating
   * the component state.
   * @param {number} index - The index of the location to remove.
   */
  const handleRemoveLocation = (index) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
  };

  /**
   * Saves the list of locations to the server.
   *
   * Tries to send a POST request with the list of locations to the server and if
   * successful, shows a success message to the user. If an error occurs, logs the
   * error to the console.
   *
   * @returns {Promise<void>}
   */
  const saveLocations = async () => {
    try {
      await axios.post('http://3.25.86.182:5000/api/Admin/save-locations', { locations }, { withCredentials: true });
      alert('Images updated successfully for about us!');
    } catch (error) {
      console.error('Error saving locations:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 ">Manage Photos in ABOUT US</h1>

      <div className=" space-y-4">
        {locations?.map((location, index) => (
          <div key={location.id} className="p-4 border rounded shadow">
            <div className="mb-2">
              <label className="block text-sm font-semibold">Name:</label>
              <input
                type="text"
                value={location?.title}
                onChange={(e) => handleLocationChange(index, 'title', e.target.value)}
                className="w-full p-2 border rounded text-black bg-white"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-semibold">Description :</label>
              <input
                type="text"
                value={location?.description}
                onChange={(e) => handleLocationChange(index, 'description', e.target.value)}
                className="w-full p-2 border rounded text-black bg-white"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-semibold">Image URL:</label>
              <input
                type="text"
                value={location?.image}
                onChange={(e) => handleLocationChange(index, 'image', e.target.value)}
                className="w-full p-2 border rounded text-black bg-white"
              />
            </div>
            <button
              onClick={() => handleRemoveLocation(index)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 mt-6 border rounded shadow">
        <h2 className="text-lg font-bold mb-2">Add New Image</h2>
        <div className="mb-2">
          <label className="block text-sm font-semibold">Title:</label>
          <input
            type="text"
            value={newLocation.title}
            onChange={(e) => setNewLocation({ ...newLocation, title: e.target.value })}
            className="w-full p-2 border rounded text-black bg-white"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-semibold">Description:</label>
          <input
            type="text"
            value={newLocation.description}
            onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
            className="w-full p-2 border rounded text-black bg-white"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-semibold">Image URL:</label>
          <input
            type="text"
            value={newLocation.image}
            onChange={(e) => setNewLocation({ ...newLocation, image: e.target.value })}
            className="w-full p-2 border rounded text-black bg-white "
          />
        </div>
        <button
          onClick={handleAddLocation}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add IMAGE
        </button>
      </div>

      <button
        onClick={saveLocations}
        className="mt-6 bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
      >
        Save Images for ABOUT US
      </button>
    </div>
  );
};

export default ManageLocations;
