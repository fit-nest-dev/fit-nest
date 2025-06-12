import React, { useState } from "react";
import { TextField } from "@mui/material";

const DateInput = ({ handleMembersChange, start_date }) => {
  const [date, setDate] = useState("");

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    // You can add validation here to check if the date is in YYYY-MM-DD format
    setDate(inputDate);
  };

  return (
    <TextField
      label="Select Date"
      type="date"
      value={date}
      name="start_date"
      onChange={(e) => { handleMembersChange(e); handleDateChange(e); }}
      fullWidth
      sx={{
        color: "white", // White text for the input
        "& .MuiInputBase-root": {
          color: "white", // Ensures text inside the input is white
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "white", // Border color
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "gray", // Hover border color
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "white", // Focused border color
        },
      }}
      InputProps={{
        style: { color: "white" }, // Sets text color
      }}
      InputLabelProps={{
        style: { color: "white" }, // Sets label color
      }}
    />
  );
};

export default DateInput;
