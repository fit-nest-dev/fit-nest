import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Avatar,
  Box,
} from "@mui/material";
import TrainerShiftUpdate from "../TrainerComponents/TrainerShiftUpdate";
import bin from '../../assets/bin.png'
import { SocketContext } from "../../context/SocketContext";
import AssignTrainerDialog from "./AssignTrainerDialog";
import AddTrainerDialog from "./AddTrainerDialog";
/**
 * The TrainerDetailsAdmin component renders a table of all trainers, with their respective details 
 * and allows the admin to edit the shift, salary and availability of each trainer. The component also
 * allows the admin to assign trainers to training sessions and delete trainers. The component 
 * fetches trainers from the API and updates the state when the trainer is updated or deleted.
 * 
 * @param {array} emails - list of email addresses of the gym's members.
 * @returns {JSX.Element} - the rendered component.
 */
const TrainerDetailsAdmin = ({ emails }) => {
  const [trainers, setTrainers] = useState([]);
  const [editShift, setEditShift] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editSalary, setEditSalary] = useState(null);
  const [editAssign, setEditAssign] = useState(null);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const handleClose = () => setOpenAssignDialog(false);
  const { socket } = useContext(SocketContext);
  /**
   * Handles the search query by updating the component state with the new search query.
   * This triggers a re-render of the component with the new search query.
   * @param {string} query The search query to search for in the trainer list.
   */
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  /**
   * Handles the deletion of a trainer. Prompts the user with a confirmation dialog
   * and, if confirmed, sends a DELETE request to the API to delete the trainer.
   * If the response status is 200, the component state is updated with the
   * remaining trainers.
   * @param {string} trainerId - The ID of the trainer to be deleted.
   */
  const handleDeleteTrainer = async (trainerId) => {
    if (window.confirm('Are you sure you want to delete this trainer?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/Trainer/delete-trainer/${trainerId}`, { withCredentials: true });
        if (response.status === 200) {
          setTrainers((prevTrainers) => prevTrainers.filter((trainer) => trainer._id !== trainerId));
        }
      }
      catch (error) {
        console.log(error)
      }
    }
  }
  /**
   * Fetches all trainers from the API and updates the component's state.
   * 
   * Makes an API call to retrieve the list of all trainers and sets the
   * `trainers` state with the fetched data. Logs any errors encountered
   * during the API call to the console.
   */

  const fetchTrainers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/Trainer/AllTrainers", { withCredentials: true });
      setTrainers(response.data);
    } catch (error) {
      console.error("Error fetching trainers:", error);
    }
  };
  useEffect(() => {
    socket.on('TrainerChanges', (change) => {
      fetchTrainers();
    })
  }, [socket])
  // Fetch trainers from the API
  useEffect(() => {
    fetchTrainers();
  }, []);

  // Handle shift update
  const handleUpdateShift = async (trainerId, newShift) => {
    if (window.confirm('Are you sure you want to remove this shift?')) {
      try {
        const response = await axios.put(`http://localhost:5000/api/Trainer/remove-shift/${trainerId}`, { day: newShift.day, time: newShift.time }
          , { withCredentials: true }
        );
        if (response.data.message === "Shift removed successfully") {
          setTrainers((prevTrainers) =>
            prevTrainers.map((trainer) =>
              trainer._id === trainerId
                ? { ...trainer, shift: response?.data?.trainer?.shift } // Update the shift list of the trainer
                : trainer
            )
          );
          setEditShift(null); // Close the edit form
        }
      } catch (error) {
        console.error("Error updating shift:", error);
      }
    }
  };

  // Handle salary update
  const handleUpdateSalary = async (trainerId, newSalary) => {
    try {
      await axios.put(`http://localhost:5000/api/Trainer/update-salary/${trainerId}`, { salary: newSalary }, { withCredentials: true });
      setTrainers((prevTrainers) =>
        prevTrainers.map((trainer) =>
          trainer._id === trainerId ? { ...trainer, salary: newSalary } : trainer
        )
      );
      setEditSalary(null);
    } catch (error) {
      console.error("Error updating salary:", error);
    }
  };
  /**
   * Highlights the search query in the provided name by wrapping the matched
   * text in a bold, green span element.
   *
   * @param {string} name - The name to search for the query in.
   * @param {string} query - The query to search for in the name.
   * @returns {ReactElement} A span element containing the highlighted name.
   */
  const highlightQuery = (name, query) => {
    if (!query) return name;
    const regex = new RegExp(`(${query})`, 'i'); // Case-insensitive match
    const parts = name.split(regex);
    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} style={{ color: 'green', fontWeight: 'bold' }}>
              {part}
            </span>
          ) : (
            <span key={index} style={{ color: 'white' }}>
              {part}
            </span>
          )
        )}
      </span>
    );
  };
  // Handle availability toggle
  const handleToggleAvailability = async (trainerId, currentAvailability) => {
    try {
      await axios.put(`http://localhost:5000/api/Trainer/update-availability/${trainerId}`, {
        availability: !currentAvailability,
      }, { withCredentials: true });
      setTrainers((prevTrainers) =>
        prevTrainers.map((trainer) =>
          trainer._id === trainerId ? { ...trainer, availability: !currentAvailability } : trainer
        )
      );
    } catch (error) {
      console.error("Error toggling availability:", error);
    }
  };

  return (
    <Box padding={0.5} style={{
      backgroundColor: "black", color: "white", width: "80vw",
      height: "100vh",

      justifyContent: "center",
      alignItems: "center",
    }}>
      <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: "28px", fontWeight: "600", color: "#f1f1f1", marginBottom: "15px" }}>
        Trainer Details
      </h2>

      {/* Search Container with Icon on the Left */}
      <div className="relative w-full mb-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by name/email/mobile number"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-72 md:w-96 border border-gray-600 rounded-full py-2 pl-10 pr-4 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 hover:border-gray-500 transition-all duration-300"
        />

        {/* Search Icon */}
        <i
          className="fa fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
      </div>

      <div className="overflow-y-scroll">
        <Table style={{ backgroundColor: "black", color: "white", fontFamily: "Segoe UI, sans-serif" }}>
          <TableHead>
            <TableRow>
              <TableCell style={{ color: "white", fontSize: "14px", fontWeight: "bold", backgroundColor: "black" }}>
                Profile Picture
              </TableCell>
              <TableCell style={{ color: "white", fontSize: "14px", fontWeight: "bold", backgroundColor: "black" }}>
                Name
              </TableCell>
              <TableCell style={{ color: "white", fontSize: "14px", fontWeight: "bold", backgroundColor: "black" }}>
                Contact
              </TableCell>
              <TableCell style={{ color: "white", fontSize: "14px", fontWeight: "bold", backgroundColor: "black" }}>
                Email
              </TableCell>
              <TableCell style={{ color: "white", fontSize: "14px", fontWeight: "bold", backgroundColor: "black" }}>
                Salary
              </TableCell>
              <TableCell style={{ color: "white", fontSize: "14px", fontWeight: "bold", backgroundColor: "black" }}>
                Ratings
              </TableCell>
              <TableCell style={{ color: "white", fontSize: "14px", fontWeight: "bold", backgroundColor: "black", width: "200px" }}>
                Shift
              </TableCell>
              <TableCell style={{ color: "white", fontSize: "14px", fontWeight: "bold", backgroundColor: "black" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trainers?.filter((trainer) =>
              trainer.trainer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              trainer.trainer_contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
              trainer.email.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((trainer) => (
              <TableRow key={trainer._id} style={{ backgroundColor: "#2a2a2a", color: "white" }}>
                <TableCell style={{ color: "white" }}>
                  <Avatar src={trainer.profile_picture} alt={trainer.trainer_name} />
                </TableCell>
                <TableCell style={{ color: "white" }}>{highlightQuery(trainer.trainer_name, searchQuery)}</TableCell>
                <TableCell style={{ color: "white" }}>{highlightQuery(trainer.trainer_contact, searchQuery)}</TableCell>
                <TableCell style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", color: "white" }}>
                  {highlightQuery(trainer.email, searchQuery)}
                </TableCell>
                <TableCell style={{ color: "white" }}>
                  {editSalary === trainer._id ? (
                    <TextField
                      type="number"
                      defaultValue={trainer.salary}
                      onBlur={(e) => handleUpdateSalary(trainer._id, e.target.value)}
                      style={{ color: "white", backgroundColor: "white" }}
                    />
                  ) : (
                    `₹${Number(trainer.salary) + Number(trainer.trainers_assigned.reduce((acc, curr) => acc + curr.extra_payment, 0))}`
                  )}
                  <Button
                    variant="text"
                    onClick={() => setEditSalary(editSalary === trainer._id ? null : trainer._id)}
                    size="small"
                    style={{ color: "green", fontWeight: "bold" }}
                  >
                    {editSalary === trainer._id ? "Cancel" : "Edit"}
                  </Button>
                </TableCell>
                <TableCell style={{ color: "white" }}>
                  {trainer.ratings.length > 0 ? (
                    <div>
                      <strong>Average Rating: </strong>
                      {(
                        trainer.ratings.reduce((acc, curr) => acc + curr.rating, 0) /
                        trainer.ratings.length
                      ).toFixed(1)}
                    </div>
                  ) : (
                    "No Ratings"
                  )}
                </TableCell>
                <TableCell>
                  {editShift === trainer._id ? (
                    <TrainerShiftUpdate trainer={trainer} editShift={editShift} setEditShift={setEditShift}
                      trainers={trainers} setTrainers={setTrainers} />
                  ) : (
                    trainer?.shift?.map((s, idx) => (
                      <div key={idx} className="flex gap-1 text-white">
                        {s?.day} ({s?.time})
                        <img src={bin} onClick={() => handleUpdateShift(trainer._id, s)} width={20} height={20} className="hover:cursor-pointer" alt="" />
                      </div>
                    ))
                  )}
                  <Button
                    variant="text"
                    onClick={() => setEditShift(editShift === trainer._id ? null : trainer._id)}
                    size="small"
                    style={{ color: "white", fontWeight: "bold" }}
                  >
                    {editShift === trainer._id ? "Cancel" : "Assign"}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-col">
                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => setOpenAssignDialog(true)}>
                      REQUESTS
                    </button>
                    <button onClick={() => { handleDeleteTrainer(trainer._id) }} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-1">
                      Delete
                    </button>

                    <Button
                      variant={trainer.availability ? "contained" : "outlined"}
                      color={trainer.availability ? "success" : "error"}
                      onClick={() => handleToggleAvailability(trainer._id, trainer.availability)}
                      size="small"
                      style={{ fontWeight: "bold" }}
                    >
                      {trainer.availability ? "Available" : "Unavailable"}
                    </Button>
                  </div>
                  <AssignTrainerDialog trainers={trainers} trainer={trainer} emails={emails} onClose={handleClose} open={openAssignDialog} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>


      <AddTrainerDialog fetchTrainers={fetchTrainers} openDialog={openDialog} setOpenDialog={setOpenDialog} />
      <Button onClick={() => setOpenDialog(true)} style={{
        position: "floating", marginTop: "20px", float: "right", marginBottom: "20px", backgroundColor: "green", color: "white", fontWeight: "bold",
      }}>
        ADD TRAINER
      </Button>
    </Box>



  );
};

export default TrainerDetailsAdmin;
