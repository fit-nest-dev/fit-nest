import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, TextField } from '@mui/material'
import React, { useContext, useState } from 'react'
import axios from 'axios'
import { SocketContext } from '../../context/SocketContext';

/**
 * The ResourceAddDialog component renders a dialog box with a form to add a new resource.
 * The form includes fields for the resource link, title, and type.
 * When the user submits the form, the component sends a POST request to the server to add the new resource.
 * If the server responds with a 201 status code, the component updates the resources state with the new resource.
 * If the server responds with an error, the component shows an error message to the user.
 * The component also listens for 'gym-resources' event from the server and updates the resources state when it receives the event.
 * @param {boolean} open - Whether the dialog is open or not.
 * @param {function} onClose - Callback function to call when the dialog is closed.
 * @param {function} setResources - Function to update the resources state.
 * @param {function} fetchResources - Function to fetch all resources from the server.
 * @param {object[]} resources - The resources to display in the dialog.
 */
const ResourceAddDialog = ({ open, onClose, setResources, fetchResources, resources }) => {
  const [resource, setResource] = useState({
    resourceLink: '',
    resourceType: '',
    title: '',
  });
  const { socket } = useContext(SocketContext);
  const [loading, setLoading] = useState(false); // Add loading state for API request

  /**
   * Handles the change event of the form fields and updates the resource state
   * accordingly.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input element.
   */
  const handleOnChangeData = (e) => {
    setResource({
      ...resource,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Handles the submission of the add resource form.
   * If the form fields are valid, sends a POST request to the server to add the new resource.
   * If the server responds with a 201 status code, updates the resources state with the new resource.
   * If the server responds with an error, shows an error message to the user.
   * Listens for 'gym-resources' event from the server and updates the resources state when it receives the event.
   */
  const handleAddResource = async () => {
    if (!resource.resourceLink || !resource.resourceType || !resource.title) return;

    if (window.confirm('Are you sure you want to add this resource?')) {
      setLoading(true); // Show loading indicator
      try {
        const response = await axios.post(`http://3.25.86.182:5000/api/Admin/AddNewResource`, resource, { withCredentials: true });
        console.log(response);
        if (response.status === 200) {  // Expecting 201 status code for created resource
          setResources((prevResources) => [...prevResources, response.data]);
          const updatedResources = [...resources, response.data];
          localStorage.setItem('gym-resources', JSON.stringify(updatedResources));
          socket.emit('gym-resources', updatedResources);
          onClose();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // Hide loading indicator
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
        marginBottom: "20px",
        "& .MuiDialog-paper": {
          backgroundColor: "#000",
          color: "#fff",
          padding: "20px",
          borderRadius: "8px",
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", paddingBottom: "10px", color: "white", fontWeight: 'bold' }}>
        ADD RESOURCE TO WEBSITE
      </DialogTitle>
      <DialogContent>
        <TextField
          name="resourceLink"
          label="Resource Link"
          value={resource.resourceLink}
          onChange={handleOnChangeData}
          fullWidth
          required
          sx={{
            marginBottom: "20px",
            input: {
              color: "black",
              backgroundColor: "white",
            },
            label: {
              color: "#aaa",
            },
            margin: "dense",

          }}
        />
        <TextField
          name="title"
          label="Title"
          value={resource.title}
          onChange={handleOnChangeData}
          fullWidth
          required
          sx={{
            marginBottom: "20px",
            input: {
              color: "black",
              backgroundColor: "white",
            },
            label: {
              color: "#aaa",
            },
            margin: "dense",

          }}
        />
        <Select
          name="resourceType"
          value={resource.resourceType}
          label="Resource Type"
          onChange={handleOnChangeData}
          fullWidth
          required
          sx={{
            backgroundColor: "white",
            color: "black",

            label: {
              color: "#aaa",
            },
          }}
        >
          <MenuItem value="Video">Video</MenuItem>
          <MenuItem value="Image">Image</MenuItem>
          <MenuItem value="PDF">PDF</MenuItem>
        </Select>
      </DialogContent>
      <DialogActions sx={{ paddingTop: "10px" }}>
        <Button
          onClick={handleAddResource}
          color="primary"
          variant="contained"
          sx={{
            backgroundColor: "green",
            ":hover": {
              backgroundColor: "#388e3c",
            },
            borderRadius: "8px",
            padding: "8px 20px",
          }}
          disabled={loading}
        >
          Add
        </Button>
        <Button
          onClick={onClose}
          color="secondary"
          sx={{
            color: "#fff",
            borderColor: "#fff",
            ":hover": {
              borderColor: "#ccc",
            },
            borderRadius: "8px",
            padding: "8px 20px",
          }}
          disabled={loading}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>


  );
};

export default ResourceAddDialog;
