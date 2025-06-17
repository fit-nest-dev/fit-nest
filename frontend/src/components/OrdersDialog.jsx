import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, List, ListItem, ListItemText, TextField, Typography, Fade } from '@mui/material';
import axios from 'axios';
import { SocketContext } from '../context/SocketContext';
/**
 * The OrdersDialog component is a dialog that displays all the orders of a user.
 * It fetches all the orders of the user when the component mounts and displays them
 * in a list. The user can edit the address of an order by clicking on the edit
 * button. The component also listens for 'OrderChanges' event from the server and
 * updates the orders when it receives the event.
 *
 * @param {boolean} open - Whether the dialog is open or not.
 * @param {function} onClose - Callback function to call when the dialog is closed.
 * @param {string} userId - The ID of the user whose orders are to be displayed.
 */
const OrdersDialog = ({ open, onClose, userId }) => {
  const [orders, setOrders] = useState([]); // State to hold the orders
  const [editingOrderId, setEditingOrderId] = useState(null); // State to track the order being edited
  const [updatedAddress, setUpdatedAddress] = useState('');// State to hold the updated address
  const { socket } = useContext(SocketContext); // Access the socket context
  //The function below Fetches all the Orders of all the users which the user can
  useEffect(() => {
    setEditingOrderId(null);
  }, [open])
  /**
   * Fetches all orders for a given user ID.
   * 
   * This function sends a POST request to the server to retrieve all orders
   * associated with the provided user ID. The response data containing the 
   * orders is returned.
   * 
   * @param {string} userId - The ID of the user whose orders are to be fetched.
   * @returns {Promise<Array>} A promise that resolves to an array of orders.
   */
  const fetchUserOrders = async (userId) => {
    const response = await axios.post(`http://3.25.86.182:5000/api/Order/GetAllOrders/${userId}`, {}, { withCredentials: true });
    return response.data;
  };
  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const response = await axios.put(`http://3.25.86.182:5000/api/Order/CancelOrder/${orderId}`, {}, { withCredentials: true });
        if (response.data.message) {
          setOrders((prevOrders) =>
            prevOrders.filter((order) => order.orderId !== orderId)
          );
          alert('Order cancelled successfully!');
        }
      }
      catch (error) {
        console.log(error)
      }
    }
  }
  /**
   * Updates the address of an order in the database.
   * Sends a PUT request to the server with the updated address and order ID.
   * If successful, it updates the orders state with the new address and
   * resets the editingOrderId and updatedAddress states.
   * It also alerts the user of the success or failure of the update.
   * Catches and logs any errors encountered during the process.
   * @param {string} orderId - The ID of the order to update.
   */
  const handleAddressUpdate = async (orderId) => {
    try {
      const response = await axios.put(`http://3.25.86.182:5000/api/Order/UpdateOrderAddress/${orderId}`, {
        address: updatedAddress,
      }, { withCredentials: true });
      if (response.data.message) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === response.data.message._id ? { ...order, address: updatedAddress } : order
          )
        );
        setEditingOrderId(null);
        setUpdatedAddress('');
        alert('Address updated successfully!');
      } else {
        alert('Failed to update address.');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      alert('An error occurred while updating the address.');
    }
  };
  // The function below is used to update the status of the order in the Backend and then UPDATE it to UI
  useEffect(() => {
    socket.on('OrderChanges', (data) => {
      fetchUserOrders(userId)
        .then((d) => setOrders(d))
        .catch((err) => console.error('Error fetching orders:', err));
    });

    return () => socket.off('OrderChanges');
  }, [socket]);
  // The useEffect hook below is used to fetch the orders when the component mounts
  useEffect(() => {
    if (open) {
      fetchUserOrders(userId)
        .then((data) => setOrders(data))
        .catch((err) => console.error('Error fetching orders:', err));
    }
  }, [open, userId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{ backdropFilter: 'blur(4px)' }}>
      <DialogTitle sx={{ color: 'white', fontWeight: 'bold', backgroundColor: 'black' }}>
        User Orders
      </DialogTitle>
      <DialogContent sx={{ color: 'white', backgroundColor: 'black' }}>
        {orders?.length === 0 ? (
          <Typography variant="body1" color="textSecondary">
            You have no orders yet.
          </Typography>
        ) : (
          <List>
            {orders?.map((order) => (
              <Fade in={open} timeout={500} key={order.orderId}>
                <ListItem sx={{ borderBottom: '1px solid white', padding: '15px 0' }}>
                  <ListItemText
                    primary={`Order ID: ${order.orderId}`}
                    secondary={`Total: ₹${order.totalAmount} | Status: ${order.status === 'CANCELLED' ? 'Cancelled, refund initiated' : order.status}`}
                    sx={{ color: 'white' }}
                  />
                  <ListItemText className='ml-10'
                    primary={`${order.status === 'CANCELLED' ? '' : 'Delivery Time'} ${order.status === 'CANCELLED' ? 'CANCELLED' : order.deliveryDate}`}
                    secondary={`Payment ID: ${order.paymentId}`}
                    sx={{ color: 'white' }}
                  />
                  <ListItemText className='ml-3'
                    primary={order.updatedAt !== order.createdAt && order.status != 'CANCELLED' && 'Updated Delivery Time'}
                    secondary={`Order Placed At: ${order.createdAt}`}
                    sx={{ color: 'white' }}
                  />
                  {/* Render the edit form if the order is being edited */}
                  {editingOrderId === order.orderId ? (
                    <>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="New Address"
                        value={updatedAddress}
                        onChange={(e) => setUpdatedAddress(e.target.value)}
                        sx={{
                          backgroundColor: 'white',
                          '& .MuiInputBase-root': {
                            color: 'black',
                          },
                          marginBottom: '10px',
                        }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAddressUpdate(order.orderId)}
                        sx={{
                          marginTop: '10px',
                          backgroundColor: 'white',
                          color: 'black',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                          },
                        }}                    >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setEditingOrderId(null)}
                        sx={{
                          marginTop: '10px',
                          backgroundColor: 'white',
                          color: 'black',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                          },
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <ListItemText primary={`Address: ${order.address}`} sx={{ color: 'white' }} />
                      <Button
                        variant="outlined"
                        color="secondary"
                        disabled={order.status === 'CANCELLED'}
                        onClick={() => {
                          setEditingOrderId(order.orderId);// Set the order being edited
                          setUpdatedAddress(order.address); // Prefill with current address
                        }}
                        sx={{
                          borderColor: 'white',
                          color: 'white',
                          '&:hover': { borderColor: '#f5f5f5', color: '#f5f5f5' },
                          gap: 2,
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        disabled={order.status === 'CANCELLED'}
                        onClick={() => {
                          handleCancelOrder(order.orderId);
                        }}
                        sx={{
                          borderColor: 'white',
                          color: 'red',
                          '&:hover': { borderColor: '#f5f5f5', color: '#f5f5f5' },
                        }}
                      >
                        Cancel Order
                      </Button>
                    </>
                  )}
                </ListItem>
              </Fade>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ backgroundColor: 'black' }}>
        <Button onClick={onClose} color="secondary" sx={{ color: 'white' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default OrdersDialog;
