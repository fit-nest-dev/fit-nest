import React, { useContext, useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, InputLabel, Select, MenuItem, FormControl } from '@mui/material';
import axios from 'axios';
import { SocketContext } from '../../context/SocketContext';
import OrderDetailsDialog from './OrderDetailsDialog';
/**
 * The OrderDialogAdmin component renders a dialog box with a table of all orders.
 * The admin can view the order details and edit the status and delivery date of the order.
 * The component also handles the update of the order in the database.
 */
const OrderDialogAdmin = ({ open, onClose }) => {
  const [orders, setOrders] = useState([]); // State to hold the orders
  const [selectedOrder, setSelectedOrder] = useState(null); // State to track the selected order
  const [newDeliveryDate, setNewDeliveryDate] = useState(null); // State to track the new delivery date
  const [newStatus, setNewStatus] = useState(''); // State to track the new status
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState("");
  const [latestFilter, setLatestFilter] = useState('');

  /**
   * Handles the search query by updating the component state with the new search query.
   * This triggers a re-render of the component with the new search query.
   * @param {string} query The search query to search for in the order list.
   */
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  const handleClose = () => setOpenDialog(false);
  const handleOpen = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  }
  const { socket } = useContext(SocketContext);

  /**
   * Fetches all orders from the backend and updates the state with the received orders.
   * Used in the useEffect hook to fetch the orders when the component mounts and when the dialog is opened.
   */
  const fetchUserOrders = async () => {
    const response = await axios.post(`http://localhost:5000/api/Order/AllOrders`, {}, { withCredentials: true });
    setOrders(response.data.orders);
  };

  /* The useEffect hook below is used to reset the newDeliveryDate and newStatus when the dialog is opened*/
  useEffect(() => {
    setNewDeliveryDate(null);
    setNewStatus('');
  }, [open])
  /* The useEffect hook below is used to fetch the orders when the component mounts */
  useEffect(() => {
    fetchUserOrders();
  }, []);
  /* The useEffect hook below is used to listen to the OrderChanges event */
  useEffect(() => {
    socket.on('OrderChanges', (data) => {
      fetchUserOrders()
    })
  }, [socket])
  /**
   * Handles the change in the delivery date input field by updating the state with the new value.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input element
   */
  const handleDateChange = (e) => {
    setNewDeliveryDate(e.target.value);
  };
  /**
   * Handles the change in the status input field by updating the state with the new value.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input element
   */
  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };
  /**
   * Updates the delivery date of a specific order in the backend and updates the UI.
   * Sends a PUT request with the new delivery date to the server.
   * On success, updates the delivery date in the orders state and alerts the user.
   * Catches and logs any errors encountered during the process.
   * 
   * @param {string} orderId - The ID of the order to update.
   */
  const handleSubmitDate = (orderId) => {
    if (newDeliveryDate === null) return;
    if (window.confirm('Are you sure you want to update the delivery date of this order?')) {
      axios.put(`http://localhost:5000/api/Order/EditDeliveryTime/${orderId}`, { deliveryDate: newDeliveryDate, userName: selectedOrder.UserName, email: selectedOrder.UserEmail }
        , { withCredentials: true }
      )
        .then((response) => {
          alert('Delivery date updated successfully!');
          setOrders(orders.map(order =>
            order._id === response.data.message._id ? { ...order, deliveryDate: newDeliveryDate } : order
          ));
        })
        .catch((error) => {
          console.log('Error updating delivery date:', error);
          alert('Error updating delivery date');
        });
      setNewDeliveryDate(null);
    }
  };
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
  /**
   * Updates the status of a specific order in the backend and updates the UI.
   * Sends a PUT request with the new status to the server.
   * On success, updates the status in the orders state and alerts the user.
   * Catches and logs any errors encountered during the process.
   * 
   * @param {string} orderId - The ID of the order to update.
   */
  const handleSubmitStatus = (orderId) => {
    if (newStatus === "Delivered" || newStatus === "CANCELLED") return;
    if (window.confirm('Are you sure you want to update the status of this order?')) {
      axios
        .put(`http://localhost:5000/api/Order/EditStatus/${orderId}`, { status: newStatus, userName: selectedOrder.UserName, email: selectedOrder.UserEmail }, { withCredentials: true })
        .then((response) => {
          alert('Order status updated successfully!');
          setOrders(orders.map((order) =>
            order._id === response.data.message._id ? { ...order, status: newStatus } : order
          ));
        })
        .catch((error) => {
          console.error('Error updating status:', error);
          alert('Error updating status');
        });
      setNewStatus('');
    }
  };
  /**
   * Sets the selected order and new delivery date to the passed order.
   * Used when the user clicks the edit button next to the delivery date.
   * @param {object} order - The order object containing the delivery date.
   */

  const handleEditDeliveryDate = (order) => {
    setSelectedOrder(order);
    setNewDeliveryDate(order.deliveryDate);
  };
  /**
   * Sets the selected order and new status to the passed order.
   * Used when the user clicks the edit button next to the status.
   * @param {object} order - The order object containing the status.
   */
  const handleEditDeliveryStatus = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status)
  }
  return (
    // <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
    <div className='w-[110%] sm:ml-0'>

      <div style={{ backgroundColor: "#000", color: "#fff", fontWeight: "bold" }}>
        All Orders
      </div>
      <div className="relative w-full mb-4 bg-black">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by ORDER ID"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-72 md:w-96 border border-gray-600 rounded-full py-2 pl-10 pr-4 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 hover:border-gray-500 transition-all duration-300"
        />

        {/* Search Icon */}
        <i
          className="fa fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
      </div>
      <div className="flex flex-wrap gap-3 justify-between bg-black p-4">
  <div className="flex flex-col  mb-2 sm:flex-row sm:space-x-3 sm:space-y-0 sm:mb-0">
    <select
      value={filteredOrders}
      onChange={(e) => setFilteredOrders(e.target.value)}
      className="p-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-200"
      style={{ width: '100%', fontSize: '0.875rem' }}
    >
      <option value="">All Categories</option>
      <option value="SHIPPED">SHIPPED</option>
      <option value="Paid">PAID</option>
      <option value="CANCELLED">CANCELLED</option>
      <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
    </select>
  </div>
<OrderDetailsDialog open={openDialog} handleClose={handleClose} order={selectedOrder} />
  <div className="flex flex-col sm:flex-row sm:space-x-3 sm:space-y-0">
    
    <select
      value={latestFilter}
      onChange={(e) => setLatestFilter(e.target.value)}
      className="border p-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">DEFAULT</option>
      <option value="1DAY">LESS THAN 1 DAY</option>
      <option value="2DAY">LESS THAN 2 DAYS</option>
      <option value="3DAY">LESS THAN 3 DAYS</option>
      <option value="4DAY">LESS THAN 4 DAYS</option>
      <option value="5DAY">LESS THAN 5 DAYS</option>
    </select>
  </div>
</div>

      <div style={{ backgroundColor: "#000", color: "#fff" }}>
        <TableContainer component={Paper} style={{ backgroundColor: "#333" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ color: "#fff", fontWeight: "bold", backgroundColor: "black" }}>Order ID</TableCell>
                <TableCell style={{ color: "#fff", fontWeight: "bold", backgroundColor: "black" }}>View Details</TableCell>
                <TableCell style={{ color: "#fff", fontWeight: "bold", backgroundColor: "black" }}>Total Amount</TableCell>
                <TableCell style={{ color: "#fff", fontWeight: "bold", backgroundColor: "black" }}>Status</TableCell>
                <TableCell style={{ color: "#fff", fontWeight: "bold", backgroundColor: "black" }}>Delivery Date</TableCell>
                <TableCell style={{ color: "#fff", fontWeight: "bold", backgroundColor: "black" }}>Address</TableCell>
                <TableCell style={{ color: "#fff", fontWeight: "bold", backgroundColor: "black" }}>Edit Order Status</TableCell>
                <TableCell style={{ color: "#fff", fontWeight: "bold", backgroundColor: "black" }}>Edit Delivery Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {orders
    .filter((order) => {
      const matchesSearchQuery = order.orderId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filteredOrders === "" || order.status === filteredOrders;
      
      const createdAt = new Date(order.createdAt);
      const currentTime = new Date();
      let matchesLatestFilter = true;

      if (latestFilter === "1DAY") {
        matchesLatestFilter = currentTime - createdAt <= 1 * 24 * 60 * 60 * 1000;
      } else if (latestFilter === "2DAY") {
        matchesLatestFilter = currentTime - createdAt <= 2 * 24 * 60 * 60 * 1000;
      } else if (latestFilter === "3DAY") {
        matchesLatestFilter = currentTime - createdAt <= 3 * 24 * 60 * 60 * 1000;
      } else if (latestFilter === "4DAY") {
        matchesLatestFilter = currentTime - createdAt <= 4 * 24 * 60 * 60 * 1000;
      } else if (latestFilter === "5DAY") {
        matchesLatestFilter = currentTime - createdAt <= 5 * 24 * 60 * 60 * 1000;
      }

      return matchesSearchQuery && matchesCategory && matchesLatestFilter;
    })
    .sort((b, a) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((order) => (
      <TableRow key={order.orderId}>
        <TableCell style={{ color: "#fff" }}>
          {highlightQuery(order.orderId, searchQuery)}
        </TableCell>
        <TableCell>
          <Button variant="outlined" onClick={() => handleOpen(order)}>
            View Details
          </Button>
        </TableCell>
        <TableCell>{order.totalAmount}</TableCell>
        <TableCell>{order.status}</TableCell>
        <TableCell>{order.deliveryDate}</TableCell>
        <TableCell>{order.address}</TableCell>
        <TableCell>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleEditDeliveryStatus(order)}
          >
            Edit Status
          </Button>
        </TableCell>
        <TableCell>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleEditDeliveryDate(order)}
          >
            Edit Delivery Date
          </Button>
        </TableCell>
      </TableRow>
    ))}
</TableBody>

          </Table>
        </TableContainer>

        {selectedOrder && (
          <div style={{ marginTop: "20px", color: "#fff" }}>
            <h3>Edit Status for Order {selectedOrder.orderId}</h3>
            <FormControl variant="outlined" style={{ marginRight: "10px", minWidth: "200px", color: "#fff" }}>
              <InputLabel id="order-status-label" style={{ color: "#fff" }}>Edit Order Status</InputLabel>
              <Select
                labelId="order-status-label"
                value={newStatus}
                onChange={handleStatusChange}
                label="Edit Order Status"
                style={{ color: "#fff", backgroundColor: "#333" }}
              >
                <MenuItem value="ORDER PLACED">ORDER PLACED</MenuItem>
                <MenuItem value="OUT FOR DELIVERY">OUT FOR DELIVERY</MenuItem>
                <MenuItem value="SHIPPED">SHIPPED</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              style={{ backgroundColor: "#4caf50", color: "#fff", marginRight: "10px", marginTop: "10px" }}
              onClick={() => handleSubmitStatus(selectedOrder.orderId)}
            >
              Submit New Status
            </Button>
            <h3>Edit Delivery Date for Order {selectedOrder.orderId}</h3>
            <TextField
              label="Select Delivery Date"
              type="date"
              value={newDeliveryDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              style={{ marginRight: "10px", color: "#fff", backgroundColor: "#333" }}
            />
            <Button
              variant="contained"
              style={{ backgroundColor: "#4caf50", color: "#fff", marginTop: "10px" }}
              onClick={() => handleSubmitDate(selectedOrder.orderId)}
            >
              Submit New Date
            </Button>
          </div>
        )}
        {/* </DialogContent> */}</div>

      {/* </Dialog> */}
    </div>
  );
};

export default OrderDialogAdmin;
