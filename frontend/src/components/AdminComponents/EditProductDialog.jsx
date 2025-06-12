import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Button,
} from "@mui/material";
import { FaPlus, FaTrash } from "react-icons/fa";
import axios from "axios";
/**
 * EditProductDialog component allows Admins to edit product details.
 * 
 * This component displays a dialog with fields for editing the product's 
 * name, category, price, description, image URL, stock quantity, availability, 
 * and discount details. It initializes the form with the current product data 
 * and updates the parent state and backend upon saving.
 * 
 * @param {boolean} open - Determines whether the dialog is open.
 * @param {function} onClose - Callback function to handle closing the dialog.
 * @param {Object} product - The product object containing details to be edited.
 * @param {function} onUpdate - Callback function to update the product in the parent state.
 */
const EditProductDialog = ({ open, onClose, product, onUpdate }) => {
  const [formData, setFormData] = useState({
    product_name: product?.product_name || "", // product name
    product_category: product?.product_category || "", // product category
    price: product?.price || "", // product price
    description: product?.description || "",// product description
    image_url: product?.image_url || [], // product image
    stock_quantity: product?.stock_quantity || "",// product stock quantity
    is_available: product?.is_available || false, // product availability
    MRP: product?.MRP || "", // product MRP
  });
  /**
   * Updates the formData state with the values from the input fields.
   *
   * This function is called when an input field changes. It retrieves the
   * name and value of the changed input from the event object and updates
   * the corresponding property in the formData state.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input element.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Sends an API request to update the product details and handles the response.
   *
   * This function attempts to save the updated product data by making a PUT request
   * to the server with the provided `formData`. If the server responds with a success
   * message indicating that the product was updated successfully, it updates the product
   * in the parent component's state using the `onUpdate` callback and closes the dialog
   * using the `onClose` callback. If there's an error in the response or during the request,
   * it logs an error message to the console.
   */
  const handleSave = async () => {
    try {
      // make API call
      const response = await axios.put(
        `http://localhost:5000/api/products/UpdateProduct/${product._id}`,
        formData, { withCredentials: true }
      );
      // if success update the product
      if (response.data.message === "Product updated successfully") {
        onUpdate(product._id, formData); // Update the product in the parent state
        onClose(); // Close the dialog
      } else {
        // handle errors
        console.error("Error updating product:", response.data.error);
      }
      // handle errors
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };
  const handleImageChange = (index, value) => {
    const updatedImages = [...formData.image_url];
    if (value === null) {
      updatedImages.splice(index, 1); // Remove the image URL
    } else {
      updatedImages[index] = value; // Update the specific image URL
    }
    setFormData({ ...formData, image_url: updatedImages });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle style={{ backgroundColor: "#000", color: "#fff" }}>
        Edit Product
      </DialogTitle>
      <DialogContent style={{ backgroundColor: "#000", color: "#fff" }}>
        {/* Product Name */}
        <TextField
          margin="dense"
          label="Product Name"
          name="product_name"
          value={formData.product_name}
          onChange={handleInputChange}
          fullWidth
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

        {/* Product Category */}
        <TextField
          margin="dense"
          label="Product Category"
          name="product_category"
          value={formData.product_category}
          onChange={handleInputChange}
          fullWidth
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

        {/* Product Price */}
        <TextField
          margin="dense"
          label="Price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleInputChange}
          fullWidth
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
          margin="dense"
          label="MRP"
          name="MRP"
          type="number"
          value={formData.MRP}
          onChange={handleInputChange}
          fullWidth
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
          margin="dense"
          label="Stock Quantity"
          name="stock_quantity"
          type="number"
          value={formData.stock_quantity}
          onChange={handleInputChange}
          fullWidth
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

        {/* Product Description */}
        <TextField
          margin="dense"
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          fullWidth
          multiline
          rows={3}
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

        {/* Image URLs */}
        <div style={{ marginTop: "1rem", color: "#fff" }}>
          <h4>Image URLs</h4>
          {formData.image_url.map((url, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <TextField
                value={url}
                onChange={(e) => handleImageChange(index, e.target.value)}
                fullWidth
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
                style={{ marginRight: "0.5rem" }}
              />
              <IconButton
                onClick={() => handleImageChange(index, null)} // Remove image URL
                style={{ color: "#fff" }}
              >
                <FaTrash />
              </IconButton>
            </div>
          ))}
          <Button
            onClick={() => handleImageChange(formData.image_url.length, "")} // Add a new empty URL
            startIcon={<FaPlus />}
            style={{ color: "#fff", borderColor: "#fff", marginTop: "0.5rem" }}
            variant="outlined"
          >
            Add Image
          </Button>
        </div>
      </DialogContent>
      <DialogActions style={{ backgroundColor: "#000" }}>
        <Button onClick={onClose} style={{ color: "#fff" }}>
          Cancel
        </Button>
        <Button onClick={handleSave} style={{ color: "#fff" }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProductDialog;