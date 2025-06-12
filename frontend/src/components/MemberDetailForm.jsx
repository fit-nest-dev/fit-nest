import React, { useState } from "react";

/**
 * A form component for entering member details.
 *
 * This component renders a modal dialog that allows users to input
 * and submit their personal details such as age, gender, height,
 * weight, and fitness goal. The form data is managed using React's
 * useState hook. Upon submission, the entered data is sent via the
 * onSubmit callback, and the modal is closed using the onClose callback.
 *
 * @param {boolean} isOpen - Controls whether the form modal is visible.
 * @param {function} onClose - Function to call to close the modal.
 * @param {function} onSubmit - Function to call with the form data upon submission.
 * @returns {JSX.Element|null} The rendered form component or null if not open.
 */
const MemberDetailForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    fitnessGoal: "",
  });

  /**
   * Handles the change event of the form fields and updates the formData state
   * accordingly.
   *
   * When a form field changes, this function is called with the event object as an
   * argument. It extracts the name and value of the changed input from the event
   * object, and updates the corresponding property in the formData state using
   * React's useState hook.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input element.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Submits the form data to the parent component and closes the modal.
   *
   * This function is called when the form is submitted. It calls the onSubmit
   * callback with the current formData state, and then calls the onClose callback
   * to close the modal.
   */
  const handleSubmit = () => {
    onSubmit(formData);

    onClose(); // Close the modal after submitting
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-black border-2 border-green-500 rounded-lg p-6 w-11/12 max-w-md shadow-xl relative">
        <button
          className="absolute top-4 right-4 text-white text-2xl font-bold focus:outline-none"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-white text-xl font-bold mb-4 text-center">
          Enter Your Details
        </h2>
        <form>
          <div className="mb-4">
            <label className="block text-white mb-1">Age:</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-2 bg-black text-white border border-green-500 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-1">Gender:</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 bg-black text-white border border-green-500 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-white mb-1">Height (cm):</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="w-full p-2 bg-black text-white border border-green-500 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-1">Weight (kg):</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full p-2 bg-black text-white border border-green-500 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-white mb-1">Fitness Goal:</label>
            <select
              name="fitnessGoal"
              value={formData.fitnessGoal}
              onChange={handleChange}
              className="w-full p-2 bg-black text-white border border-green-500 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </form>
        <div className="flex justify-center">
          <button
            className="bg-black text-white border border-green-500 rounded px-6 py-2 font-semibold hover:bg-green-500 hover:text-black transition-all"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailForm;
