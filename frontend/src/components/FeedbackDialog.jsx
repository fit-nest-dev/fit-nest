import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";


/**
 * A dialog component for submitting user feedback.
 *
 * @param {string} userId The ID of the user providing the feedback.
 *
 * @returns {JSX.Element} The rendered dialog component.
 */
const FeedbackDialog = ({ userId }) => {
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Submits the user feedback to the server.
   *
   * If the user has not entered a feedback message, it alerts the user to enter one.
   * Otherwise, it sends a POST request to the server to submit the user's feedback.
   * If the server responds with a 200 status code, it alerts the user with a success message and clears the feedback message input.
   * If the server responds with an error, it logs the error and alerts the user with an error message.
   * Finally, it sets the isSubmitting state to false to stop the loading indicator.
   */
  const handleSubmitFeedback = async () => {
    if (!feedbackMessage) {
      toast.error("Please enter a feedback message!");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post("http://3.25.86.182:5000/api/users/submit-feedback", {
        userId,
        message: feedbackMessage,
      }, { withCredentials: true });

      if (response.status === 200) {
        toast.success("Feedback submitted successfully!");
        setFeedbackMessage(""); 
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Error submitting feedback. Please try again.");
    }

    setIsSubmitting(false);
  };

  const isSmallScreen = window.innerWidth <= 768;

  const styles = {
    dialog: {
      backgroundColor: "#000000",
      padding: isSmallScreen ? "10px" : "20px", // Adjust padding for smaller screens
      maxWidth: isSmallScreen ? "90%" : "600px", // Adjust width for smaller screens
      borderRadius: "8px",
      color: "",
      boxShadow: "0px 4px 8px rgba(3, 63, 3, 0.81)",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "20px",
      textAlign: "center",
      color: "#4ade80",
    },
    textarea: {
      width: "100%",
      padding: "12px",
      fontSize: "16px",
      border: "2px solid #1e8e2bd4",
      borderRadius: "6px",
      backgroundColor: "#000000",
      color: "#fff",
      resize: "vertical",
      outline: "none",
    },
    buttons: {
      textAlign: "center",
      marginTop: "20px",
    },
    submitButton: {
      backgroundColor: "#1e8e2bd4",
      color: "white",
      padding: "12px 24px",
      fontSize: isSmallScreen? "13px" : "16px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "background-color 0.3s",
      width: "40%",
    },
    submitButtonDisabled: {
      backgroundColor: "#1e8e2bd4",
      cursor: "not-allowed",
    },
    submittingButton: {
      backgroundColor: "#1e8e2bd4",
    },
  };


  return (
    <div style={styles.dialog}>
    <h2 style={styles.title}>We Value Your Feedback</h2>
    <textarea
      style={styles.textarea}
      placeholder="Write your feedback here..."
      value={feedbackMessage}
      onChange={(e) => setFeedbackMessage(e.target.value)}
      rows="6"
      cols="50"
    />
    <div style={styles.buttons}>
      <button
        style={{
          ...styles.submitButton,
          ...(isSubmitting ? styles.submittingButton : {}),
        }}
        onClick={handleSubmitFeedback}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </button>
    </div>
  </div>
  );
};


export default FeedbackDialog;
