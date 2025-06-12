import mongoose from "mongoose";
/**
 * Model for storing orders in the database
 * Each order contains information about the products ordered, the user who made the order,
 * the date the order was placed, and the status of the order.
 * The status field is used to track whether the order is pending, in progress, or completed.
 * The date field is used to store the date the order was placed.
 * The products field is an array of products ordered, with each product having a productId, productName, and quantity.
 * The AuthUserId, UserName, UserEmail, and UserContact fields are used to store information about the user who made the order.
 */
const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  AuthUserId: { type: String, required: true },
  UserName: { type: String, required: true },
  UserEmail: { type: String, required: true },
  UserContact: { type: String, required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  refundDetails: {
    amount: { type: Number },
    reason: { type: String },
    date: { type: Date },
  },
  paymentId: { type: String },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  deliveryDate: { type: Date, default: Date.now + 7 * 24 * 60 * 60 * 1000 },
  address: { type: String },
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
export default Order;