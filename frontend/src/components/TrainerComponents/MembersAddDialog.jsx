import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';  // Import xlsx library for Excel parsing
import axios from 'axios';
import toast from 'react-hot-toast';
import DateInput from './DateInput';
/**
 * A dialog to add new members to the database. The dialog contains a text field to upload an Excel file and a form to add members manually.
 * The form to add members manually includes fields for the member's name, email, mobile number, membership type, start date, end date and paid.
 * The dialog also contains a dropdown to select the day and a select to select the shift time.
 * The dialog is opened when the user clicks the "Add Member" button in the "Add Member" component.
 * The dialog is closed when the user clicks the "Cancel" button or when the user submits the form to add the members.
 * The dialog contains a button to add the members from the uploaded Excel file and a button to add the members manually.
 * The dialog also contains a text to show the number of members that have been added successfully.
 * The dialog is styled with a black background and white text.
 * The dialog is centered in the middle of the screen.
 * The dialog is opened in a new window.
 * @param {boolean} openDialog - Whether the dialog is open or not.
 * @param {function} setOpenDialog - A function to call to close the dialog.
 * @returns A JSX element containing the dialog to add members.
 */
const MembersAddDialog = ({ openDialog, setOpenDialog }) => {
  const [excelData, setExcelData] = useState([]);
  const [filename, setFileName] = useState('');
  const [MembersData, setMembersData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    membership_id:'',
    Membership_Type: 'Monthly',
    start_date: '',
    end_date: '',
    paid: '',
  });
  /**
   * Closes the dialog and resets the Excel data and filename state.
   */
  const handleDialogClose = () => {
    setOpenDialog(false);
    setExcelData([]);
    setFileName('');
  }

  /**
   * Adds members from the Excel data to the database.
   * Iterates over the excelData array and sends a POST request for each member
   * to add it to the database. If successful, it logs the response and refreshes
   * the member list. Closes the dialog after attempting to add all members.
   * Catches and logs any errors encountered during the process.
   */
  const handleAddFromExcel = async () => {
    try {
      for (let i = 0; i < excelData.length; i++) {
        const product = excelData[i];
        const { first_name, last_name, email, mobile_number, Membership_Type, membership_id, start_date, end_date } = product;
        const response = await axios.post('http://localhost:5000/api/Admin/Create-Member', {
          first_name,
          last_name,
          email,
          mobile_number,
          Membership_Type,
          start_date,
          end_date
        }, { withCredentials: true });

        if (response.data) {
          setOpenDialog(false);
        }
      }
    } catch (error) {
      console.error('Error adding products from Excel:', error);
    }
    setOpenDialog(false); // Close the dialog after adding products
  };
  /**
   * Handles the file upload event to read the Excel file and convert it to JSON data,
   * then saves the data in the state.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input element
   */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFileName(file.name);
    if (file) {
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
  const [date, setDate] = useState("");
  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    // You can add validation here to check if the date is in YYYY-MM-DD format
    setDate(inputDate);
  };
  /**
   * Adds a member to the database.
   * Sends a POST request to the server with the member data in the request body.
   * If successful, it logs the response and refreshes the member list. Closes
   * the dialog after attempting to add the member. Catches and logs any errors
   * encountered during the process.
   */
  const handleAddMembersManual = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/Admin/Create-Member', MembersData, { withCredentials: true });
      if (response.data) {
        setOpenDialog(false);
      }
      if (response.data.message === 'User already exists') {
        toast.error(response.data.error);
      }
      setOpenDialog(false); // Close the dialog after adding the product
    } catch (error) {
      console.error('Error adding Member:', error);
    }
  };
  /**
   * Updates the state of the member details form when an input field changes.
   * @param {React.ChangeEvent<HTMLInputElement>} event The event object from the input element.
   */
  const handleMembersChange = (event) => {
    const { name, value } = event.target;
    setMembersData((prevState) => ({
      ...prevState,
      [name]: value,
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
          backgroundColor: "#000", // Black background
          color: "#fff", // White text color
          padding: "20px", // Reduced padding
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", paddingBottom: "10px", color: "white" }}>
        Add Member(s)
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
          Upload excel in form of columns with name:
          [first_name, last_name, email, mobile_number, Membership_Type, membership_id,start_date, end_date]
        </div>
        {filename && (
          <div style={{ marginTop: "8px", color: "gray" }}>
            Uploaded file: {filename}
          </div>
        )}
        <div>
          <TextField
            label="First Name"
            fullWidth
            margin="normal"
            name="first_name"
            onChange={handleMembersChange}
            InputProps={{
              style: { color: "white" }, // Sets text color
            }}
            InputLabelProps={{
              style: { color: "white" }, // Sets label color
            }}
            sx={{
              backgroundColor: "black",
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
            label="Last Name"
            fullWidth
            margin="normal"
            name="last_name"
            onChange={handleMembersChange}
            InputProps={{
              style: { color: "white" }, // Sets text color
            }}
            InputLabelProps={{
              style: { color: "white" }, // Sets label color
            }}
            sx={{
              backgroundColor: "black",
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
            onChange={handleMembersChange}
            InputProps={{
              style: { color: "white" }, // Sets text color
            }}
            InputLabelProps={{
              style: { color: "white" }, // Sets label color
            }}
            sx={{
              backgroundColor: "black",
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
            label="Mobile Number"
            fullWidth
            margin="normal"
            name="mobile_number"
            onChange={handleMembersChange}
            InputProps={{
              style: { color: "white" }, // Sets text color
            }}
            InputLabelProps={{
              style: { color: "white" }, // Sets label color
            }}
            sx={{
              backgroundColor: "black",
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
            label="Membership ID"
            fullWidth
            margin="normal"
            name="membership_id"
            onChange={handleMembersChange}
            InputProps={{
              style: { color: "white" }, // Sets text color
            }}
            InputLabelProps={{
              style: { color: "white" }, // Sets label color
            }}
            sx={{
              backgroundColor: "black",
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
            label="Membership Type"
            fullWidth
            value={MembersData.Membership_Type}
            margin="normal"

            name="Membership_Type"
            onChange={(e) => { handleMembersChange(e); }}
            sx={{
              color: "white", // White text for the select field
              ".MuiSelect-select": {
                color: "white", // Ensures text inside the dropdown is white
              },
              ".MuiSvgIcon-root": {
                color: "white", // Ensures dropdown arrow icon is white
              },
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
            InputProps={{
              style: { color: "white" }, // Sets text color
            }}
            InputLabelProps={{
              style: { color: "white" }, // Sets label color
            }}

          >
            <MenuItem value="Monthly">Monthly</MenuItem>
            <MenuItem value="BiMonthly">BiMonthly</MenuItem>
            <MenuItem value="Quarterly">Quarterly</MenuItem>
            <MenuItem value="Quadrimester">Quadrimester</MenuItem>
            <MenuItem value="SemiAnnual">SemiAnnual</MenuItem>
            <MenuItem value="Annual">Annual</MenuItem>
          </Select>

          <TextField
            // label="Select Date"
            type="date"
            value={MembersData.start_date}
            name="start_date"
            onChange={(e) => { handleDateChange(e); handleMembersChange(e) }}
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


          <TextField
            label="Paid"
            fullWidth
            margin="normal"
            name="paid"
            onChange={handleMembersChange}
            InputProps={{
              style: { color: "white" }, // Sets text color
            }}
            InputLabelProps={{
              style: { color: "white" }, // Sets label color
            }}
            sx={{
              backgroundColor: "black",
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
          onClick={handleAddFromExcel}
          color="primary"
          variant="contained"
          sx={{
            backgroundColor: "green", // Green button color
            ":hover": {
              backgroundColor: "#388e3c", // Darker green on hover
            },
          }}
          disabled={!excelData || excelData.length === 0}
        >
          Add from Excel
        </Button>
        <Button
          onClick={handleAddMembersManual}
          color="primary"
          sx={{
            color: "white",
            backgroundColor: "green", // Green button color
            ":hover": {
              backgroundColor: "#388e3c", // Darker green on hover
            },
          }}
        >
          Add Manually
        </Button>
      </DialogActions>
    </Dialog>

  );
}

export default MembersAddDialog;
