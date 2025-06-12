import Razorpay from "razorpay";
import Order from "../models/Order_Model.js";
import { io } from "../socket/socket.js";
import nodemailer from 'nodemailer'
import dotenv from "dotenv"
dotenv.config()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,   // Replace with your Razorpay Key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET // Replace with your Razorpay Key Secret
});
/**
 * Retrieves the details of an order for a guest user based on the order ID.
 * 
 * @param {Object} req - The request object containing the order ID in the parameters.
 * @param {Object} res - The response object used to send back the order details or an error message.
 * 
 * @returns {Object} - Returns a JSON response with the order details if found, otherwise an error message.
 * 
 * @throws {Error} - Logs an error if there is an issue with the database query.
 */

export const getOrderDetailsofGuest = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
  }
  catch (err) {
    console.log(err)
  }
}
/**
 * Sends an email with the specified subject and message to the given email address.
 *
 * This function creates a transporter using Gmail's SMTP service and sends an email
 * from the configured email address to the specified recipient. It logs a success

 * message if the email is sent successfully, or an error message if the email
 * sending fails.
 *
 * @param {string} email - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} message - The text content of the email.
 */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const sendEmailOrderStatusUpdate = async (email, userName, orderId, orderStatus, products) => {
  // Generate the product table
  const productRows = products
    .map(
      (product) => `
        <tr style="border-bottom: 1px solid #ddd; text-align: left;">
          <td style="padding: 8px;">${product.productName}</td>
          <td style="padding: 8px; text-align: center;">${product.quantity}</td>
          <td style="padding: 8px; text-align: right;">₹${product.price.toFixed(2)}</td>
        </tr>
      `
    )
    .join('');

  const emailContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <img src="https://firebasestorage.googleapis.com/v0/b/code-execution-engine.appspot.com/o/Fitnest.jpg?alt=media&token=c640c29b-1021-4717-b034-24c774010cc3" alt="Fit Nest" style="width: 120px;" />
      </div>
      <h2 style="color: #4caf50; text-align: center; margin-top: 20px;">Order Status Update</h2>
      <p style="font-size: 16px; text-align: center; color:black">Hi <strong>${userName}</strong>,</p>
      <p style="font-size: 16px; text-align: center; color:black">
        We wanted to inform you that the status of your order <strong>#${orderId}</strong> has been updated.
      </p>
      <p style="font-size: 16px; text-align: center; color:black">
        The new status of your order is: <strong>${orderStatus}</strong>.
      </p>

      <h3 style="color: #333; text-align: center; margin-top: 20px;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background-color: #f2f2f2; border-bottom: 1px solid #ddd;">
            <th style="padding: 8px; text-align: left;">Product</th>
            <th style="padding: 8px; text-align: center;">Quantity</th>
            <th style="padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>

      <p style="margin-top: 30px; font-size: 16px; text-align: center; color:black">
        If you have any questions or concerns, please contact us at <a href="mailto:fitnest.patna@gmail.com" style="color: #4caf50; text-decoration: none;">fitnest.patna@gmail.com</a>.
      </p>
      <p style="text-align: center; font-size: 16px; color: #4caf50;">Cheers, <br/> The Fit Nest Team</p>
    </div>
  `;

  // Email Options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Order Status Updated: ${orderStatus} - Order ID: ${orderId}`,
    html: emailContent,
  };

  // Send Email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending order status update email:', error);
  }
};
const sendEmailDeliveryDateChange = async (userEmail, userName, orderId, deliveryDate, products) => {
  // Generate the product table
  const productRows = products
    .map(
      (product) => `
        <tr style="border-bottom: 1px solid #ddd; text-align: left;">
          <td style="padding: 8px;">${product.productName}</td>
          <td style="padding: 8px; text-align: center;">${product.quantity}</td>
          <td style="padding: 8px; text-align: right;">₹${product.price.toFixed(2)}</td>
        </tr>
      `
    )
    .join('');

  const emailContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <img src="https://firebasestorage.googleapis.com/v0/b/code-execution-engine.appspot.com/o/Fitnest.jpg?alt=media&token=c640c29b-1021-4717-b034-24c774010cc3" alt="Fit Nest" style="width: 120px;" />
      </div>
      <h2 style="color: #4caf50; text-align: center; margin-top: 20px;">Order Delivery Update</h2>
      <p style="font-size: 16px; text-align: center; color:black">Hi <strong>${userName}</strong>,</p>
      <p style="font-size: 16px; text-align: center; color:black">
        We wanted to inform you that the delivery time for your order <strong>#${orderId}</strong> has been updated.
      </p>
      <p style="font-size: 16px; text-align: center; color:black">
        Your new delivery date is: <strong>${deliveryDate}</strong>.
      </p>

      <h3 style="color: #333; text-align: center; margin-top: 20px;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background-color: #f2f2f2; border-bottom: 1px solid #ddd;">
            <th style="padding: 8px; text-align: left;">Product</th>
            <th style="padding: 8px; text-align: center;">Quantity</th>
            <th style="padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>

      <p style="margin-top: 30px; font-size: 16px; text-align: center; color:black">
        We apologize for any inconvenience this may cause. If you have any questions or concerns, please contact us at <a href="mailto:fitnest.patna@gmail.com" style="color: #4caf50; text-decoration: none;">fitnest.patna@gmail.com</a>.
      </p>
      <p style="text-align: center; font-size: 16px; color: #4caf50;">Cheers, <br/> The Fit Nest Team</p>
    </div>
  `;

  // Email Options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `ORDER DELIVERY TIME UPDATED FOR ${orderId}`,
    html: emailContent,
  };

  // Send Email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending delivery date update email:', error);
  }
};

/**
 * Retrieves all orders associated with a given user ID.
 * 
 * This function sends a GET request to the server to retrieve all orders
 * associated with the provided user ID. The response data containing the 
 * orders is returned.
 * 
 * @param {string} AuthUserId - The ID of the user whose orders are to be fetched.
 * @returns {Promise<Object[]>} A promise that resolves to an array of orders.
 */
export const GetOrdersOfParticularUser = async (req, res) => {
  try {
    const { AuthUserId } = req.params;
    const orders = await Order.find({ AuthUserId });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Unable to fetch order details' });
  }
}

/**
 * Retrieves all orders from the database.
 * 
 * This function sends a GET request to the server to retrieve all orders
 * from the database. The response data containing the orders is returned.
 * 
 * @returns {Promise<Object[]>} A promise that resolves to an array of orders.
 */
export const GetAllOrdersFromDatabase = async (req, res) => {
  try {
    const orders = await Order.find(); // Fetch all orders from the database
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
}

/**
 * Retrieves a specific order by order ID and authenticated user ID.
 * 
 * This function sends a GET request to the server with the provided
 * order ID and authenticated user ID to fetch the corresponding order.
 * If the order is found, the details are returned in the response.
 * If the order is not found, a 404 error is returned.
 * 
 * @param {Object} req - The request object containing parameters.
 * @param {Object} res - The response object to send the order data or error message.
 * @throws {Error} Logs and returns an error message if unable to fetch order details.
 */
export const GetParticularOrderById = async (req, res) => {
  try {
    const { orderId, AuthUserId } = req.params;
    const order = await Order.findOne({ orderId, AuthUserId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Unable to fetch order details' });
  }
}
/**
 * Updates the delivery date of an order in the database.
 * Sends a PUT request to the server with the new delivery date and order ID.
 * If successful, it returns a success message with the updated order.
 * If the order is not found, a 404 error is returned.
 * Catches and logs any errors encountered during the process.
 * @param {Object} req - The request object containing parameters.
 * @param {Object} res - The response object to send the order data or error message.
 * @throws {Error} Logs and returns an error message if unable to update order details.
 */
export const EditDeliveryTime = async (req, res) => {
  try {
    const { OrderId } = req.params;  // Extract orderId from the request parameters
    const { deliveryDate, userName, email } = req.body;  // Extract the new deliveryDate from the request body

    // Use findByIdAndUpdate to find the order by orderId and update its deliveryDate
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: OrderId },  // Query filter, looking for the orderId field
      { deliveryDate: deliveryDate },  // Update operation to change deliveryDate
      { new: true }  // Return the updated document instead of the original one
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    sendEmailDeliveryDateChange(email, userName, updatedOrder.orderId, updatedOrder.deliveryDate, updatedOrder.products)
    res.status(200).json({ message: updatedOrder });
  } catch (error) {
    // Return error if something goes wrong
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
/**
 * Updates the delivery address of an order in the database.
 * Sends a PUT request to the server with the new delivery address and order ID.
 * If successful, it returns a success message with the updated order.
 * If the order is not found, a 404 error is returned.
 * Catches and logs any errors encountered during the process.
 * @param {Object} req - The request object containing parameters.
 * @param {Object} res - The response object to send the order data or error message.
 * @throws {Error} Logs and returns an error message if unable to update order details.
 */
export const EditOrderAddress = async (req, res) => {
  try {
    const { OrderId } = req.params;  // Extract orderId from the request parameters
    const { address } = req.body;  // Extract the new deliveryDate from the request body  

    // Use findByIdAndUpdate to find the order by orderId and update its deliveryDate
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: OrderId },  // Query filter, looking for the orderId field
      { address: address },  // Update operation to change deliveryDate
      { new: true }  // Return the updated document instead of the original one 
    );
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Return a success message
    res.status(200).json({ message: updatedOrder });
  } catch (error) {
    // Return error if something goes wrong
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Updates the status of an order in the database.
 * Sends a PUT request to the server with the new status and order ID.
 * If successful, it returns a success message with the updated order.
 * If the order is not found, a 404 error is returned.
 * Catches and logs any errors encountered during the process.
 * @param {Object} req - The request object containing parameters.
 * @param {Object} res - The response object to send the order data or error message.
 * @throws {Error} Logs and returns an error message if unable to update order details.
 */
export const EditOrderStatus = async (req, res) => {
  try {
    const { OrderId } = req.params;  // Extract orderId from the request parameters
    const { status, userName, email } = req.body;  // Extract the new deliveryDate from the request body  

    // Use findByIdAndUpdate to find the order by orderId and update its deliveryDate
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: OrderId },  // Query filter, looking for the orderId field
      { status: status },  // Update operation to change deliveryDate
      { new: true }  // Return the updated document instead of the original one 
    );
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    sendEmailOrderStatusUpdate(email, userName, updatedOrder.orderId, updatedOrder.status, updatedOrder.products)
    res.status(200).json({ message: updatedOrder });
  } catch (error) {
    // Return error if something goes wrong
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
/**
 * Refunds the payment for an order.
 * @param {string} orderId - The order ID for which the refund is to be processed.
 * @param {string} paymentId - The payment ID for which the refund is to be processed.
 * @param {number} amount - The amount of the refund in paise.
 * @param {number} totalAmount - The total amount of the order in paise.
 * @throws {Error} Logs and returns an error message if unable to process the refund.
 */
const refundPayment = async (orderId, paymentId, amount, totalAmount) => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount, // Amount in paise
      notes: { reason: "Order cancelled by user" },
    });
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: orderId },  // Query filter, looking for the orderId field
      {
        refundDetails: { amount: Number(totalAmount - amount) / 100, reason: 'ORDER CANCELLED BY USER', date: new Date() }
        , totalAmount: Number(totalAmount - amount) / 100
      },  // Update operation to change deliveryDate
      { new: true }  // Return the updated document instead of the original one
    )
    io.emit('RefundSuccess', updatedOrder);
  } catch (error) {
    console.error("Error in Refund:", error);
  }
};
/**
 * Cancels an order by updating its status to 'CANCELLED' and processes a refund.
 * 
 * Sends a PUT request to the server to cancel the order specified by the order ID.
 * If the order is found, its status is set to 'CANCELLED' and a partial refund is processed.
 * If the order is not found, a 404 error is returned.
 * Catches and logs any errors encountered during the process.
 * 
 * @param {Object} req - Express request object containing the order ID in the request parameters.
 * @param {Object} res - Express response object used to send back the order data or error message.
 * @throws {Error} Logs and returns an error message if unable to cancel the order or process the refund.
 */

export const CancelOrderByUser = async (req, res) => {
  try {
    const { OrderId } = req.params;  // Extract orderId from the request parameters
    // Use findByIdAndUpdate to find the order by orderId and update its deliveryDate
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: OrderId },  // Query filter, looking for the orderId field
      { status: 'CANCELLED' },  // Update operation to change deliveryDate
      { new: true }  // Return the updated document instead of the original one 
    );
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    await refundPayment(OrderId, updatedOrder.paymentId, 0.9 * updatedOrder.totalAmount * 100, updatedOrder.totalAmount * 100);
    // Return a success message
    res.status(200).json({ message: updatedOrder });
  } catch (error) {
    // Return error if something goes wrong
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
/**
* Calculate total sales from the Orders collection.
* @returns {Promise<number>} Total sales amount
*/
export const calculateTotalSales = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    // Validate the date range
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Please provide both startDate and endDate in the query parameters." });
    }

    // Parse the date strings to JavaScript Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }

    // Fetch orders within the specified date range
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }
    });

    // Calculate the total sales amount
    const totalSales = orders.reduce((sum, order) => {
      if (order.status === 'CANCELLED') {
        return sum + order.totalAmount * 0.1; // Add 10% of cancelled orders
      }
      return sum + order.totalAmount; // Add full amount for non-cancelled orders
    }, 0);

    // Return the result
    res.status(200).json({ totalSales });
  } catch (error) {
    console.error("Error calculating total sales:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

/**
 * Retrieves the buy counts of products within a given date range.
 * @param {Object} req - Express request object containing the start and end dates in the query parameters.
 * @param {Object} res - Express response object used to send back the product buy counts data or error message.
 * @returns {Promise<void>}
 */
export const fetchProductBuyCounts = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start and end dates are required." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch orders within the date range
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    });

    // Map products to their buy counts
    const productBuyCounts = {};
    orders.forEach((order) => {
      order.products.forEach((product) => {
        const { productId, productName, quantity } = product;
        if (!productBuyCounts[productName]) {
          productBuyCounts[productName] = 0;
        }
        productBuyCounts[productName] += quantity;
      });
    });
    res.status(200).json(productBuyCounts);
  } catch (err) {
    console.error("Error fetching product buy counts:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Retrieves the most and least bought products within a specified date range.
 * 
 * This function processes the orders to determine which products were bought the most 
 * and the least. It uses MongoDB aggregation to match orders within the specified date range,
 * unwind the products array to treat each product as an individual document, and 
 * groups the products by their IDs to calculate the total quantity bought. It then
 * looks up product details from the products collection and sorts the results by the total
 * quantity bought in descending order.
 * 
 * The function returns a JSON response containing the most and least bought products 
 * along with their names and total quantities. If no orders are found within the specified 
 * date range, it returns a 404 status code with an appropriate message. If an error occurs, 
 * it returns a 500 status code with an error message.
 * 
 * @param {Object} req - Express request object containing the start and end dates in the URL parameters.
 * @param {Object} res - Express response object used to send back the most and least bought products data or error message.
 * @returns {Promise<void>}
 */

export const getMostAndLeastBoughtProducts = async (req, res) => {
  const { startDate, endDate } = req.params;
  try {
    const orders = await Order.aggregate([
      // Match orders within the date range
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      // Unwind the products array to process each product individually
      {
        $unwind: "$products",
      },
      // Group by product ID and calculate the total buy count
      {
        $group: {
          _id: "$products.productId",
          totalBought: { $sum: "$products.quantity" },
        },
      },
      // Lookup product details from the products collection
      {
        $lookup: {
          from: "products", // Assuming "products" is the collection that holds the product details
          localField: "_id", // The field in the orders collection (productId)
          foreignField: "_id", // The field in the products collection (productId)
          as: "productDetails", // The alias for the joined data
        },
      },
      // Flatten the productDetails array (because $lookup returns an array)
      {
        $unwind: "$productDetails",
      },
      // Sort by totalBought in descending order to fetch most bought first
      {
        $sort: { totalBought: -1 },
      },
    ]);

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found in the specified date range." });
    }

    // Extract the most and least bought products, replacing _id with productName
    const mostBought = orders[0]; // First product in sorted array
    const leastBought = orders[orders.length - 1]; // Last product in sorted array
    res.status(200).json({
      mostBought: {
        productName: mostBought.productDetails.product_name, // Use the productName from productDetails
        totalBought: mostBought.totalBought,
      },
      leastBought: {
        productName: leastBought.productDetails.product_name, // Use the productName from productDetails
        totalBought: leastBought.totalBought,
      },
    });
  } catch (error) {
    console.error("Error fetching most and least bought products:", error);
    res.status(500).json({ error: "Failed to fetch product analytics." });
  }
};
