import { useState, useEffect } from 'react';

const ExitConfirmation = () => {
  const [showModal, setShowModal] = useState(false);

  const handleBeforeUnload = (event) => {
    // Check your condition here
    if (conditionToCheck) {
      // Display a confirmation message
      // In modern browsers, custom messages are not shown; instead, a generic message is displayed.
      const message = "Are you sure you want to leave without saving your changes?";

      // Some browsers (like Chrome) do not show the custom message, but returnValue needs to be set to something
      event.returnValue = message; // For compatibility with some browsers
      return message; // Return message for others
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleLeavePage = () => {
    setShowModal(false);
    // Optionally, allow closing or refreshing
    window.close(); // This will close the tab (not recommended for user-initiated actions)
  };

  return (
    <>
      {showModal && (
        <div className="modal">
          <p>Are you sure you want to leave without saving your changes?</p>
          <button onClick={handleLeavePage}>Leave</button>
          <button onClick={handleCloseModal}>Cancel</button>
        </div>
      )}
    </>
  );
};

export default ExitConfirmation;
