import Cart from "../models/Cart_Model.js";
import Product from "../models/Product_Model.js";
import { io } from "../socket/socket.js";


/**
 * Adds a product to the user's cart from local storage.
 * Finds the product by ID and checks if it exists.
 * If the product is found, it looks for an existing cart entry for the user and product.
 * If an entry exists, increments the product count in the cart.
 * If no entry exists, creates a new cart item with a count of 1.
 * Saves the updated cart item and product to the database.
 * Emits updates via Socket.IO for both the product and cart.
 * Sends a response indicating the successful addition of the product to the cart.
 *
 * @param {object} req - The request object containing parameters for ProductId and AuthUserId.
 * @param {object} res - The response object used to send back the HTTP response.
 */


export const AddProductToCartFromLocalStorage = async (req, res) => {
  try {
    const { ProductId, AuthUserId } = req.params;
    // Find the product by ID
    const product = await Product.findById(ProductId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    // Find the cart entry for the user and product
    let cartItem = await Cart.findOne({ UserId: AuthUserId, "cart.product": ProductId });
    if (cartItem) {
      // Increment the count if the product already exists in the cart
      cartItem.cart.count += 1;
    } else {
      // Create a new cart item if the product is not already in the cart
      cartItem = new Cart({
        UserId: AuthUserId,
        cart: { product: ProductId, count: 1 },
      });
    }
    // Save updates
    await cartItem.save();
    await product.save();
    // Emit product updates via Socket.IO
    io.emit('ProductUpdates', product);
    io.emit('CartUpdates', cartItem);
    res.status(200).json({ message: "Product added to cart successfully", cartItem });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}

export const validateCartStock = async (req, res) => {
  try {
    const { cartItems } = req.body; // Expecting the array of cart items in the request body

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "No cart items provided." });
    }

    const outOfStock = [];

    // Loop through each item in the cartItems array
    for (const item of cartItems) {
      const { product, count } = item.cart; // Extract product ID and count from the cart object

      const productDetails = await Product.findById(product); // Fetch product details from the database
      if (!productDetails) {
        outOfStock.push({
          productId: product,
          message: "Product not found.",
        });
      } else if (productDetails.stock_quantity < count) {
        outOfStock.push({
          productId: product,
          productName: productDetails.name, // Assuming your Product schema has a `name` field
          availableStock: productDetails.stock_quantity,
          requestedCount: count,
          message: "Insufficient stock.",
        });
      }
    }

    // If any products are out of stock, return the error response
    if (outOfStock.length > 0) {
      return res.status(400).json({
        error: "Some products are out of stock.",
        outOfStock,
      });
    }

    // If all products are in stock
    return res.status(200).json({ message: "All products are in stock." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while validating the cart." });
  }
};
/**
 * Adds a product to the user's cart.
 * Checks if the product is out of stock.
 * If the product is not out of stock, it finds the cart entry for the user and product.
 * If the cart entry already exists, it increments the count.
 * If the cart entry does not exist, it creates a new cart item.
 * It then decrements the product's stock quantity and saves the changes. Finally,
 * it emits updates via Socket.IO and sends a response indicating the successful addition of the
 * product to the cart.
 *
 * @param {object} req - The request object containing parameters for ProductId and AuthUserId.
 * @param {object} res - The response object used to send back the HTTP response.
 */
export const AddProductToCart = async (req, res) => {
  try {
    const { ProductId, AuthUserId } = req.params;

    // Find the product by ID
    const product = await Product.findById(ProductId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if the product is out of stock
    if (product.stock_quantity <= 0) {
      return res.status(400).json({ error: "No product available" });
    }

    // Find the cart entry for the user and product
    let cartItem = await Cart.findOne({ UserId: AuthUserId, "cart.product": ProductId });

    if (cartItem) {
      // Ensure the total count in the cart does not exceed stock_quantity
      if (cartItem.cart.count >= product.stock_quantity) {
        return res.status(400).json({
          error: `You cannot add more items of this product to your cart.`,
        });
      }
      // Increment the count if the product exists in the cart
      cartItem.cart.count += 1;
    } else {
      // Create a new cart item if the product is not already in the cart
      cartItem = new Cart({
        UserId: AuthUserId,
        cart: { product: ProductId, count: 1 },
      });
    }

    // Save updates
    await cartItem.save();
    await product.save();

    // Emit product updates via Socket.IO
    io.emit('ProductUpdates', product);
    io.emit('CartUpdates', cartItem);

    res.status(200).json({ message: "Product added to cart successfully", cartItem });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
export const AddProductToCartDescBox = async (req, res) => {
  try {
    const { ProductId, AuthUserId } = req.params;
    const { count } = req.body;
    // Find the product by ID
    const product = await Product.findById(ProductId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    // Check if the product is out of stock
    if (product.stock_quantity <= 0) {
      return res.status(400).json({ error: "No product available" });
    }
    // Find the cart entry for the user and product
    let cartItem = await Cart.findOne({ UserId: AuthUserId, "cart.product": ProductId });
    if (cartItem) {
      // Ensure the total count in the cart does not exceed stock_quantity
      if (cartItem.cart.count >= product.stock_quantity) {
        return res.status(400).json({
          error: `You cannot add more items of this product to your cart.`,
        });
      }
      cartItem.cart.count += count;
    } else {
      // Create a new cart item if the product is not already in the cart
      cartItem = new Cart({
        UserId: AuthUserId,
        cart: { product: ProductId, count: count },
      });
    }

    // Save updates
    await cartItem.save();
    await product.save();

    // Emit product updates via Socket.IO
    io.emit('ProductUpdates', product);
    io.emit('CartUpdates', cartItem);

    res.status(200).json({ message: "Product added to cart successfully", cartItem });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
/**
 * Decrements the quantity of a product in the user's cart.
 * Sends a DELETE request to the server with the authenticated user ID and product ID.
 * If the server responds with a success message, the product is considered removed from the cart.
 * Logs any errors encountered during the process.
 * @param {string} ProductId - The ID of the product to remove from the cart.
 * @param {string} AuthUserId - The ID of the authenticated user.
 */
export const DecrementProductFromCart = async (req, res) => {
  try {
    const { ProductId, AuthUserId } = req.params;
    const cartItem = await Cart.findOne({ UserId: AuthUserId, "cart.product": ProductId });
    if (!cartItem) {
      return res.status(400).json({ error: "Product not found in cart" });
    }
    // Decrement the count of the product in the cart
    cartItem.cart.count -= 1;
    if (cartItem.cart.count <= 0) {
      // Remove the cart item if the count reaches 0
      await Cart.deleteOne({ _id: cartItem._id });
    } else {
      // Save the updated cart item
      await cartItem.save();
    }
    io.emit('CartUpdates', cartItem);
    res.status(200).json({ message: "Product removed from cart successfully", cartItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/**
 * Deletes a product from the user's cart.
 * Sends a DELETE request to the server with the authenticated user ID and product ID.
 * If the server responds with a success message, the product is considered removed from the cart.
 * Logs any errors encountered during the process.
 * @param {string} ProductId - The ID of the product to remove from the cart.
 * @param {string} AuthUserId - The ID of the authenticated user.
 */
export const DeleteProductFromCart = async (req, res) => {
  try {
    const { ProductId, AuthUserId } = req.params;

    // Find the product by ID
    const product = await Product.findById(ProductId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find the cart entry for the user and product
    const cartItem = await Cart.findOne({ UserId: AuthUserId, "cart.product": ProductId });
    if (!cartItem) {
      return res.status(400).json({ error: "Product not found in cart" });
    }

    // Increment the product stock quantity by the count of the product in the cart
    // product.stock_quantity += cartItem.cart.count;

    // Remove the cart item
    await Cart.deleteOne({ _id: cartItem._id });

    // Save the updated product
    // await product.save();

    // Emit product updates via Socket.IO
    io.emit('CartUpdatesDelete', product);
    io.emit('ProductUpdates', product);
    res.status(200).json({ message: "Product deleted from cart successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Deletes a product from the user's cart after placing an order.
 * Sends a DELETE request to the server with the authenticated user ID and product ID.
 * If the server responds with a success message, the product is considered removed from the cart.
 * Logs any errors encountered during the process.
 * @param {string} ProductId - The ID of the product to remove from the cart.
 * @param {string} AuthUserId - The ID of the authenticated user.
 */
export const DeleteProductFromCartAfterPlacingOrder = async (req, res) => {
  try {
    const { ProductId, AuthUserId } = req.params;
    const cartItem = await Cart.findOne({ UserId: AuthUserId, "cart.product": ProductId });
    if (!cartItem) {
      return res.status(400).json({ error: "Product not found in cart" });
    }
    const product = await Product.findById(ProductId);
    product.locked_count -= cartItem.cart.count;
    await Cart.deleteOne({ _id: cartItem._id });
    await product.save();
    io.emit('ProductUpdates', product);
    res.status(200).json({ message: "Product deleted from cart successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const PlaceLockOnItemsDuringPay = async (req, res) => {
  try {
    const { ProductId, AuthUserId } = req.params;
    const product = await Product.findById(ProductId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const cartItem = await Cart.findOne({ UserId: AuthUserId, "cart.product": ProductId });
    if (!cartItem) {
      return res.status(400).json({ error: "Product not found in cart" });
    }
    product.stock_quantity -= cartItem.cart.count;
    product.locked_count += cartItem.cart.count;
    await product.save();
    io.emit('ProductUpdates', product);
    res.status(200).json({ message: "Product locked successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export const ReleaseLockDueToPaymentFailure = async (req, res) => {
  const { ProductId, AuthUserId } = req.params;
  const product = await Product.findById(ProductId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  const cartItem = await Cart.findOne({ UserId: AuthUserId, "cart.product": ProductId });
  if (!cartItem) {
    return res.status(400).json({ error: "Product not found in cart" });
  }
  product.stock_quantity += cartItem.cart.count;
  product.locked_count -= cartItem.cart.count;
  await product.save();
  io.emit('ProductUpdates', product);
  res.status(200).json({ message: "Product unlocked successfully", product });
}

export const DeleteProductFromCartAfterPlacingOrderGuest = async (req, res) => {
  try {
    const { ProductId } = req.params;
    const { count } = req.body
    const product = await Product.findById(ProductId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    product.locked_count -= count;
    await product.save();
    io.emit('ProductUpdates', product);
    res.status(200).json({ message: "Product deleted from cart successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const PlaceLockOnItemsDuringPayGuest = async (req, res) => {
  try {
    const { ProductId } = req.params;
    const { count } = req.body
    const product = await Product.findById(ProductId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    product.stock_quantity -= count;
    product.locked_count += count;
    await product.save();
    io.emit('ProductUpdates', product);
    res.status(200).json({ message: "Product locked successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const ReleaseLockDueToPaymentFailureGuest = async (req, res) => {
  try {
    const { ProductId } = req.params;
    const { count } = req.body
    const product = await Product.findById(ProductId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    product.stock_quantity += count;
    product.locked_count -= count;
    await product.save();
    io.emit('ProductUpdates', product);
    res.status(200).json({ message: "Product unlocked successfully", product });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
}
/**
 * Retrieves the products in the user's cart by user ID.
 * Sends a GET request to the server with the authenticated user ID.
 * If successful, returns the cart items associated with the user.
 * Logs any errors encountered and sends a 500 status code.
 * 
 * @param {Object} req - Express request object containing the user ID in the params.
 * @param {Object} res - Express response object used to send back the cart items or error message.
 */
export const getCartProductsByUserId = async (req, res) => {
  try {
    const { AuthUserId } = req.params;

    // Fetch all cart items for the given user ID
    const cartItems = await Cart.find({ UserId: AuthUserId }).select('cart');

    // Send the cart items as the response
    res.status(200).json(cartItems);
  } catch (error) {
    // Handle any errors and send a 500 status code
    res.status(500).json({ error: error.message });
  }
};
