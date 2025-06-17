import React, { useState } from "react";
import { Select, MenuItem, Button } from "@mui/material";

const TrainerShiftUpdate = ({ trainer, setEditShift, setTrainers }) => {
  // State to store selected day and time
  const [selectedDay, setSelectedDay] = useState(trainer.shift[0]?.day || "");
  const [selectedTime, setSelectedTime] = useState(trainer.shift[0]?.time || "");

  // Handler to update the day
  const handleDayChange = (event) => {
    setSelectedDay(event.target.value);
  };

  // Handler to update the time
  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
  };

  // Handler to submit the new shift
  const handleSubmitShift = async () => {
    const newShift = { day: selectedDay, time: selectedTime };

    // Make API call to update the shift (use your actual API endpoint here)
    try {
      const response = await fetch(`http://3.25.86.182:5000/api/Trainer/update-shift/${trainer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shift: [newShift] }),
        credentials: "include",
      });
      const data = await response.json();
      if (data.message === "Shift updated successfully") {
        setEditShift(null); // Close the edit form

        // Ensure newShift is an array if it's not already
        const newShiftArray = Array.isArray(newShift) ? newShift : [newShift];

        setTrainers((prevTrainers) =>
          prevTrainers.map((t) =>
            t._id === trainer._id
              ? {
                ...t,
                shift: [
                  ...t.shift, // Keep existing shifts
                  ...newShiftArray.filter(
                    (newS) =>
                      !t.shift.some(
                        (existingS) =>
                          existingS.day === newS.day && existingS.time === newS.time
                      )
                  ), // Add new shift if it doesn't exist already
                ],
              }
              : t
          )
        );
      }

    } catch (error) {
      console.error("Error updating shift:", error);
    }
  };

  return (
    <div>
      <Select
        value={selectedDay}
        onChange={handleDayChange}
        sx={{
          backgroundColor: "white",
          borderRadius: 1,
          marginBottom: 2, // Adds space below
          width: "100%",
        }}
      >
        <MenuItem value="Monday">Monday</MenuItem>
        <MenuItem value="Tuesday">Tuesday</MenuItem>
        <MenuItem value="Wednesday">Wednesday</MenuItem>
        <MenuItem value="Thursday">Thursday</MenuItem>
        <MenuItem value="Friday">Friday</MenuItem>
        <MenuItem value="Saturday">Saturday</MenuItem>
        <MenuItem value="Sunday">Sunday</MenuItem>
      </Select>

      <Select
        value={selectedTime}
        onChange={handleTimeChange}
        sx={{
          backgroundColor: "white",
          borderRadius: 1,
          marginBottom: 2, // Adds space below
          width: "100%",
        }}
      >
        <MenuItem value="9 AM - 5 PM">9 AM - 5 PM</MenuItem>
        <MenuItem value="9 AM - 6 PM">9 AM - 6 PM</MenuItem>
        <MenuItem value="9 AM - 7 PM">9 AM - 7 PM</MenuItem>
        <MenuItem value="9 AM - 8 PM">9 AM - 8 PM</MenuItem>
        <MenuItem value="9 AM - 9 PM">9 AM - 9 PM</MenuItem>
      </Select>


      <Button style={{ color: "black", backgroundColor: "white" }} onClick={handleSubmitShift}>
        Submit New Shift
      </Button>
    </div>
  );
};

export default TrainerShiftUpdate;
