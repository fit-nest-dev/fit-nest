import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order_Model.js';
import Trainer from '../models/Trainer_Model.js';
import nodemailer from 'nodemailer'
import dotenv from "dotenv"
import User from '../models/User_Model.js';
dotenv.config()

// Validate Razorpay configuration
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not found in environment variables');
  throw new Error('Razorpay configuration missing');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,   // Replace with  Razorpay Key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET // Replace with  Razorpay Key Secret
});
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Generates a Razorpay invoice based on the given payment details
 * @param {string} paymentId - The ID of the payment for which the invoice is to be generated
 * @param {Object} customerDetails - The details of the customer for whom the invoice is to be generated
 * @param {number} amount - The amount of the invoice
 * @param {string} description - The description of the invoice
 * @returns {Promise<string>} - The URL of the generated invoice
 */
const generateInvoice = async (paymentId, customerDetails, amount, description) => {
  // Example Razorpay invoice creation
  const invoice = await razorpay.invoices.create({
    type: 'invoice',
    // payment_id: paymentId,
    description,
    customer: {
      name: customerDetails.name,
      email: customerDetails.email,
    },
    line_items: [
      {
        name: description,
        amount: amount * 100, // Convert back to paise
        currency: 'INR',
        quantity: 1,
      },
    ],
  });

  return invoice.short_url; // Return the invoice URL
};

/**
 * Generates a Razorpay invoice URL for a given payment ID.
 * @param {string} paymentId The payment ID for which the invoice is to be generated.
 * @returns {string} The URL of the generated invoice.
 * @throws {Error} If the payment does not exist or is not captured.
 */
const generateInvoiceWithPaymentId = async (paymentId) => {
  // const { paymentId } = req.body;
  try {
    // Fetch payment details
    const payment = await razorpay.payments.fetch(paymentId);
    if (!payment || payment.status !== 'captured') {
      throw new Error('Payment not found or not captured');
    }
    // Extract required details for the invoice
    const customerDetails = {
      name: payment.customer_name || 'Customer',
      email: payment.email || 'N/A',
    };
    const amount = payment.amount / 100; // Convert from paise to rupees
    const description = payment.description || 'Purchase Invoice';

    // Generate Invoice (example implementation, adjust as needed)
    const invoiceUrl = await generateInvoice(paymentId, customerDetails, amount, description);
    return invoiceUrl;

  } catch (error) {
    return '';
  }
};


/**
 * Checks the status of a payment using the payment ID.
 * Retrieves and returns the payment status, amount, method, description, and creation time.
 * Logs an error and sends a 500 status code if the fetch operation fails.
 *
 * @param {Object} req - The request object containing the payment ID in the body.
 * @param {Object} res - The response object used to send back the payment details or error message.
 * @returns {Promise<void>}
 */
export const checkPaymentStatus = async (req, res) => {
  const { paymentId } = req.body;

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    res.status(200).json({
      status: payment.status,
      amount: payment.amount / 100, // Convert to the original amount if stored in paise
      method: payment.method,
      description: payment.description,
      created_at: new Date(payment.created_at * 1000).toLocaleString(),
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ message: 'Failed to fetch payment status.' });
  }
};

const sendEmailToUser = async (trainerName, trainerEmail, trainerContact, startDate, endDate, amount, userEmail, userName) => {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <img src="https://firebasestorage.googleapis.com/v0/b/code-execution-engine.appspot.com/o/Fitnest.jpg?alt=media&token=c640c29b-1021-4717-b034-24c774010cc3" alt="Fit Nest" style="width: 120px;" />
      </div>
      <h2 style="color: #4caf50; text-align: center; margin-top: 20px;">Payment Successful</h2>
      <p style="font-size: 16px; text-align: center; color:black">Hi <strong>${userName}</strong>,</p>
      <p style="font-size: 16px; text-align: center;color:black">Your payment for a personal trainer has been successfully processed. Below are the details:</p>
      
      <ul style="font-size: 16px; color:black; list-style-type: none; padding: 0; text-align: left;">
        <li><strong>Trainer Name:</strong> ${trainerName}</li>
        <li><strong>Trainer Email:</strong> ${trainerEmail}</li>
        <li><strong>Trainer Contact:</strong> ${trainerContact}</li>
        <li><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</li>
        <li><strong>End Date:</strong> ${new Date(endDate).toLocaleDateString()}</li>
        <li><strong>Amount Paid:</strong> ₹${amount}</li>
      </ul>
      
      <p style="margin-top: 20px; font-size: 16px; text-align: center;color:black">
        Upon approval by the admin, your trainer will be officially assigned to you. In the unlikely event we are unable to assign a trainer, you will receive a full refund of ₹${amount}.
      </p>
      <p style="margin-top: 10px; font-size: 16px; text-align: center;color:black">We will notify you once your trainer has been approved and assigned. Thank you for choosing Fit Nest!</p>
      
      <p style="text-align: center; font-size: 16px; color: #4caf50;">Cheers, <br/> The Fit Nest Team</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `PAYMENT SUCCESSFUL FOR PERSONAL TRAINER ${trainerName}`,
    html: emailContent,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
  }
};



/**
 * Sends an order confirmation email to the customer.
 * @param {string} userEmail The customer's email address.
 * @param {Array} orderDetails An array of objects containing the order details: {productName, quantity, price}.
 * @param {string} first_name The customer's first name.
 * @param {string} last_name The customer's last name.
 * @param {number} totalAmount The total amount of the order.
 */

const sendOrderConfirmation = async (userEmail, orderDetails, first_name, last_name, totalAmount, orderId) => {
  const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <img src="https://firebasestorage.googleapis.com/v0/b/code-execution-engine.appspot.com/o/Fitnest.jpg?alt=media&token=c640c29b-1021-4717-b034-24c774010cc3" alt=" Fit Nest" style="width: 120px;" />
      </div>
      
      <h2 style="color: #4caf50; text-align: center; margin-top: 20px;">Order Confirmation</h2>
      <p style="font-size: 16px; text-align: center; color:black">Hi <strong>${first_name + " " + last_name}</strong>,</p>
      <p style="font-size: 16px; text-align: center;color:black ">Thank you for your order! Below are your order details:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 2px solid #eaeaea; padding: 10px;">Product</th>
            <th style="text-align: center; border-bottom: 2px solid #eaeaea; padding: 10px;">Quantity</th>
            <th style="text-align: right; border-bottom: 2px solid #eaeaea; padding: 10px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${orderDetails
      .map(
        (item) => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${item.productName}</td>
                  <td style="text-align: center; padding: 10px; border-bottom: 1px solid #eaeaea;">${item.quantity}</td>
                  <td style="text-align: right; padding: 10px; border-bottom: 1px solid #eaeaea;">₹${item.price.toFixed(
          2
        )}</td>
                </tr>
              `
      )
      .join("")}
        </tbody>
      </table>

      <p style="font-size: 16px; text-align: right; margin-top: 20px;">
        <strong>Total: ₹${totalAmount.toFixed(2)}</strong>
      </p>

      <p style="margin-top: 30px; font-size: 16px; text-align: center;color:black">We hope to see you again soon!</p>
      <p style="text-align: center; font-size: 16px; color: #4caf50;">Cheers, <br/> The Fit Nest Team</p>

      <div style="margin-top: 30px; text-align: center; font-size: 14px; color: #999;">
        <p>If you have any questions about your order, please contact us at <a href="mailto:fitnest.patna@gmail.com" style="color: #4caf50; text-decoration: none;">
fitnest.patna@gmail.com</a>.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Your Order Confirmation OrderID: ${orderId}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Creates a Razorpay order for a multiple product purchase.
 * @param {Object} req - The request object containing the user ID, products, and total price.
 * @param {Object} res - The response object used to send back the order details.
 * @returns {Object} - Returns a JSON response with a success flag, order ID, amount, and currency. If the order is created successfully, the success flag is true. If the order creation fails, the success flag is false and an error message is returned.
 * @throws {Error} - Logs and returns an error if there is an issue with creating the Razorpay order.
 */
export const CreateOrderForMultiple = async (req, res) => {
  try {
    const { userId, products, totalPrice, address } = req.body;

    // Validate request data
    if (!userId || !products || !totalPrice) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields: userId, products, or totalPrice" 
      });
    }

    if (totalPrice <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Total price must be greater than 0" 
      });
    }

    const order = await razorpay.orders.create({
      amount: totalPrice * 100, // Convert INR to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId,
        products: JSON.stringify(products),
      },
    });

    console.log("Order created successfully:", order.id);
    
    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: totalPrice,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    console.error("Error details:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: "Unable to create order",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
/**
 * Verifies the payment for a multiple product order using Razorpay.
 * @param {Object} req - The request object containing the payment details.
 * @param {Object} res - The response object used to send back the result of the payment verification.
 * @returns {Object} - Returns a JSON response with a success flag and a message. If the payment is verified successfully, the success flag is true and the message is "Payment verified successfully". If the payment verification fails, the success flag is false and the message is "Payment verification failed".
 * @throws {Error} - Logs and returns an error if there is an issue with the payment verification.
 */
export const VerifyPaymentForMultiple = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      address,
      AuthUserId,
      UserName,
      UserEmail,
      UserContact,
      products,
      totalAmount,
      email,
      first_name,
      last_name,
    } = req.body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing payment verification data" 
      });
    }

    console.log("Verifying payment with details:", {
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      signature: razorpay_signature ? "provided" : "missing"
    });

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      const newOrder = new Order({
        orderId: razorpay_order_id,
        AuthUserId,
        products,
        UserName,
        UserEmail,
        UserContact,
        totalAmount,
        paymentId: razorpay_payment_id,
        status: "Paid",
        createdAt: new Date(),
        deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        address
      });

      const invoice_url = await generateInvoiceWithPaymentId(razorpay_payment_id);
      await newOrder.save();
      await sendOrderConfirmation(email, products, first_name, last_name, totalAmount, razorpay_order_id);
      
      console.log("Payment verified successfully for order:", razorpay_order_id);
      
      res.status(200).json({ 
        success: true, 
        message: "Payment verified successfully", 
        invoice_url: invoice_url ? invoice_url : "" 
      });
    } else {
      console.log("Payment signature verification failed");
      console.log("Generated signature:", generatedSignature);
      console.log("Received signature:", razorpay_signature);
      
      res.status(400).json({ 
        success: false, 
        error: "Invalid payment signature" 
      });
    }
  } catch (error) {
    console.log("Error verifying payment:", error);
    console.log("Error stack:", error.stack);
    res.status(500).json({ 
      success: false, 
      error: "Payment verification failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
/**
 * Creates a new order for the specified trainer using Razorpay
 * and returns the order ID and other details to the client.
 * @param {Object} req - The request object containing the trainer ID, user ID, and amount.
 * @param {Object} res - The response object used to send back the order details or an error message.
 * @throws {Error} Logs and returns an error message if unable to create order.
 */
export const CreateOrderForTrainer = async (req, res) => {
  try {
    const { TrainerId, userId, amount } = req.body;

    // Validate request data
    if (!TrainerId || !userId || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: TrainerId, userId, or amount' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Amount must be greater than 0' 
      });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert INR to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        TrainerId,
        userId,
      },
    });

    console.log("Trainer order created successfully:", order.id);
    
    res.status(200).json({
      orderId: order.id,
      amount,
      currency: order.currency
    })
  }
  catch (err) {
    console.error('Error creating trainer order:', err);
    console.error('Error details:', err.response?.data || err.message);
    res.status(500).json({ 
      error: 'Unable to create order',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}
/**
 * Creates a Razorpay order for a membership.
 *
 * This function takes the membership type, amount, and user ID from the request body,
 * creates a Razorpay order, and responds with the order details.
 *
 * @param {Request} req - Express request object containing the order details in the body.
 * @param {Response} res - Express response object used to send back the order details or an error message.
 * @returns {Promise<void>} - Returns a promise that resolves with the order details or an error message.
 */
export const CreateOrderForMembership = async (req, res) => {
  try {
    const { type, amount, userId } = req.body;

    // Validate request data
    if (!type || !amount || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, amount, or userId' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Amount must be greater than 0' 
      });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert INR to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        type,
        amount,
        userId
      },
    });

    console.log("Membership order created successfully:", order.id);
    
    res.status(200).json({
      orderId: order.id,
      amount,
      currency: order.currency
    });
  }
  catch (err) {
    console.error('Error creating membership order:', err);
    console.error('Error details:', err.response?.data || err.message);
    res.status(500).json({ 
      error: 'Unable to create order',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}
/**
 * Processes a refund for a given payment.
 * 
 * This function handles refund requests by interacting with the Razorpay payment gateway.
 * It attempts to refund the specified amount for the given payment ID and returns a
 * success message upon successful processing. In case of an error, it logs the error
 * and returns a failure message.
 * 
 * @param {Object} req - Express request object containing the paymentId and amount in the body.
 * @param {Object} res - Express response object used to send back the HTTP response.
 * 
 * @returns {Promise<void>} - Sends a JSON response with the refund status and details.
 */
export const requestRefund = async (req, res) => {
  const { paymentId, amount } = req.body;

  try {
    // Assuming Razorpay as the payment gatewa
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100, // Amount in paise (₹1 = 100 paise)
    });
    return res.status(200).json({ message: "Refund processed successfully", refund });
  } catch (error) {
    console.error("Refund Error:", error);
    return res.status(500).json({ message: "Refund failed", error: error.message });
  }
};

/**
 * Verify payment for a personal trainer.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * @returns {Promise<void>}
 */
export const VerifyPaymentForPersonalTrainer = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, trainerId, userId, startDate, endDate, amount, email, Name } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET; // Replace with your Razorpay secret key
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (generatedSignature !== razorpay_signature) {
      console.log('Invalid payment signature');
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
    // Update the `paidByUser` field in the Trainers collection
    const invoice_url = await generateInvoiceWithPaymentId(razorpay_payment_id);
    const trainer = await Trainer.findOneAndUpdate(
      {
        _id: trainerId,
        "trainers_assigned": {
          $elemMatch: {
            memberId: userId,
            extra_payment: Number(amount),
            start_date: startDate,
            end_date: endDate,
          },
        },
      },
      {
        $set: {
          "trainers_assigned.$.paidByUser": true,
          "trainers_assigned.$.PaymentId": razorpay_payment_id
        }
      }, { new: true }
    );
    sendEmailToUser(trainer.trainer_name, trainer.email, trainer.trainer_contact, startDate, endDate, amount, email, Name);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer assignment not found' });
    }
    res.status(200).json({ success: true, message: 'Payment verified and status updated.', invoice_url: invoice_url ? invoice_url : "", trainer: trainer });
  } catch (error) {
    console.error('Error in payment verification:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

/**
 * Verifies the payment for a membership using Razorpay's details.
 * 
 * This function checks the validity of the payment signature to ensure that 
 * the payment was completed successfully. If the signature matches, it updates 
 * the user's membership details including type, start date, and end date. 
 * 
 * @param {Object} req - The request object containing payment details in the body.
 * @param {Object} res - The response object used to send back the HTTP response.
 * 
 * Request Body:
 * @param {string} razorpay_payment_id - The payment ID returned by Razorpay.
 * @param {string} razorpay_order_id - The order ID returned by Razorpay.
 * @param {string} razorpay_signature - The signature returned by Razorpay to verify payment.
 * @param {string} type - The type of membership (e.g., Monthly, BiMonthly).
 * @param {string} userId - The ID of the user making the payment.
 * @param {number} amount - The amount paid.
 * 
 * Response:
 * @returns {Object} - A JSON response indicating success or failure of the verification.
 * 
 * Possible Responses:
 * - 200: Payment verified and user membership details updated successfully.
 * - 400: Invalid payment signature.
 * - 404: User not found.
 * - 500: Internal server error.
 */
export const VerifyPaymentForMembership = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, type, userId, amount } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET; // Replace with your Razorpay secret key
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (generatedSignature !== razorpay_signature) {
      console.log('Invalid payment signature');
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
    // Update the `paidByUser` field in the Trainers collection
    const MembershipStartDate = new Date();
    const MembershipEndDate = type === 'Monthly' ? new Date(MembershipStartDate.getTime() + 30 * 24 * 60 * 60 * 1000) :
      type === 'BiMonthly' ? new Date(MembershipStartDate.getTime() + 60 * 24 * 60 * 60 * 1000) :
        type === 'Quarterly' ? new Date(MembershipStartDate.getTime() + 90 * 24 * 60 * 60 * 1000) :
          type === 'Quadrimester' ? new Date(MembershipStartDate.getTime() + 120 * 24 * 60 * 60 * 1000) :
            type === 'SemiAnnual' ? new Date(MembershipStartDate.getTime() + 180 * 24 * 60 * 60 * 1000) :
              type === 'Annual' ? new Date(MembershipStartDate.getTime() + 360 * 24 * 60 * 60 * 1000) : null;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.membership_details = {
      membership_type: type,
      start_date: MembershipStartDate,
      end_date: MembershipEndDate,
      status: 'Active',
    }
    const invoice_url = await generateInvoiceWithPaymentId(razorpay_payment_id);
    await user.save();
    res.status(200).json({ success: true, message: 'Payment verified and status updated.', ChangedUser: user, invoice_url: invoice_url ? invoice_url : "" });
  } catch (error) {
    console.error('Error in payment verification:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}