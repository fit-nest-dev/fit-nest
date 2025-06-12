import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Typography } from "@mui/material";
import { useAuthContext } from "../../context/AuthContext";
import DefaultImage from "../../assets/default.png"; // Import the default image

/**
 * RateTrainerDialog is a React component that allows users to rate trainers.
 * It fetches a list of trainers from an API and displays them in a dropdown menu.
 * Users can select a trainer and provide a rating from 1 to 5 stars.
 * The component also displays the highest-rated trainer alongside their average rating and profile picture.
 * Upon submission, the rating is sent to the server and a status message is displayed.
 * If no trainers are available, a message indicating the absence of ratings is shown.
 */

const RateTrainerDialog = () => {
  const [trainers, setTrainers] = useState([]);
  const [rating, setRating] = useState(5);
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [statusMessage, setStatusMessage] = useState(""); // Feedback message state
  const { Authuser } = useAuthContext();

 
    const styles = {
      container: {
        backgroundColor: "rgb(0, 0, 0)",
        maxWidth: "100%",
        margin: "20px auto",
        borderRadius: "5px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
        boxShadow: "0 0 15px 2px rgb(4, 62, 4)",
        flexWrap: "wrap", // Allow wrapping for smaller screens
      },
      leftSection: {
        flex: 1,
        padding: "20px",
        backgroundColor: "#000000",
      },
      rightSection: {
        flex: 1,
        padding: "20px",
        backgroundColor: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      },
      dialogTitle: {
        backgroundColor: "rgb(17, 21, 17)",
        color: "#fff",
        padding: "10px",
        textAlign: "center",
        borderRadius: "5px 5px 0 0",
      },
      dialogTitleHeading: {
        color: "#2ecc71",
        fontSize: "1.5rem", // Relative size
      },
      select: {
        width: "100%",
        padding: "6px",
        marginBottom: "15px",
        borderRadius: "5px",
        border: "1px solid #fff",
        backgroundColor: "rgb(25, 25, 25)",
        color: "#fff",
      },
      inputLabel: {
        color: "#fff",
        display: "block",
        marginBottom: "5px",
      },
      buttonsContainer: {
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap", // Adjust buttons for small screens
        gap: "10px",
        marginTop: "20px",
      },
      cancelButton: {
        backgroundColor: "rgb(69, 66, 66)",
        color: "#fff",
        padding: "8px 16px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        flex: "1",
      },
      submitButton: {
        backgroundColor: "green",
        color: "#fff",
        padding: "8px 16px",
        border: "none",
        borderRadius: "5px",
        flex: "1",
        cursor: "pointer",
      },
      trainerImage: {
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        objectFit: "cover",
        marginBottom: "10px",
      },
      whiteText: {
        color: "#fff",
        fontSize: "1rem", // Adjusted for readability
      },
      "@media (max-width: 768px)": {
        container: {
          flexDirection: "column",
        },
        leftSection: {
          padding: "15px",
        },
        rightSection: {
          padding: "15px",
        },
        dialogTitleHeading: {
          fontSize: "1.2rem",
        },
        select: {
          padding: "5px",
        },
        cancelButton: {
          padding: "6px 12px",
        },
        submitButton: {
          padding: "6px 12px",
        },
        trainerImage: {
          width: "60px",
          height: "60px",
        },
        whiteText: {
          fontSize: "0.9rem",
        },
      },
    };
    
 

  useEffect(() => {
/**
 * Fetches all trainers from the backend API and stores them in the component state.
 * 
 * This function is called when the component mounts and whenever the user clicks on the "Get Trainers" button.
 * 
 * @function fetchTrainers
 * @memberof RateTrainerDialog
 * @instance
 * @async
 */
    const fetchTrainers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/Trainer/AllTrainers", { withCredentials: true });
        setTrainers(response.data);
      } catch (error) {
        toast.error("Unable to fetch trainer information.");
      }
    };

    fetchTrainers();
  }, []);

/**
 * Handles the submission of the rating form. If the user hasn't selected a trainer or
 * provided a rating, it will set the status message to an error message and return.
 * Otherwise, it will call the backend API to submit the rating. If the API call is
 * successful, it will set the status message to a success message and clear the
 * selected trainer and rating. If the API call fails, it will set the status message
 * to an error message.
 * @function handleSubmit
 * @memberof RateTrainerDialog
 * @instance
 * @async
 */
  const handleSubmit = async () => {
    try {
      if (!selectedTrainer || !rating) {
        setStatusMessage("Please select a trainer and provide a rating.");
        return;
      }

      await axios.put(
        `http://localhost:5000/api/Trainer/rate/${selectedTrainer}/${Authuser._id}`,
        { rating },
        { withCredentials: true }
      );
      
      setStatusMessage("Rating submitted successfully!");
      setSelectedTrainer("");
      setRating(5);
    } catch (err) {
      setStatusMessage("Failed to submit the rating.");
    }
  };
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(""); 
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const highestRatedTrainer = trainers.length
    ? trainers
        .map((trainer) => ({
          name: trainer.trainer_name,
          avgRating:
            trainer.ratings.length > 0
              ? trainer.ratings.reduce((sum, { rating }) => sum + rating, 0) / trainer.ratings.length
              : 0,
          profilePicture: trainer.profile_picture || DefaultImage,
        }))
        .reduce((top, current) =>
          current.avgRating > top.avgRating ? current : top
        )
    : null;

  return (
    <div style={styles.container}>
      {/* Left Section */}
      <div style={styles.leftSection}>
        <label style={styles.inputLabel}>Select Trainer:</label>
        <select
          style={styles.select}
          value={selectedTrainer}
          onChange={(e) => setSelectedTrainer(e.target.value)}
        >
          <option value="">Select a trainer</option>
          {trainers.map((trainer) => (
            <option key={trainer._id} value={trainer._id}>
              {trainer.trainer_name}
            </option>
          ))}
        </select>

        <label style={styles.inputLabel}>Rating:</label>
        <select
          style={styles.select}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value} Star{value > 1 ? "s" : ""}
            </option>
          ))}
        </select>

        <div style={styles.buttonsContainer}>
          <button
            style={styles.cancelButton}
            onClick={() => {
              if (!selectedTrainer) {
                setStatusMessage("Please select a trainer and provide a rating.");

              } else {
                setSelectedTrainer("");
                setStatusMessage("Rating cancelled.");
              }
            }}
          >
            Cancel
          </button>
          <button style={styles.submitButton} onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div style={styles.rightSection}>
        <Typography variant="h5" style={{ ...styles.whiteText, marginBottom: "20px" }}>
          Highest Rated Trainer
        </Typography>
        {highestRatedTrainer ? (
          <>
            <img
              src={highestRatedTrainer.profilePicture}
              alt={highestRatedTrainer.name}
              style={styles.trainerImage}
            />
            <Typography variant="h6" style={styles.whiteText}>
              {highestRatedTrainer.name}
            </Typography>
            <Typography variant="body1" style={styles.whiteText}>
              Average Rating: {highestRatedTrainer.avgRating.toFixed(1)}
            </Typography>
          </>
        ) : (
          <Typography variant="body1" style={styles.whiteText}>
            No ratings available.
          </Typography>
        )}

        {/* Status Message */}
        {statusMessage && (
  <Typography
    variant="body1"
    style={{
      color: statusMessage.includes("successfully")
        ? "green"
        : "#fff", // gray 600
      textAlign: "center",
      marginTop: "10px",
      fontWeight: "bold",
    }}
  >
    {statusMessage}
  </Typography>
)}
      </div>
    </div>
  );
};

export default RateTrainerDialog;
