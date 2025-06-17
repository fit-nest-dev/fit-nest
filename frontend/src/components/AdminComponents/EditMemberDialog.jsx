import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
/**
 * A dialog component for editing a member's details.
 *
 * This component is used to edit a member's details. It renders a form with
 * the member's current details and allows the user to edit them. When the user
 * submits the form, the edited details are sent to the backend to update the
 * member's records.
 *
 * @param {function} fetchMembershipDetails - A function to call to refresh the
 *   membership details after editing.
 * @param {object} user - The user whose details are being edited.
 * @param {boolean} openEdit - Whether the dialog is open or not.
 * @param {function} setOpenEdit - A function to call to close the dialog.
 */
const EditMemberDialog = ({ fetchMembershipDetails, user, openEdit, setOpenEdit }) => {
  const [MemberEditData, setMemberEditData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    contact: user?.mobile_number || '',
    start_date: user?.membership_details?.start_date || '',
    end_date: user?.membership_details?.end_date || '',
    status: user?.membership_details?.status || '',
    membership_id: user?.membership_details?.membership_id || '',
    paid: user?.membership_details?.PaidByUser || '',
    type: user?.membership_details?.membership_type || '',
  });
  /**
   * Closes the dialog and resets the state of the member's edited details back
   * to its initial state.
   */
  const HandleClose = () => {
    setOpenEdit(false);
    setMemberEditData({
      first_name: '',
      last_name: '',
      email: '',
      contact: '',
      start_date: '',
      membership_id: '',
      end_date: '',
      status: '',
      paid: '',
      type: '',
    });
  }
  useEffect(() => {
    setMemberEditData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      contact: user?.mobile_number || '',
      start_date: user?.membership_details?.start_date || '',
      end_date: user?.membership_details?.end_date || '',
      status: user?.membership_details?.status || '',
      membership_id: user?.membership_details?.membership_id || '',
      paid: user?.membership_details?.PaidByUser || '',
      type: user?.membership_details?.membership_type || '',
    });
  }, [user, openEdit])
  /**
   * Submits the edited member's details to the backend for updating.
   *
   * This function prompts the user for confirmation before proceeding with
   * the edit operation. If confirmed, it sends a PUT request to update the
   * member's information on the server. After a successful update, it calls
   * the `fetchMembershipDetails` function to refresh the membership details.
   * The form fields are cleared after submission.
   *
   * In case of an error during the update, it logs the error to the console.
   */

  const handleEditSubmission = async () => {
    if (window.confirm('Are you sure you want to edit this member?')) {
      try {
        const response = await axios.put(`http://3.25.86.182:5000/api/users/edit-user/${user?._id}`, MemberEditData, { withCredentials: true });
        fetchMembershipDetails(); // Fetch updated details after edit
        // Clear the form after submission (optional)
        setMemberEditData({
          first_name: '',
          last_name: '',
          email: '',
          contact: '',
          membership_id: '',
          start_date: '',
          end_date: '',
          status: '',
          paid: '',
          type: '',
        });
      } catch (err) {
        console.log(err);
      }
    }
  };

  /**
   * Updates the MemberEditData state with the new input values.
   *
   * This function is triggered by change events on input fields within
   * the edit member dialog. It extracts the name and value from the event
   * target and updates the corresponding field in the MemberEditData state.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input element.
   */

  const handleMemberEditDataChange = (e) => {
    const { name, value } = e.target;
    setMemberEditData({ ...MemberEditData, [name]: value });
  };

  return (
    <Dialog open={openEdit} onClose={HandleClose}>
      <DialogTitle>Edit Member</DialogTitle>
      <DialogContent>
        <TextField
          label="First Name"
          value={MemberEditData.first_name}
          onChange={handleMemberEditDataChange}
          name="first_name"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Last Name"
          value={MemberEditData.last_name}
          onChange={handleMemberEditDataChange}
          name="last_name"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          value={MemberEditData.email}
          onChange={handleMemberEditDataChange}
          name="email"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Contact"
          value={MemberEditData.contact}
          onChange={handleMemberEditDataChange}
          name="contact"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Start Date"
          value={MemberEditData.start_date}
          onChange={handleMemberEditDataChange}
          name="start_date"
          fullWidth
          margin="normal"
        />
        <TextField
          label="End Date"
          value={MemberEditData.end_date}
          onChange={handleMemberEditDataChange}
          name="end_date"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Status"
          value={MemberEditData.status}
          onChange={handleMemberEditDataChange}
          name="status"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Membership ID"
          value={MemberEditData.membership_id}
          onChange={handleMemberEditDataChange}
          name="membership_id"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Paid"
          value={MemberEditData.paid}
          onChange={handleMemberEditDataChange}
          name="paid"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Type"
          value={MemberEditData.type}
          onChange={handleMemberEditDataChange}
          name="type"
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button color='primary' onClick={handleEditSubmission}>EDIT</Button>
        <Button onClick={HandleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMemberDialog;
