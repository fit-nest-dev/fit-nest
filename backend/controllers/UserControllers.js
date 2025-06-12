import User from "../models/User_Model.js";
import nodemailer from "nodemailer";
import { io } from "../socket/socket.js";
import cron from 'node-cron';
import UserPlanPdfRequest from "../models/UserPlanPdfRequest_Model.js";
import { ChangeRequest } from "../models/ChangeRequest_Model.js";
import dotenv from "dotenv"
dotenv.config()
const UserWatcher = User.watch();
UserWatcher.on('change', async (change) => {
  console.log(change)
  const user = await User.findById(change.documentKey._id).select('-password');
  io.emit('UserChanges', user);
});

/**
 * Retrieves the user details for a given user ID.
 * 
 * @param {Object} req - Express request object containing the user ID in the parameters.
 * @param {Object} res - Express response object used to send back the user details or error message.
 * 
 * @returns {Object} JSON response containing the user details if found, otherwise a 500 status code with an error message.
 * 
 * @throws {Error} Logs and returns an error message if unable to find the user in the database.
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    // console.log(userId);
    // const {id}=req.params;
    const user = await User.findById(id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    console.log("error in user controller controller", error.message)
    res.status(500).json({ error: "INTERNAL SERVER ERROR" })
  }
}
/**
 * Retrieves all users with their membership details from the database.
 * 
 * This function sends a GET request to the server to fetch all users from the database
 * and returns their membership details in a JSON format.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * 
 * @returns {Object} JSON response containing an array of user objects with their membership details if found, otherwise a 404 status code with an error message.
 * 
 * @throws {Error} Logs and returns an error message if there is a failure in the process.
 */
export const getAllUsersMembershipDetails = async (req, res) => {
  try {
    // Fetch all users from the database and select relevant fields
    // const users = await User.find({ isAdmin: { $ne: true } ,membership_details: { $exists: true, $ne: null }}).select('first_name last_name mobile_number PaidByUser email membership_details');
    const users = await User.find({ isAdmin: { $ne: true } }).select('first_name last_name mobile_number  email membership_details');
    // Check if any users were found
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    // Map the user data to return only the relevant fields
    const result = users.map(user => ({
      _id: user?._id,
      first_name: user?.first_name,
      last_name: user?.last_name,
      mobile_number: user?.mobile_number,
      email: user?.email,
      membership_details: {
        start_date: user?.membership_details?.start_date,
        end_date: user?.membership_details?.end_date,
        status: user?.membership_details?.status,
        membership_id: user?.membership_details?.membership_id,
        PaidByUser: user?.membership_details?.PaidByUser,
        membership_type: user?.membership_details?.membership_type
      }
    }));

    // Return the user data with membership details
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};
/**
 * Retrieves all inactive members from the database.
 * 
 * This function fetches users whose membership is either expired, 
 * does not exist, or is null, and who are not administrators.
 * It returns their first name, last name, email, and membership details 
 * in a JSON response.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * 
 * @returns {Object} JSON response containing an array of inactive user objects if found,
 * otherwise a 500 status code with an error message.
 * 
 * @throws {Error} Logs and returns an error message if there is a failure in the process.
 */

export const getInactiveMembers = async (req, res) => {
  try {
    const users = await User.find({
      $and: [
        {
          $or: [
            { "membership_details.status": "Expired" }, // Membership is expired
            { membership_details: { $exists: false } }, // membership_details field doesn't exist
            { membership_details: null } // membership_details field is null
          ]
        },
        { isAdmin: false } // isAdmin is false
      ]
    }).select('first_name last_name email membership_details');

    res.status(200).json(users);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
/*const sendEmailMembershipExpiryReminder = async (email, firstName, lastName) => {
  // Define HTML content
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <img src="https://firebasestorage.googleapis.com/v0/b/code-execution-engine.appspot.com/o/Fitnest.jpg?alt=media&token=c640c29b-1021-4717-b034-24c774010cc3" alt="Fit Nest" style="width: 120px;" />
      </div>
      <h2 style="color: #ff9800; text-align: center; margin-top: 20px;">Membership Expiry Reminder</h2>
      <p style="font-size: 16px; text-align: center; color:black;">
        Dear <strong>${firstName} ${lastName}</strong>,
      </p>
      <p style="font-size: 16px; text-align: center; color:black;">
        Your membership is about to expire in <strong>5 days</strong>. Please renew it to continue enjoying our services.
      </p>
      <p style="text-align: center; font-size: 16px; color: #4caf50;">
        Cheers, <br/> The Fit Nest Team
      </p>
      <div style="margin-top: 30px; text-align: center; font-size: 14px; color: #999;">
        <p>If you have any questions, please contact us at 
          <a href="mailto:fitnest.patna@gmail.com" style="color: #4caf50; text-decoration: none;">fitnest.patna@gmail.com</a>.
        </p>
      </div>
    </div>
  `;

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Membership Expiry Reminder",
    html: htmlContent,
  };

  // Send Email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Membership expiry reminder email sent successfully!");
  } catch (error) {
    console.error("Error sending membership expiry reminder email:", error);
  }
};*/
/*const sendEmailMembershipExpired = async (email, firstName, lastName) => {
  // Define HTML content
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <img src="https://firebasestorage.googleapis.com/v0/b/code-execution-engine.appspot.com/o/Fitnest.jpg?alt=media&token=c640c29b-1021-4717-b034-24c774010cc3" alt="Fit Nest" style="width: 120px;" />
      </div>
      <h2 style="color: #e53935; text-align: center; margin-top: 20px;">Membership Expired</h2>
      <p style="font-size: 16px; text-align: center; color:black;">
        Dear <strong>${firstName}+" "+${lastName}</strong>,
      </p>
      <p style="font-size: 16px; text-align: center; color:black;">
        Your membership has expired. Please renew it to regain access to our services and continue your fitness journey with us.
      </p>
      <p style="text-align: center; font-size: 16px; color: #4caf50;">
        Cheers, <br/> The Fit Nest Team
      </p>
      <div style="margin-top: 30px; text-align: center; font-size: 14px; color: #999;">
        <p>If you have any questions, please contact us at 
          <a href="mailto:fitnest.patna@gmail.com" style="color: #4caf50; text-decoration: none;">fitnest.patna@gmail.com</a>.
        </p>
      </div>
    </div>
  `;

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Membership Expired",
    html: htmlContent,
  };

  // Send Email
 /* try {
    await transporter.sendMail(mailOptions);
    console.log("Membership expired email sent successfully!");
  } catch (error) {
    console.error("Error sending membership expired email:", error);
  }
};*/

/**
 * Schedules daily email notifications for users about their membership status.
 * 
 * This function uses the `cron` package to schedule a job that runs every day at midnight.
 * It retrieves all non-admin users with valid membership details from the database and checks 
 * their membership expiry status. If a user's membership is about to expire in 5 days, an 
 * email reminder is sent. If a user's membership has expired, a notification email is sent.
 * 
 * The emails are sent using the `sendEmail` function, and any errors encountered during the 
 * process are logged to the console.
 * 
 * @throws {Error} Logs errors if there is a failure in retrieving users or sending emails.
 */

export const scheduleEmailNotifications = async () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Scheduled email notification sent!');
    const currentDate = new Date();
    try {
      const users = await User.find({ isAdmin: { $ne: true }, membership_details: { $exists: true, $ne: null } }).select('first_name last_name email membership_details');
      users.forEach((user) => {
        const endDate = new Date(user.membership_details.end_date);
        const timeDifference = endDate - currentDate;
        // If membership is about to expire in 5 days
      /*  if (timeDifference > 0 && timeDifference <= 5 * 24 * 60 * 60 * 1000) {
          sendEmailMembershipExpiryReminder(
            user.email,
            user.first_name,
            user.last_name
          );
        }
        // If membership has expired
       if (timeDifference < 0) {
          sendEmailMembershipExpired(
            user.email,
            user.first_name,
            user.last_name
          );
        }*/
      });
    }
    catch (err) {
      console.log(err)
    }
  });
}
/**
 * Schedules a daily job to update the membership status of all non-admin users.
 * 
 * This function uses the `cron` package to schedule a job that runs every day at midnight.
 * It retrieves all non-admin users with valid membership details from the database and updates
 * their membership status. If a user's membership has expired, it sets the status to "Expired".
 * The updated users are then saved back to the database.
 * 
 * Any errors encountered during the process are logged to the console.
 * 
 * @throws {Error} Logs errors if there is a failure in retrieving users or updating their status.
 */
export const UpdateMembershipStatus = async () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Scheduled membership status update sent!');
    try {
      const users = await User.find({ isAdmin: { $ne: true }, membership_details: { $exists: true, $ne: null } }).select('first_name last_name email membership_details');
      users.forEach((user) => {
        const endDate = new Date(user.membership_details.end_date);
        const currentDate = new Date();
        if (endDate < currentDate) {
          user.membership_details.status = "Expired";
        }
        user.save();
      });
    } catch (err) {
      console.log(err)
    }
  });
}
/**
 * Retrieves all emails from the database.
 * 
 * This function sends a GET request to fetch all users from the database and
 * returns their email addresses in a JSON format. If an error occurs during the
 * process, it logs the error and returns a 500 error message.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object used to send back the list of emails or error message.
 * @returns {Promise<void>}
 */
export const getAllEmails = async (req, res) => {
  try {
    const users = await User.find({}).select("email first_name last_name");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ message: "Error fetching emails", error });
  }
}

/**
 * Sends a custom email using Nodemailer.
 * 
 * This function creates a transporter using Gmail's SMTP service and sends a custom email
 * from the configured email address to the specified recipient with the given content.
 * If the email is sent successfully, it responds with a success message; otherwise, it 
 * returns an error message.
 * 
 * @param {Object} req - Express request object containing the recipient's email and email content in the request body.
 * @param {Object} res - Express response object used to send back the response.
 * 
 * @returns {Object} JSON response with a success message if the email is sent successfully, 
 * or an error message if the email sending fails.
 * 
 * @throws {Error} Logs and returns an error message if there is a failure in sending the email.
 */

export const SendCustomMails = async (req, res) => {
  const { email, content } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use the app-specific password
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Custom Email",
      text: content,
    });

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email", error });
  }
}
/**
 * Submits feedback from a user and saves it to the database.
 *
 * This function takes a user ID and a feedback message from the request body,
 * and appends the feedback to the user's feedback array in the database. 
 * It returns a success message and the feedback entry if the operation is successful.
 * If the user ID or message is missing, it responds with a 400 error. 
 * If the user is not found, it responds with a 404 error. 
 * It logs and returns a 500 error if there is a failure in saving the feedback.
 *
 * @param {Object} req - Express request object containing the user ID and feedback message in the request body.
 * @param {Object} res - Express response object used to send back the response.
 *
 * @returns {Object} JSON response with a success message and feedback entry if submitted successfully,
 * or an error message if there is a failure in the process.
 *
 * @throws {Error} Logs and returns an error message if there is a failure in saving the feedback.
 */

export const SubmitUserFeedback = async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) {
    return res.status(400).json({ message: "User ID and message are required" });
  }
  try {
    const feedbackEntry = {
      date: new Date(),
      message,
    };
    // Update user feedback array
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { feedback: feedbackEntry } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Feedback submitted successfully", feedback: feedbackEntry });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ message: "Error saving feedback", error });
  }
}
/**
 * Retrieves all users with feedbacks.
 *
 * This function fetches all users who have at least one feedback entry in the database.
 * It returns a JSON response with the user details and feedback entries if successful.
 * If no feedbacks are found, it responds with a 404 error.
 * If there is a failure in fetching feedbacks, it logs and returns a 500 error.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object used to send back the response.
 *
 * @returns {Object} JSON response with a success message and the user feedbacks if successful,
 * or an error message if there is a failure in the process.
 *
 * @throws {Error} Logs and returns an error message if there is a failure in fetching feedbacks.
 */
export const getAllFeebacks = async (req, res) => {
  try {
    // Fetch users who have feedbacks
    const usersWithFeedback = await User.find(
      { feedback: { $exists: true, $not: { $size: 0 } } }, // Find users with non-empty feedback
      "first_name last_name email feedback" // Select relevant fields
    );

    if (!usersWithFeedback.length) {
      return res.status(404).json({ message: "No feedbacks found." });
    }

    res.status(200).json({ message: "Feedbacks retrieved successfully", data: usersWithFeedback });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ message: "Error fetching feedbacks", error });
  }
}
/**
 * Calculates the total sales of memberships between the specified start and end dates.
 * 
 * This function takes the start and end dates as query parameters, fetches all users with active memberships
 * that overlap with the specified range, and calculates the total sales by prorating the membership price
 * based on the overlap between the membership period and the query range.
 * 
 * @param {Object} req - Express request object containing the start and end dates in the query parameters.
 * @param {Object} res - Express response object used to send back the total sales.
 * 
 * @returns {Object} JSON response with the total sales.
 * 
 * @throws {Error} Logs and returns an error message if there is a failure in the process.
 */
export const calculateMembershipSales = async (req, res) => {
  try {
    const { start_date, end_date } = req.params;
    // Parse start_date and end_date as Date objects
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    // Pricing for different membership types
    const pricing = {
      "Monthly": 1500,
      "BiMonthly": 2900,
      "Quarterly": 4100,
      "Quadrimester": 5000,
      "SemiAnnual": 7000,
      "Annual": 13000,
    };
    // Durations of membership types in days
    const durations = {
      "Monthly": 30,
      "BiMonthly": 60,
      "Quarterly": 90,
      "Quadrimester": 120,
      "SemiAnnual": 180,
      "Annual": 360,
    };
    // Fetch all users with memberships
    const users = await User.find({
      "membership_details.status": "Active",
      "membership_details.end_date": { $gte: startDate },
    });

    let totalSales = 0;

    users.forEach((user) => {
      const membership = user.membership_details;
      //  console.log(membership,'membership');
      // Extract relevant details
      const { membership_type, start_date, end_date, status } = membership;

      // Ignore memberships that expired before the start date
      const membershipEndDate = new Date(end_date);
      if (status === "Expired" || membershipEndDate < startDate) {
        return;
      }

      // Calculate overlapping days between membership and query range
      const membershipStartDate = new Date(start_date);
      const overlapStartDate = membershipStartDate <= startDate ? startDate : membershipStartDate;
      const overlapEndDate = membershipEndDate >= endDate ? endDate : membershipEndDate;
      const overlapDays = Math.floor((overlapEndDate - overlapStartDate) / (1000 * 60 * 60 * 24));

      if (overlapDays > 0) {
        const membershipDurationDays = durations[membership_type];
        const membershipPrice = pricing[membership_type];
        // Prorate the price based on overlap
        const proratedPrice = (membershipPrice / membershipDurationDays) * overlapDays;
        console.log(proratedPrice, 'proratedPrice');
        totalSales += proratedPrice;
      }
    });

    res.status(200).json({ totalSales });
  } catch (error) {
    console.error("Error calculating membership sales:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Edits the details of a user.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * 
 * Request Body:
 * @param {string} first_name - The first name of the user.
 * @param {string} last_name - The last name of the user.
 * @param {string} mobile_number - The contact number of the user.
 * @param {string} email - The email of the user.
 * @param {string} contact - The contact number of the user.
 * @param {string} start_date - The start date of the user's membership.
 * @param {string} end_date - The end date of the user's membership.
 * @param {string} status - The status of the user's membership.
 * @param {boolean} paid - Whether the user has paid for their membership.
 * @param {string} type - The type of the user's membership (e.g., Monthly, BiMonthly).
 * 
 * Response:
 * @returns {Object} - A JSON response indicating success or failure of the request.
 *   If the user is found and the request is successful, a 200 status code is returned
 *   with the updated user object. If the user is not found, a 404 status code is returned
 *   with an error message. If an error occurs during the update process, a 500 status code is
 *   returned with an error message.
 */
export const EditUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name,  email, contact, membership_id, start_date, end_date, status, paid, type } = req.body;
    const user = await User.findByIdAndUpdate(id, { first_name, last_name, mobile_number: contact, email, membership_details: { start_date, end_date, membership_id, status, PaidByUser: paid, membership_type: type } }, { new: true })
    res.status(200).json(user);
  }
  catch (err) {
    console.log('error in user controller controller', err);
    res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
}
/**
 * Retrieves all pending change requests from the database.
 * 
 * Sends a GET request to the server and returns all change requests with a status of "Pending".
 * If successful, it returns a JSON response with the change requests.
 * If an error occurs during the retrieval process, a 500 status code is returned with an error message.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * 
 * Response:
 * @returns {Object} - A JSON response containing an array of change requests with the status of "Pending" if found, otherwise a 500 status code with an error message.
 */
export const getChangeRequests = async (req, res) => {
  const changeRequest = await ChangeRequest.find({ status: "Pending" })
  res.status(200).json(changeRequest)
}
/**
 * Retrieves the current information of a user.
 * 
 * This function fetches user details such as first name, last name, mobile number, and email
 * based on the user ID provided in the request parameters. It returns a JSON response containing
 * the user's current information.
 * 
 * @param {Object} req - Express request object containing the user ID in the request parameters.
 * @param {Object} res - Express response object used to send back the user's current information.
 * 
 * @returns {Object} JSON response with the user's first name, last name, mobile number, and email.
 * 
 * @throws {Error} Logs and returns an error message if there is a failure in fetching the user information.
 */

export const getUserCurrentInfo = async (req, res) => {
  const user = await User.findById(req.params.id)
  res.status(200).json({
    first_name: user?.first_name,
    last_name: user?.last_name,
    mobile_number: user?.mobile_number,
    email: user?.email
  })
}

/**
 * Changes the address of a user.
 * 
 * @param {Object} req - The request object containing the user ID as a parameter and the new address in the request body.
 * @param {Object} res - The response object to send the result.
 * 
 * Request Body:
 * @param {string} address - The new address of the user.
 * 
 * Response:
 * @returns {Object} - A JSON response indicating success or failure of the request.
 *   If the user is found and the request is successful, a 200 status code is returned
 *   with the updated user object. If an error occurs during the update process, a 500 status code is
 *   returned with an error message.
 */
export const ChangeAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { address } = req.body;
    const user = await User.findByIdAndUpdate(id, { Address: address }, { new: true });
    res.status(200).json(user);
  }
  catch (err) {
    console.log('error in user controller controller', err);
    res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
}

/**
 * Submits a change request from a user.
 * 
 * This function takes the user ID and requested changes from the request body
 * and checks if a change request already exists for the same user ID and status of "Pending".
 * If a change request already exists, a 403 error is returned.
 * If not, a new change request is created and saved to the database.
 * If successful, a 201 status code is returned with a success message.
 * If an error occurs during the process, a 500 status code is returned with an error message.
 * 
 * Request Body:
 * @param {string} userId - The ID of the user submitting the change request.
 * @param {Map} requestedChanges - The requested changes to the user's information.
 * 
 * Response:
 * @returns {Object} - A JSON response indicating success or failure of the request.
 *   If the change request is submitted successfully, a 201 status code is returned
 *   with a success message. If an error occurs during the process, a 500 status code is
 *   returned with an error message.
 */
export const changeRequest = async (req, res) => {
  try {
    const { userId, requestedChanges } = req.body;
    const checkIFRequestExists = await ChangeRequest.findOne({ userId, status: "Pending" });
    if (checkIFRequestExists) {
      return res.status(403).json({ error: "Change request already exists." });
    }
    const newRequest = new ChangeRequest({
      userId,
      requestedChanges,
    });
    await newRequest.save();
    res.status(200).send({ message: "Change request submitted successfully." });
  } catch (error) {
    res.status(500).send({ error: "Failed to submit change request." });
  }
}
/**
 * Submits a request for a workout and diet plan PDF.
 * 
 * This function takes the user ID and requested information from the request body
 * and checks if a request already exists for the same user ID.
 * If a request already exists, a 403 error is returned.
 * If not, a new request is created and saved to the database.
 * If successful, a 200 status code is returned with a success message.
 * If an error occurs during the process, a 500 status code is returned with an error message.
 * 
 * Request Body:
 * @param {string} userId - The ID of the user submitting the request.
 * @param {number} age - The age of the user.
 * @param {string} gender - The gender of the user.
 * @param {number} height - The height of the user.
 * @param {number} bmi - The body mass index of the user.
 * @param {number} weight - The weight of the user.
 * @param {string} fitnessGoal - The fitness goal of the user.
 * @param {string} email - The email of the user.
 * 
 * Response:
 * @returns {Object} - A JSON response indicating success or failure of the request.
 *   If the request is submitted successfully, a 200 status code is returned
 *   with a success message. If an error occurs during the process, a 500 status code is
 *   returned with an error message.
 */
export const workoutDietPdfRequest = async (req, res) => {
  try {
    const userId = req.params.id
    const userrequest = await UserPlanPdfRequest.findOne({ userId })
    if (userrequest) {
      return res.status(403).json({ error: "Request already exists" })
    }
    const { age, gender, height, bmi, weight, fitnessGoal, email } = req.body
    console.log(userId, req.body)
    const userRequest = new UserPlanPdfRequest({
      userId, age, gender, height, bmi, weight, fitnessGoal, email
    })
    console.log(userRequest)
    await userRequest.save()
    res.status(200).json({ success: "Request has been submitted" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "INTERNAL SERVER ERROR" })
  }
}