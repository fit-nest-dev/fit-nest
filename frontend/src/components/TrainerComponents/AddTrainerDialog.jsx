import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';  // Import xlsx library for Excel parsing
import axios from 'axios';
import toast from 'react-hot-toast';
/**
 * A dialog to add new trainers to the database. The dialog contains a text field to upload an Excel file and a form to add trainers manually.
 * The form to add trainers manually includes fields for the trainer's name, contact details, email and salary.
 * The dialog also contains a dropdown to select the day and a select to select the shift time.
 * The dialog is opened when the user clicks the "Add Trainer" button in the "Add Trainer" component.
 * The dialog is closed when the user clicks the "Cancel" button or when the user submits the form to add the trainers.
 * The dialog contains a button to add the trainers from the uploaded Excel file and a button to add the trainers manually.
 * The dialog also contains a text to show the number of trainers that have been added successfully.
 * The dialog is styled with a black background and white text.
 * The dialog is centered in the middle of the screen.
 * The dialog is opened in a new window.
 */
const AddTrainerDialog = ({ fetchTrainers, openDialog, setOpenDialog }) => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedTime, setSelectedTime] = useState('9 AM - 9 PM');
  const [filename, setfilename] = useState('');
  const [TrainerData, setTrainerData] = useState({
    trainer_name: '',
    trainer_contact: '',
    email: '',
    salary: '',
    profile_picture: '',
  });
  const [excelData, setExcelData] = useState([]);
  /**
   * Closes the dialog and resets the state of the dialog.
   * The state of the dialog is reset by setting the openDialog state to false, the excelData state to an empty array, and the filename state to an empty string.
   */
  const handleDialogClose = () => {
    setOpenDialog(false)
    setExcelData([]);
    setfilename('');
  };
  /**
   * Adds trainers from the Excel data to the database.
   * Iterates over the excelData array and sends a POST request for each trainer
   * to add it to the database. If successful, it logs the response and refreshes
   * the trainer list. Closes the dialog after attempting to add all trainers.
   * Catches and logs any errors encountered during the process.
   */
  const handleAddFromExcel = async () => {
    if (window.confirm('Are you sure you want to add these trainers?')) {
      try {
        const addTrainerPromises = [];
        for (let i = 0; i < excelData.length; i++) {
          const product = excelData[i];
          const { trainer_name, trainer_contact, email, salary, profile_picture } = product;
          // Collect promises for each trainer addition
          addTrainerPromises.push(
            axios.post(
              'http://localhost:5000/api/Trainer/AddTrainer',
              { trainer_name, trainer_contact, email, salary, profile_picture },
              { withCredentials: true }
            )
          );
        }
        // Wait for all trainer addition requests to complete
        const responses = await Promise.all(addTrainerPromises);
        // Check if all responses are successful
        if (responses.every(response => response.status === 200)) {
          fetchTrainers(); // Refresh the trainer list once after all trainers are added
        }
        else {
          toast.error('Error adding trainers from Excel');
        }
      } catch (error) {
        console.error('Error adding trainers from Excel:', error);
      }
      setOpenDialog(false); // Close the dialog after adding trainers
    }
  };

  /**
   * Handles the file upload event to read the Excel file and convert it to JSON data,
   * then saves the data in the state.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input element
   */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setfilename(file.name);
      const reader = new FileReader();
      // When the file is loaded, convert it to a JSON object and save it in the state.
      // This function is called by the FileReader when the file is loaded.
      // It reads the file as a binary string, converts it to an Excel workbook using XLSX,
      // extracts the first sheet, converts it to a JSON object, and saves it in the state.
      reader.onload = () => {
        const binaryString = reader.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);  // Convert the sheet to JSON
        setExcelData(data);  // Save the data in the state
      };
      reader.readAsBinaryString(file);
    }
  };
  /**
   * Adds a trainer manually to the database.
   * Prompts the user for confirmation before sending a POST request with the trainer data.
   * If the request is successful, it fetches the updated list of trainers and closes the dialog.
   * Logs any errors encountered during the process.
   */
  const handleAddTrainersManual = async () => {
    if (window.confirm('Are you sure you want to add this trainer?')) {
      try {
        const response = await axios.post('http://localhost:5000/api/Trainer/AddTrainer', TrainerData, { withCredentials: true });
        if (response.data) {
          fetchTrainers();
        }

        setOpenDialog(false); // Close the dialog after adding the product
      } catch (error) {
        console.error('Error adding product:', error);
      }
    }
  };
  /**
   * Handles changes to the trainer data form. When the user types in the
   * form, it updates the TrainerData state with the new values.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The event object from the input element
   */
  const handleTrainerChange = (event) => {
    const { name, value } = event.target;
    setTrainerData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  /**
   * Handles changes to the day in the shift form. When the user selects a new day from the dropdown, it updates the TrainerData state with the new day and time.
   * @param {React.ChangeEvent<HTMLSelectElement>} event - The event object from the select element
   */
  const handleDayChange = (event) => {
    const newDay = event.target.value;
    setSelectedDay(newDay);

    // Update the shift in TrainerData
    setTrainerData((prevState) => ({
      ...prevState,
      shift: [{ day: newDay, time: selectedTime }],
    }));
  };

  /**
   * Handles changes to the time in the shift form. When the user selects a new time from the dropdown, it updates the TrainerData state with the new time.
   * @param {React.ChangeEvent<HTMLSelectElement>} event - The event object from the select element
   */
  const handleTimeChange = (event) => {
    const newTime = event.target.value;
    setSelectedTime(newTime);

    // Update the shift in TrainerData
    setTrainerData((prevState) => ({
      ...prevState,
      shift: [{ day: selectedDay, time: newTime }],
    }));
  };
  return (
    <Dialog
      open={openDialog}
      onClose={handleDialogClose}
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "#000",
          color: "#fff",
          padding: "20px",
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", paddingBottom: "10px", color: "white" }}>
        Add Trainer(s)
      </DialogTitle>
      <DialogContent>
        <Button
          variant="outlined"
          component="label"
          sx={{ marginBottom: "16px", color: "#fff", borderColor: "#fff" }}
        >
          Upload Excel
          <input
            type="file"
            hidden
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
        </Button>
        <div style={{ color: "#fff" }}>
          Upload the excel file having columns in form of: [trainer_name, trainer_contact, email, salary]
        </div>
        {excelData && excelData.length > 0 && (
          <div style={{ marginTop: "8px", fontStyle: "italic", color: "gray" }}>
            File loaded successfully: {excelData.length} trainers ready to upload.
          </div>
        )}
        {filename && (
          <div style={{ marginTop: "8px", fontStyle: "italic", color: "gray" }}>
            Selected file: {filename}
          </div>
        )}
        <div>
          <TextField
            label="Trainer Name"
            fullWidth
            margin="normal"
            name="trainer_name"
            onChange={handleTrainerChange}
            InputProps={{
              style: { color: "white" }, // Sets text color
            }}
            InputLabelProps={{
              style: { color: "white" }, // Sets label color
            }}
            sx={{
              backgroundColor: "black", // Sets background color
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white", // Border color
                },
                "&:hover fieldset": {
                  borderColor: "gray", // Hover border color
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white", // Focused border color
                },
              },
            }}
          />
          <TextField
            label="Trainer Contact"
            fullWidth
            margin="normal"
            name="trainer_contact"
            onChange={handleTrainerChange}
            InputProps={{
              style: { color: "white" }, // Sets text color
            }}
            InputLabelProps={{
              style: { color: "white" }, // Sets label color
            }}
            sx={{
              backgroundColor: "black", // Sets background color
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white", // Border color
                },
                "&:hover fieldset": {
                  borderColor: "gray", // Hover border color
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white", // Focused border color
                },
              },
            }}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            name="email"
            onChange={handleTrainerChange}
            InputProps={{
              style: { color: "white" }, // Sets text color
            }}
            InputLabelProps={{
              style: { color: "white" }, // Sets label color
            }}
            sx={{
              backgroundColor: "black", // Sets background color
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white", // Border color
                },
                "&:hover fieldset": {
                  borderColor: "gray", // Hover border color
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white", // Focused border color
                },
              },
            }}
          />
          <TextField
            label="Salary"
            fullWidth
            margin="normal"
            name="salary"
            onChange={handleTrainerChange}
            InputProps={{
              style: { color: "white" }, // Sets text color
            }}
            InputLabelProps={{
              style: { color: "white" }, // Sets label color
            }}
            sx={{
              backgroundColor: "black", // Sets background color
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white", // Border color
                },
                "&:hover fieldset": {
                  borderColor: "gray", // Hover border color
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white", // Focused border color
                },
              },
            }}
          />
          <Select
            value={selectedDay}
            onChange={handleDayChange}
            fullWidth
            sx={{
              backgroundColor: "black", // Background for the Select
              color: "white", // Text color
              "& .MuiSelect-icon": {
                color: "white", // Arrow icon color
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "white", // Border color
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "gray", // Border color on hover
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "white", // Border color on focus
              },
              "& .MuiMenu-paper": {
                backgroundColor: "black", // Dropdown menu background
                color: "white", // Dropdown text color
              },
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
            style={{ marginTop: "10px" }}
            onChange={handleTimeChange}
            fullWidth
            sx={{
              backgroundColor: "black", // Background for the Select
              color: "white", // Text color
              "& .MuiSelect-icon": {
                color: "white", // Arrow icon color
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "white", // Border color
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "gray", // Border color on hover
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "white", // Border color on focus
              },
              "& .MuiMenu-paper": {
                backgroundColor: "black", // Dropdown menu background
                color: "white", // Dropdown text color
              },
            }}
          >
            <MenuItem value="9 AM - 5 PM">9 AM - 5 PM</MenuItem>
            <MenuItem value="9 AM - 6 PM">9 AM - 6 PM</MenuItem>
            <MenuItem value="9 AM - 7 PM">9 AM - 7 PM</MenuItem>
            <MenuItem value="9 AM - 8 PM">9 AM - 8 PM</MenuItem>
            <MenuItem value="9 AM - 9 PM">9 AM - 9 PM</MenuItem>
          </Select>

          <TextField
            label="Profile_Pic_link"
            fullWidth
            margin="normal"
            name="profile_picture"
            onChange={handleTrainerChange}
            InputProps={{
              style: { color: "white" }, // Sets text color
            }}
            InputLabelProps={{
              style: { color: "white" }, // Sets label color
            }}
            sx={{
              backgroundColor: "black", // Sets background color
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white", // Border color
                },
                "&:hover fieldset": {
                  borderColor: "gray", // Hover border color
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white", // Focused border color
                },
              },
            }}
          />
        </div>
      </DialogContent>
      <DialogActions sx={{ paddingTop: "10px" }}>
        <Button
          onClick={handleDialogClose}
          color="secondary"
          sx={{
            color: "#fff",
            borderColor: "#fff",
            ":hover": {
              borderColor: "#ccc",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddFromExcel}
          color="primary"
          variant="contained"
          sx={{
            backgroundColor: "green",
            ":hover": {
              backgroundColor: "#388e3c",
            },
          }}
          disabled={!excelData || excelData.length === 0}
        >
          Add from Excel
        </Button>
        <Button
          onClick={handleAddTrainersManual}
          color="primary"
          sx={{
            color: "white",
            backgroundColor: "green",
            ":hover": {
              backgroundColor: "#388e3c",
            },
          }}
        >
          Add Manually
        </Button>
      </DialogActions>
    </Dialog>

  );
};

export default AddTrainerDialog;
