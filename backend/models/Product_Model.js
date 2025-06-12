import mongoose from "mongoose";
// Model for the products, which stores the product name, product category, price, description, image_url, stock quantity, and whether it is available or not.
// The created_at and updated_at fields are automatically updated by mongoose.
const ProductSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  product_category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image_url: {
    type: [String],
    default: [
      ""
    ],
  },
  MRP: { type: Number },
  stock_quantity: { type: Number },
  locked_count: { type: Number, default: 0 },
  is_available: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});
const Product = mongoose.model('Product', ProductSchema);
export default Product;
