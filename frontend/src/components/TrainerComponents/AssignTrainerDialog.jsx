
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Select, MenuItem } from "@mui/material";
import { useAuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";

/**
 * AssignTrainerDialog is a React component that renders a dialog box for
 * assigning a trainer to a user. It accepts the following props:
 *
 * - `open`: a boolean indicating whether the dialog is open or not
 * - `onClose`: a function to be called when the dialog is closed
 * - `trainers`: an array of trainers to be assigned to the user
 * - `emails`: an array of emails of the trainers
 *
 * The component renders a dialog box with a select box for selecting a trainer,
 * a start date and end date input boxes, and an "Approve" button. When the
 * "Approve" button is clicked, the `approveTrainer` function is called with the
 * selected trainer ID, start date, end date, and extra payment as arguments.
 *
 * The component also renders a list of assigned trainers and their respective
 * start and end dates. If the end date is not assigned, the component renders
 * a "Remove & Refund" button. If the end date is assigned, the component renders
 * a "Remove" button.
 */

const AssignTrainerDialog = ({ open, onClose, trainers, emails }) => {
  const { Authuser } = useAuthContext();
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assignedTrainers, setAssignedTrainers] = useState([]);
  const [AdminActions, setAdminActions] = useState("");
  const [extraPayment, setExtraPayment] = useState(0);
  const { socket } = useContext(SocketContext);
  useEffect(() => {
    if (selectedTrainer) {
      fetchAssignedTrainers(selectedTrainer);
    }
  }, [selectedTrainer, socket]);
  /**
   * Fetches the trainers assigned to a specific trainer.
   * 
   * Makes an API call to retrieve the list of assigned trainers for the given
   * trainer ID and updates the state with the fetched data.
   * 
   * @param {string} selectedTrainer - The ID of the trainer for whom assigned trainers are to be fetched.
   * 
   * Logs the response data to the console and updates the `assignedTrainers` state
   * with the fetched trainers. Handles and logs any errors that occur during the API call.
   */
  const fetchAssignedTrainers = async (selectedTrainer) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/Trainer/GetAssignedTrainers/${selectedTrainer}`, { withCredentials: true }
      );
      setAssignedTrainers(response.data.trainers_assigned || []);
    } catch (error) {
      console.error("Error fetching assigned trainers:", error);
    }
  };
  /**
   * Approves a trainer request sent by a user.
   * 
   * Makes an API call to the server to update the trainer's request status.
   * If the operation is successful, the response will include the updated trainer object.
   * 
   * @param {string} AdminActions - The status of the assignment (ASSIGNED, NOT-ASSIGNED, PENDING, REQUEST-TO-PAY).
   * @param {string} trainerId - The ID of the trainer to whom the request was sent.
   * @param {string} memberId - The ID of the member who sent the request.
   * @param {string} name - The name of the member who sent the request.
   * @param {string} email - The email address of the member who sent the request.
   * @param {string} contact - The contact number of the member who sent the request.
   * @param {string} startDate - The start date of the assignment.
   * @param {string} endDate - The end date of the assignment.
   * @param {number} extra_payment - The extra payment requested from the member.
   * 
   * Logs the response data to the console and updates the `assignedTrainers` state
   * with the fetched trainers. Handles and logs any errors that occur during the API call.
   */
  const handleApprove = async (AdminActions, trainerId, memberId, name, email, contact, startDate, endDate, extra_payment) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/Trainer/approve-trainer/${trainerId}/${memberId}`, { AdminActions, name, email, contact, startDate, endDate, extra_payment }
        , { withCredentials: true }
      );
      if (response.status === 200) {
        fetchAssignedTrainers(trainerId);
      }
    }
    catch (err) {
      console.log(err)
    }
  }
  /**
   * Removes a trainer assigned to a user and refunds the user for the extra payment made.
   * 
   * Makes an API call to the server to update the trainer's request status.
   * If the operation is successful, the response will include the updated trainer object.
   * 
   * @param {string} memberId - The ID of the member who made the request.
   * @param {string} trainerId - The ID of the trainer to whom the request was sent.
   * @param {string} paymentId - The ID of the payment made by the member.
   * @param {number} amount - The amount of the extra payment made by the member.
   * 
   * Logs the response data to the console and updates the `assignedTrainers` state
   * with the fetched trainers. Handles and logs any errors that occur during the API call.
   */
  const removeTrainerRefund = async (memberId, trainerId, paymentId, amount, userName, userEmail, startDate, endDate) => {
    if (window.confirm('Are you sure you want to remove this assigment and refund the user ?')) {
      try {
        const response = await axios.put(`http://localhost:5000/api/Trainer/remove-trainer-refund/${memberId}/${trainerId}`, {
          paymentId, amount
          , userEmail: userEmail,
          userName: userName,
          startDate: startDate,
          endDate: endDate
        }
          , { withCredentials: true }
        );
        if (response.status === 200) {
          fetchAssignedTrainers(trainerId);
        }
      }
      catch (err) {
        console.log(err)
      }
    }
  }
  /**
   * Removes a trainer assigned to a user.
   * 
   * Makes an API call to the server to update the trainer's request status.
   * If the operation is successful, the response will include the updated trainer object.
   * 
   * @param {string} memberId - The ID of the member to whom the trainer is assigned.
   * @param {string} trainerId - The ID of the trainer to be removed.
   * 
   * Logs the response data to the console and updates the `assignedTrainers` state
   * with the fetched trainers. Handles and logs any errors that occur during the API call.
   */
  const removeTrainer = async (memberId, trainerId) => {
    if (window.confirm('Are you sure you want to remove this request from user ?')) {
      try {
        await axios.put(
          `http://localhost:5000/api/Trainer/RemoveTrainer/${memberId}/${trainerId}`, {}, { withCredentials: true }
        );
        alert("Trainer removed successfully!");
        fetchAssignedTrainers(trainerId);
      } catch (error) {
        console.error("Error removing trainer:", error);
      }
    }
  };
  /**
   * Requests payment from a user for a trainer.
   * The trainer is identified by the trainerId parameter and the user is identified by the memberId parameter.
   * The function updates the AdminActions field of the assigned trainer with the REQUEST-TO-PAY status.
   * If the operation is successful, the response will include the updated trainer object.
   *
   * @param {string} AdminActions - The status of the assignment (e.g. ASSIGNED, NOT-ASSIGNED, PENDING, REQUEST-TO-PAY).
   * @param {string} trainerId - The ID of the trainer to assign.
   * @param {string} memberId - The ID of the member to assign to the trainer.
   * @param {string} name - The name of the member to assign to the trainer.
   * @param {string} email - The email address of the member to assign to the trainer.
   * @param {string} contact - The contact number of the member to assign to the trainer.
   * @param {string} startDate - The start date of the assignment.
   * @param {string} endDate - The end date of the assignment.
   * @param {number} extra_payment - The extra payment to be made to the trainer.
   *
   * Logs the response data to the console and updates the `assignedTrainers` state
   * with the fetched trainers. Handles and logs any errors that occur during the API call.
   */
  const handleRequestToPay = async (AdminActions, trainerId, memberId, name, email, contact, startDate, endDate, extra_payment) => {
    if (!startDate || !endDate || !extra_payment) { return alert("Please fill all the fields") }
    try {
      const response = await axios.put(`http://localhost:5000/api/Trainer/request-to-pay-for-user/${trainerId}/${memberId}`, { AdminActions, name, email, contact, startDate, endDate, extra_payment }
        , { withCredentials: true }
      );
      if (response.status === 200) {
        fetchAssignedTrainers(trainerId);
      }
    }
    catch (err) {
      console.log(err)
    }
  }
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>View Assigned Users & New Requests</DialogTitle>
      <DialogContent>
        {/* Select Trainer */}
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="trainerSelect">Select Trainer:</label>
          <Select
            id="trainerSelect"
            fullWidth
            value={selectedTrainer}
            onChange={(e) => setSelectedTrainer(e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Choose trainer
            </MenuItem>
            {trainers?.map((trainer) => (
              <MenuItem key={trainer._id} value={trainer._id}>
                {trainer.trainer_name}
              </MenuItem>
            ))}
          </Select>
        </div>

        {/* Date Range */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </div>

        {/* Assigned Trainers */}
        <div style={{ marginBottom: "20px" }}>
          <button className="bg-zinc-200 text-black font-bold py-2 px-4 rounded" onClick={() => fetchAssignedTrainers(selectedTrainer)}>REFRESH</button>
          <h3 className="font-bold">Assigned Users:</h3>
          {assignedTrainers.length > 0 ? (
            <ul>
              {assignedTrainers.filter((trainer) => (trainer.AdminActions === "ASSIGNED")).map((trainer, index) => (
                <li key={trainer._id || index}>
                  <strong>User:</strong> {trainer.memberName} <br />
                  <strong>User Email: {trainer.memberEmail} </strong><br />
                  <strong>User Contact: {trainer.memberContact}</strong> <br />
                  <strong>Start Date:</strong> {new Date(trainer.start_date).toLocaleDateString() === "1/1/1970" ? "Not assigned" : new Date(trainer.start_date).toLocaleDateString()} <br />
                  <strong>End Date:</strong> {new Date(trainer.end_date).toLocaleDateString() === "1/1/1970" ? "Not assigned" : new Date(trainer.end_date).toLocaleDateString()} <br />
                  <strong>Paid by user:</strong> {trainer.paidByUser.toString()} <br />
                  {/* Admin Actions Dropdown */}
                  {/* Remove Button */}
                  {Date.now() >= new Date(trainer.end_date).getTime() ? <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => removeTrainer(trainer.memberId, trainer._id)}
                    style={{ marginTop: "10px" }}
                  >
                    Remove
                  </Button> :
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        removeTrainerRefund(trainer.memberId, trainer._id, trainer.PaymentId, trainer.extra_payment, trainer.memberName, trainer.memberEmail
                          , trainer.start_date, trainer.end_date
                        )
                      }}
                      style={{ marginTop: "10px", marginLeft: "10px" }}
                    >
                      REMOVE & REFUND
                    </Button>
                  }
                </li>
              ))}

            </ul>
          ) : (
            <p className="text-gray-600">No trainers assigned yet.</p>
          )}
          <div className="mt-4 font-bold" >REQUESTS:
            <ul>
              {assignedTrainers.length > 0 && assignedTrainers.filter((trainer) => trainer.AdminActions === "PENDING" || trainer.AdminActions === "REQUEST-TO-PAY").map((trainer, index) => (
                <li key={trainer._id || index}>
                  <strong>User:</strong> {trainer.memberName} <br />
                  <strong>User Email: {trainer.memberEmail} </strong><br />
                  <strong>User Contact: {trainer.memberContact}</strong> <br />
                  <label>
                    SET EXTRA PAYMENT
                    <input type="text"
                      // value={0}
                      label="Extra Payment"
                      className="border border-black ml-3"
                      name="extra_payment"
                      onChange={(e) => setExtraPayment(e.target.value)}
                    /> <br />
                  </label>    <strong>Start Date:</strong> {new Date(trainer.start_date).toLocaleDateString() === "1/1/1970" ? "Not assigned" : new Date(trainer.start_date).toLocaleDateString()} <br />
                  <strong>End Date:</strong> {new Date(trainer.end_date).toLocaleDateString() === "1/1/1970" ? "Not assigned" : new Date(trainer.end_date).toLocaleDateString()} <br />
                  <strong>Paid by user:</strong> {trainer.paidByUser.toString()} <br />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => { handleApprove(AdminActions, trainer._id, trainer.memberId, trainer.memberName, trainer.memberEmail, trainer.memberContact, trainer.start_date, trainer.end_date, trainer.extra_payment) }}
                    style={{ marginTop: "10px" }}
                    disabled={!trainer.paidByUser}
                  >
                    APPROVE
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => { handleRequestToPay(AdminActions, trainer._id, trainer.memberId, trainer.memberName, trainer.memberEmail, trainer.memberContact, startDate, endDate, extraPayment) }}
                    style={{ marginTop: "10px", marginLeft: "10px" }}
                    disabled={trainer.paidByUser}
                  >

                    REQUEST TO PAY & ASSIGN DATES
                  </Button>
                  {trainer.paidByUser ? <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      removeTrainerRefund(trainer.memberId, trainer._id, trainer.PaymentId, trainer.extra_payment, trainer.memberName, trainer.memberEmail
                        , trainer.start_date, trainer.end_date
                      )
                    }}
                    style={{ marginTop: "10px", marginLeft: "10px" }}
                  >
                    REMOVE & REFUND
                  </Button> :
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => { removeTrainer(trainer.memberId, trainer._id) }}
                      style={{ marginTop: "10px", marginLeft: "10px" }}
                    >
                      REMOVE
                    </Button>
                  }
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignTrainerDialog;
