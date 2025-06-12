import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import axios from "axios";

/**
 * A dialog component for adding a membership plan.
 *
 * @param {function} fetchPlans A function to call to refresh the membership plan list.
 * @param {boolean} open Whether the dialog is open or not.
 * @param {function} onClose A function to call when the dialog is closed.
 */
const AddMembershipPlanDialog = ({ fetchPlans, open, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    discountedPrice: "",
    description: "",
  });

  /**
   * Updates the formData state with new values from input fields.
   *
   * This function is triggered on input change events, retrieving the
   * name and value of the changed input from the event object. It then
   * updates the corresponding property in the formData state.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input element.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Submits the membership plan form data to the backend to add a new
   * membership plan.
   *
   * Before submitting the form, a confirmation dialog is shown to the user.
   * If the user confirms, the form data is sent to the backend to add a new
   * membership plan. If the backend responds with a 200 status code, the
   * dialog is closed and the membership plan list is refreshed. If the
   * backend responds with an error, an error message is shown to the user.
   */
  const handleSubmit = async () => {
    if (window.confirm("Are you sure you want to add this membership plan?")) {
      try {
        // Call backend to add the membership plan
        const response = await axios.post(
          "http://localhost:5000/api/Admin/add-membership-plans",
          formData, { withCredentials: true }
        );
        if (response.status === 200) {
          alert("Membership plan added successfully!");
          onClose(); // Close the dialog
          fetchPlans(); // Refresh the membership plan list
        }
      } catch (error) {
        console.error("Error adding membership plan:", error);
        alert("Failed to add membership plan. Please try again.");
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "#000", // Black background
          color: "#fff", // White text color
          padding: "20px", // Reduced padding
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", paddingBottom: "10px" }}>
        Add Membership Plan
      </DialogTitle>
      <DialogContent>
        <TextField
          name="title"
          label="Title"
          value={formData.title}
          onChange={handleChange}
          fullWidth
          margin="dense"
          sx={{
            input: {
              color: "white", // White text inside input
            },
            label: {
              color: "#aaa", // Lighter label color
            },
          }}
        />
        <TextField
          name="price"
          label="Price"
          value={formData.price}
          onChange={handleChange}
          fullWidth
          margin="dense"
          sx={{
            input: {
              color: "white", // White text inside input
            },
            label: {
              color: "#aaa", // Lighter label color
            },
          }}
        />
        <TextField
          name="discountedPrice"
          label="Discounted Price"
          value={formData.discountedPrice}
          onChange={handleChange}
          fullWidth
          margin="dense"
          sx={{
            input: {
              color: "white", // White text inside input
            },
            label: {
              color: "#aaa", // Lighter label color
            },
          }}
        />
        <TextField
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          margin="dense"
          sx={{
            input: {
              color: "white", // White text inside input
            },
            label: {
              color: "#aaa", // Lighter label color
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ paddingTop: "10px" }}>
        <Button
          onClick={onClose}
          color="secondary"
          sx={{
            color: "#fff", // White text on the button
            borderColor: "#fff", // White border for button
            ":hover": {
              borderColor: "#ccc", // Lighter hover border
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          sx={{
            backgroundColor: "#ff4081", // Custom button color
            ":hover": {
              backgroundColor: "#f50057", // Hover color
            },
          }}
        >
          Add Plan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMembershipPlanDialog;
