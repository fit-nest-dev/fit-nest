import mongoose from "mongoose";
// Model for the cart, which stores the products a user has in their cart, with the quantity of each product.
const cartItemSchema = new mongoose.Schema({
  UserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User owning the cart
  cart: {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // Product in the cart
    count: { type: Number, default: 1, min: 1 }, // Quantity of the product
  },
}, { timestamps: true }); // Automatically add createdAt and updatedAt timestamps

const Cart = mongoose.model('Cart', cartItemSchema);
export default Cart;
