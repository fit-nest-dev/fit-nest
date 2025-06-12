import Order from "../models/Order_Model.js";
import Product from "../models/Product_Model.js";
import { io } from "../socket/socket.js";
import dotenv from "dotenv"
dotenv.config()
const ChangeStreamForOrders = Order.watch();
const changeStream = Product.watch(); //change stream for products

ChangeStreamForOrders.on('change', async (change) => {
  io.emit('OrderChanges', change);
})
changeStream.on('change', async (change) => {
  io.emit('ProductChanges', change);
})

/**
 * Retrieves all products from the database.
 * Sends a GET request to fetch all product records.
 * If successful, returns the list of products in JSON format.
 * Logs any errors encountered and sends a 500 status code.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object used to send back the list of products or error message.
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Adds a product to the database.
 * Sends a POST request with the product data in the request body.
 * If the product already exists based on the product_name, it updates the stock_quantity.
 * If the product does not exist, it creates a new product.
 * If successful, returns the updated or created product in JSON format.
 * Logs any errors encountered and sends a 500 status code.
 * 
 * @param {Object} req - Express request object containing the product data in the request body.
 * @param {Object} res - Express response object used to send back the updated or created product or error message.
 */
export const AddProduct = async (req, res) => {
  try {
    // Destructure the product data from the request body
    const { product_name, product_category, price,MRP, description, stock_quantity, image_url } = req.body;

    // Check if the product already exists based on product_name
    const existingProduct = await Product.findOne({ product_name });

    if (existingProduct) {
      // If the product already exists, update the stock_quantity
      const updatedProduct = await Product.findOneAndUpdate(
        { product_name },
        { $inc: { stock_quantity: stock_quantity > 1 ? stock_quantity : 1 } },
        { new: true },
      );
      return res.status(200).json({ message: "Product stock updated", updatedProduct });
    } else {
      // If the product does not exist, create a new product
      const newProduct = new Product({
        product_name,
        product_category,
        price,
        image_url: image_url ? image_url : [],
        description,
        MRP,
        stock_quantity: stock_quantity > 1 ? stock_quantity : 1,
      });
      await newProduct.save();
      return res.status(200).json({ message: "New product created", newProduct });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getProductById = async (req, res) => {
  try {
    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/**
 * Increments the stock quantity of a product by one.
 * Sends a PUT request to the server with the product ID in the request URL.
 * If successful, it updates the product list with the new stock quantity.
 * If the server returns an error, it fetches the product list again.
 * Catches and logs any errors encountered during the process.
 * @param {string} id - The ID of the product to increment.
 */
export const incrementProduct = async (req, res) => {
  try {
    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    // Increment the stock quantity by 1
    product.stock_quantity += 1;
    await product.save(); // Save the updated product
    io.emit('ProductUpdates', product);
    res.status(200).json({ message: 'Product stock updated', updatedProduct: product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export const decrementProduct = async (req, res) => {
  try {
    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (product.stock_quantity <= 0) {
      return res.status(400).json({ error: "OUT OF STOCK" });
    }
    // Decrement the stock quantity by 1
    product.stock_quantity -= 1;
    await product.save(); // Save the updated product
    io.emit('ProductUpdates', product);
    res.status(200).json({ message: 'Product stock updated', updatedProduct: product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export const decrementProductforguest = async (req, res) => {
  try {
    const { cartItem } = req.body;
    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (product.stock_quantity <= 0) {
      return res.status(400).json({ error: "OUT OF STOCK" });
    }

    if (cartItem.cart.count > product.stock_quantity) {
      return res.status(400).json({
        error: `You cannot add more items of this product to your cart.`,
      });
    }
    // Increment the count if the product exists in the cart
    cartItem.cart.count += 1;
    // product.stock_quantity -= 1;
    await product.save(); // Save the updated product
    io.emit('ProductUpdates', product);
    res.status(200).json({ message: 'Product stock updated', updatedProduct: product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export const decrementProductforguestDescBox = async (req, res) => {
  try {
    const { cartItem, count } = req.body;
    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (product.stock_quantity <= 0) {
      return res.status(400).json({ error: "OUT OF STOCK" });
    }
    if (count > product.stock_quantity) {
      return res.status(400).json({
        error: `You cannot add more items of this product to your cart.`,
      });
    }
    // Increment the count if the product exists in the cart
    cartItem.cart.count += count;
    await product.save(); // Save the updated product
    io.emit('ProductUpdates', product);
    res.status(200).json({ message: 'Product stock updated', updatedProduct: product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/**
 * Deletes a product from the database.
 * Sends a DELETE request to the server with the product ID in the request URL.
 * If the product is found, it is removed from the database and a success message is returned.
 * If the product is not found, a 404 error message is returned.
 * Catches and logs any errors encountered during the process.
 * 
 * @param {Object} req - Express request object containing the product ID in the request URL.
 * @param {Object} res - Express response object used to send back a success message or error message.
 */
export const deleteProduct = async (req, res) => {
  try {
    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/**
 * Updates the details of a product in the database by its ID.
 * Sends a PUT request with the updated product data in the request body.
 * If the product is found, it updates the product details and returns a success message with the updated product.
 * If the product is not found, a 404 error message is returned.
 * Catches and logs any errors encountered during the process.
 * 
 * @param {Object} req - Express request object containing the product ID in the URL and updated data in the request body.
 * @param {Object} res - Express response object used to send back the success message or error message.
 */
export const UpdateProductById = async (req, res) => {
  try {
    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    // Update the product data
    product.product_name = req.body.product_name || product.product_name;
    product.product_category = req.body.product_category || product.product_category;
    product.price = req.body.price || product.price;
    product.description = req.body.description || product.description;
    product.stock_quantity = req.body.stock_quantity || product.stock_quantity;
    product.updated_at = new Date();
    product.image_url = req.body.image_url || product.image_url;
    product.MRP = req.body.MRP || product.MRP;
    await product.save(); // Save the updated product
    io.emit('ProductUpdates', product);
    res.status(200).json({ message: "Product updated successfully", updatedProduct: product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
