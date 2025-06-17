import React, { useState, useEffect, useContext } from "react";
import {
  Typography,
  Grid,
  Box,
  Button,
  Container,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import the default fallback image
import defaultProfilePic from "../../assets/default.png";

const styles = {
  container: {
    backgroundColor: "#000000",
    color: "#fff",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "100%",
    maxHeight: "80vh", // Restrict container height
    overflowY: "auto", // Enable scrolling for smaller screens
  },
  title: {
    color: "#fff",
    textAlign: "center",
    marginBottom: "30px",
  },
  trainerCard: {
    backgroundColor: "#000000",
    padding: "16px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(21, 116, 48, 0.81)",
    textAlign: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    minHeight: "200px", // Uniform card height
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between", // Evenly space content
    alignItems: "center",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0 6px 16px rgba(0, 0, 0, 0.3)",
    },
  },
  trainerTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1.2rem",
    marginBottom: "8px",
  },
  trainerInfo: {
    color: "#fff",
    marginBottom: "4px",
    fontSize: "0.9rem",
  },
  button: {
    backgroundColor: "green",
    color: "#fff",
    padding: "10px 16px",
    fontWeight: "bold",
    borderRadius: "30px",
    textTransform: "none",
    fontSize: "0.9rem",
    "&:hover": {
      backgroundColor: "#27ae60",
    },
    width: "80%", // Uniform button width
    marginTop: "10px",
  },
  buttonPending: {
    backgroundColor: "#000",
    color: "white",
    padding: "6px 12px",
    fontWeight: "bold",
    fontSize: "1rem",
    textTransform: "none",
    display: "inline-block",
  },
  statusPaid: {
    backgroundColor: "#000",
    color: "green",
    padding: "6px 12px",
    fontWeight: "bold",
    fontSize: "1rem",
    display: "inline-block",
  },
  noTrainersText: {
    color: "#fff",
    textAlign: "center",
    fontSize: "1.2rem",
    marginTop: "20px",
  },
  availableText: {
    color: "#fff",
    textAlign: "center",
    marginTop: "30px",
    marginBottom: "30px",
  },
  "@media (max-width: 768px)": {
    container: {
      padding: "10px",
      maxHeight: "70vh",
    },
    trainerCard: {
      padding: "12px",
    },
    title: {
      fontSize: "1.2rem",
    },
  },
};

const TrainersAssignedToUsers = ({ userId }) => {
  const [trainers, setTrainers] = useState([]);
  const [availaibleTrainers, setAvailaibleTrainers] = useState([]);
  const { Authuser } = useAuthContext();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  const fetchAvailaibleTrainers = async () => {
    try {
      const response = await axios.get("http://3.25.86.182:5000/api/Trainer/AllTrainers", { withCredentials: true });
      setAvailaibleTrainers(response.data);
    } catch (error) {
      console.error("Error fetching trainers:", error);
    }
  };

  useEffect(() => {
    fetchAvailaibleTrainers();
  }, []);

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://3.25.86.182:5000/api/Trainer/trainers-assigned-to-user/${userId}`, { withCredentials: true })
        .then((response) => {
          setTrainers(response.data);
        })
        .catch((error) => {
          console.error("Error fetching trainers:", error);
        });
    }
  }, [userId, fetchAvailaibleTrainers, socket]);

  const handleRequestForTrainer = async (trainerId) => {
    try {
      const response = await axios.put("http://3.25.86.182:5000/api/Trainer/request-trainer", {
        trainerId,
        memberId: Authuser._id,
        memberName: `${Authuser.first_name} ${Authuser.last_name}`,
        memberEmail: Authuser.email,
        memberContact: Authuser.mobile_number,
        startDate: null,
        endDate: null,
      }, { withCredentials: true });

      if (response.status === 200) {
        fetchAvailaibleTrainers();
      } else {
      }
    } catch (err) {
      console.error("Error requesting trainer:", err);
      toast.error(err.response.data.message, {
        position: "top-center",
        autoClose: 3000,
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
    }
  };

  return (
    <Container style={styles.container}>
      <ToastContainer />
      <Typography variant="h5" style={styles.title}>
        Personal Trainers Assigned
      </Typography>

      {/* Trainers Assigned */}
      {trainers.length > 0 ? (
        <Grid container spacing={3} justifyContent="center">
          {trainers.map((trainer) =>
            trainer.trainers_assigned
              .filter((assignment) => assignment.memberId === userId)
              .map((assignment) => (
                <Grid item xs={12} sm={6} md={4} key={assignment._id}>
                  <Box style={styles.trainerCard}>
                    <Typography variant="h6" style={styles.trainerTitle}>
                      {trainer.trainer_name || "Unknown Trainer"}
                    </Typography>
                    <Typography variant="body2" style={styles.trainerInfo}>
                      {new Date(assignment.start_date).toLocaleDateString() === "1/1/1970"
                        ? "Yet to be Assigned"
                        : new Date(assignment.start_date).toLocaleDateString()}
                      {" To "}
                      {new Date(assignment.end_date).toLocaleDateString() === "1/1/1970"
                        ? "Yet To be Assigned"
                        : new Date(assignment.end_date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" style={styles.trainerInfo}>
                      Trainer's Fee : {" "}
                      {assignment.extra_payment === 0
                        ? "Yet to be Assigned"
                        : assignment.extra_payment}
                    </Typography>
                    {assignment.paidByUser ? (
                      <>
                        <Typography style={styles.statusPaid}> {assignment.AdminActions === 'REQUEST-TO-PAY' ? 'Paid & Pending' : 'Assigned'}</Typography>
                      </>
                    ) : assignment.AdminActions === "REQUEST-TO-PAY" ? (
                      <Button
                        onClick={() =>
                          navigate(
                            `/PayPersonalTrainer/${assignment._id}/${assignment.memberId}/${assignment.start_date}/${assignment.end_date}/${assignment.extra_payment}`
                          )
                        }
                        style={styles.button}
                      >
                        Accept & Pay
                      </Button>
                    ) : (
                      <Button disabled style={styles.buttonPending}>
                        Pending
                      </Button>
                    )}
                  </Box>
                </Grid>
              ))
          )}
        </Grid>
      ) : (
        <Typography style={styles.noTrainersText}>
          No trainers assigned to this user.
        </Typography>
      )}

      {/* Available Trainers */}
      <Typography variant="h5" style={styles.availableText}>
        Available Trainers
      </Typography>
      {availaibleTrainers.length > 0 ? (
        <Grid container spacing={3} justifyContent="center">
          {availaibleTrainers
            .filter((trainer) => trainer.availability === true)
            .map((trainer) => (
              <Grid item xs={12} sm={6} md={4} key={trainer._id}>
                <Box style={styles.trainerCard}>
                  {/* Display Profile Picture */}
                  <Box
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      marginBottom: "15px",
                    }}
                  >
                    <img
                      src={trainer.profile_picture || defaultProfilePic}
                      alt={trainer.trainer_name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>

                  <Typography variant="h6" style={styles.trainerTitle}>
                    {trainer.trainer_name || "Unknown Trainer"}
                  </Typography>
                  <Typography variant="body2" style={styles.trainerInfo}>
                    {trainer.availability ? "Available" : "Not Available"}
                  </Typography>
                  <Button
                    onClick={() => handleRequestForTrainer(trainer._id)}
                    style={styles.button}
                  >
                    Request
                  </Button>
                </Box>
              </Grid>
            ))}
        </Grid>
      ) : (
        <Typography style={styles.noTrainersText}>
          No Trainers Available
        </Typography>
      )}
    </Container>
  );
};

export default TrainersAssignedToUsers;
