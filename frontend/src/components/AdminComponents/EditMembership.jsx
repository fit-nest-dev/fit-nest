import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * EditMembership component allows admins to edit details of an existing membership plan.
 *
 * This component displays a dialog with fields for editing the plan's title, price,
 * description, and discounted price. It initializes the form with the current plan data
 * and updates the parent state and backend upon saving.
 *
 * @param {boolean} openDialog - Determines whether the dialog is open.
 * @param {function} setOpenDialog - Function to close the dialog.
 * @param {Object} plan - The membership plan object containing details to be edited.
 * @param {function} setPlans - Callback function to update the plans in the parent state.
 * @param {Array} plans - Array of all membership plans.
 */
const EditMembership = ({ openDialog, setOpenDialog, plan, setPlans, plans }) => {
  const [handlePlanData, setHandlePlanData] = useState({
    title: plan?.title || '',
    price: plan?.price || '',
    description: plan?.description || '',
    discountedPrice: plan?.discountedPrice || '',
  });
  useEffect(() => {
    if (openDialog && plan) {
      setHandlePlanData({
        title: plan?.title || '',
        price: plan?.price || '',
        description: plan?.description || '',
        discountedPrice: plan?.discountedPrice || '',
      });
    }
  }, [openDialog, plan]);
  /**
   * Closes the edit dialog and resets the plan data state.
   *
   * This function sets the `openDialog` state to false, closing the dialog.
   * It also resets the `handlePlanData` state to its initial empty values,
   * clearing any existing input data from the form fields.
   */

  const handleCloseEdit = () => {
    setOpenDialog(false);
    setHandlePlanData({
      title: '',
      price: '',
      description: '',
      discountedPrice: '',
    })
  }
  /**
   * Updates the handlePlanData state with new values from input fields.
   *
   * This function is triggered on input change events, retrieving the
   * name and value of the changed input from the event object. It then
   * updates the corresponding property in the handlePlanData state.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input element.
   */
  const handleDataChange = (e) => {
    setHandlePlanData({
      ...handlePlanData,
      [e.target.name]: e.target.value,
    });
  };


  /**
   * Sends an update request to the backend to modify an existing membership plan.
   *
   * This function makes an HTTP PUT request to update the membership plan
   * details specified in the `handlePlanData` state using the plan's ID.
   * Upon a successful update, it updates the relevant plan in the `plans`
   * state with the response data and closes the edit dialog. If an error
   * occurs during the request, it logs the error to the console.
   */

  const handlePlanEdit = async () => {
    try {
      const response = await axios.put(
        `http://3.25.86.182:5000/api/Admin/UpdateMembershipPlan/${plan._id}`,
        handlePlanData, { withCredentials: true }
      );
      setPlans((prevPlans) =>
        prevPlans.map((p) => (p._id === plan._id ? response.data : p))
      );

      handleCloseEdit();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Dialog open={openDialog} onClose={handleCloseEdit}>
      <DialogTitle>Edit Plan</DialogTitle>
      <DialogContent>
        <TextField
          label="Plan Name"
          variant="outlined"
          value={handlePlanData.title}
          fullWidth
          name="title"
          margin="dense"
          onChange={handleDataChange}
        />
        <TextField
          label="Price"
          variant="outlined"
          value={handlePlanData.price}
          fullWidth
          name="price"
          margin="dense"
          onChange={handleDataChange}
        />
        <TextField
          label="Description"
          variant="outlined"
          value={handlePlanData.description}
          fullWidth
          name="description"
          margin="dense"
          onChange={handleDataChange}
        />
        <TextField
          label="Discount Price"
          variant="outlined"
          value={handlePlanData.discountedPrice}
          fullWidth
          name="discountedPrice"
          margin="dense"
          onChange={handleDataChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseEdit}>Close</Button>
        <Button onClick={handlePlanEdit}>Save & Edit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMembership;
