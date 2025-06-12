import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box } from '@mui/material';

/**
 * A dialog component to display the details of an order.
 *
 * @param {boolean} open - Whether the dialog is open or not.
 * @param {function} handleClose - A function to call when the dialog is closed.
 * @param {object} order - The order object whose details are to be displayed.
 */

const OrderDetailsDialog = ({ open, handleClose, order }) => {
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <Box sx={{ backgroundColor: "#000", color: "#fff", padding: "20px" }}>
        <DialogTitle
          sx={{
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            borderBottom: "1px solid #4caf50",
            marginBottom: "20px",
          }}
        >
          Order Details
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ marginBottom: "10px" }}>
            <strong>Order ID:</strong> {order?.orderId}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: "10px" }}>
            <strong>User ID:</strong> {order?.AuthUserId}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: "10px" }}>
            <strong>UserName:{order?.UserName} </strong>
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: "10px" }}>
            <strong>UserContact:{order?.UserContact} </strong>
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: "10px" }}>
            <strong>UserEmail:{order?.UserEmail} </strong>
          </Typography>

          <Typography variant="subtitle1" sx={{ marginBottom: "10px" }}>
            <strong>Total Amount:</strong> ₹{order?.totalAmount}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: "10px" }}>
            <strong>Payment Status:</strong> {order?.status}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: "10px" }}>
            <strong>Payment Mode:</strong> {order?.paymentMode}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: "10px" }}>
            <strong>Delivery Address:</strong> {order?.address}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: "10px" }}>
            <strong>Order Date:</strong> {new Date(order?.createdAt).toLocaleString()}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: "10px" }}>
            <strong>Delivery Date:</strong> {new Date(order?.deliveryDate).toLocaleDateString()}
          </Typography>

          <TableContainer
            sx={{
              marginTop: "20px",
              backgroundColor: "#000",
              borderRadius: "8px",
              border: "1px solid #4caf50",
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#111" }}>
                    Product ID
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#111" }}>
                    Product Name
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#111" }}>
                    Quantity
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#111" }}>
                    Price (₹)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order?.products?.map((product) => (
                  <TableRow
                    key={product._id}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#111" },
                      "&:nth-of-type(even)": { backgroundColor: "#222" },
                    }}
                  >
                    <TableCell sx={{ color: "#fff" }}>{product?.productId}</TableCell>
                    <TableCell sx={{ color: "#fff" }}>{product?.productName}</TableCell>
                    <TableCell sx={{ color: "#fff" }}>{product?.quantity}</TableCell>
                    <TableCell sx={{ color: "#fff" }}>{product?.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", paddingTop: "20px" }}>
          <Button
            onClick={handleClose}
            sx={{
              backgroundColor: "#4caf50",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#388e3c",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default OrderDetailsDialog;
