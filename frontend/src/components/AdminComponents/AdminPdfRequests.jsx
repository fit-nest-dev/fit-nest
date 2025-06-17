import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

/**
 * AdminPdfRequests is a React component that displays a list of all user PDF plan requests to the admin.
 * It fetches the requests from the server and displays them in a table with the user's email, age, gender, height, weight, fitness goal, and actions.
 * The actions include sending an email to the user with their customized fitness plan and deleting the request.
 * The component also includes a button to view the requests and a dialog to display the requests.
 * The dialog includes a table with the requests and a close button.
 * @returns {ReactElement} The AdminPdfRequests component.
 */
const AdminPdfRequests = () => {
  const [requests, setRequests] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch all user PDF requests
  const fetchRequests = async () => {
    try {
      const response = await axios.get("http://3.25.86.182:5000/api/Admin/get-user-plan-pdf-requests", { withCredentials: true });
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching PDF requests:", error);
    }
  };

  // Delete a specific request
  const deleteRequest = async (id) => {
    try {
      await axios.delete(`http://3.25.86.182:5000/api/Admin/delete-user-plan-pdf-request/${id}`, { withCredentials: true });
      setRequests(requests.filter((req) => req._id !== id));
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "20px",
        }}
      >
        <Button
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            // borderRadius: "5px",
            padding: "10px 20px",
            '&:hover': { backgroundColor: '#45a049' },
          }}
          variant="contained"
          onClick={() => setDialogOpen(true)}
        >
          View PDF Requests
        </Button>
      </div>


      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        style={{
          padding: "20px",
          backgroundColor: "#1C1C1C",
          // borderRadius: "10px",
        }}
      >
        <DialogTitle
          style={{
            backgroundColor: "#333",
            color: "white",
            padding: "20px",
            fontSize: "1.5rem",
            // borderRadius: "10px 10px 0 0",
          }}
        >
          User PDF Plan Requests
        </DialogTitle>
        <DialogContent style={{ backgroundColor: "#222", color: "white", padding: "20px" }}>
          {requests?.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
              <thead>
                <tr style={{ backgroundColor: "#444" }}>
                  <th style={{ color: "black" }}>Email</th>
                  <th style={{ color: "black" }}>Age</th>
                  <th style={{ color: "black" }}>Gender</th>
                  <th style={{ color: "black" }}>Height</th>
                  <th style={{ color: "black" }}>Weight</th>
                  <th style={{ color: "black" }}>Fitness Goal</th>
                  <th style={{ color: "black" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 && requests?.map((req) => (
                  <tr key={req._id} style={{ borderBottom: "1px solid #555" }}>
                    <td>{req.email}</td>
                    <td>{req.age}</td>
                    <td>{req.gender}</td>
                    <td>{req.height} cm</td>
                    <td>{req.weight} kg</td>
                    <td>{req.fitnessGoal}</td>
                    <td>
                      <a
                        href={`mailto:${req.email}?subject=Your%20Fitness%20Plan%20KIT`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="contained"
                          style={{
                            marginRight: "10px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            // borderRadius: "5px",
                            padding: "8px 16px",
                            '&:hover': { backgroundColor: '#45a049' },
                            marginBottom: "5px"
                          }}
                        >
                          Send Email KIT
                        </Button>
                      </a>
                      <Button
                        variant="contained"
                        style={{
                          backgroundColor: "#f44336",
                          color: "white",
                          // borderRadius: "5px",
                          padding: "8px 16px",
                          '&:hover': { backgroundColor: '#e53935' },
                        }}
                        onClick={() => deleteRequest(req._id)}
                      >
                        Delete Request
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No PDF requests found.</p>
          )}
        </DialogContent>
        <DialogActions
          style={{
            backgroundColor: "#333",
            padding: "10px",
            // borderRadius: "0 0 10px 10px",
          }}
        >
          <Button
            onClick={() => setDialogOpen(false)}
            style={{
              backgroundColor: "#f44336",
              color: "white",
              // borderRadius: "5px",
              padding: "8px 16px",
              '&:hover': { backgroundColor: '#e53935' },
              marginBottom: "5px"
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>


  );
};

export default AdminPdfRequests;
