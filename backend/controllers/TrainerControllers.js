import Trainer from "../models/Trainer_Model.js";
import nodemailer from "nodemailer";
import { io } from "../socket/socket.js";
import User from "../models/User_Model.js";
import dotenv from "dotenv"
import Razorpay from "razorpay";
dotenv.config()
const TrainerWatcher = Trainer.watch();
TrainerWatcher.on('change', async (change) => {
  io.emit('TrainerChanges', change);
});
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
 * Get all trainers
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * @returns {Promise<void>}
 */
export const GetAllTrainers = async (req, res) => {
  try {
    const allTrainers = await Trainer.find();
    res.status(200).json(allTrainers);
  }
  catch (err) {
    console.log(err)
  }
}
/**
 * Updates the salary of a trainer.
 *
 * @param {Object} req - Express request object containing the trainer ID in the parameters and the new salary in the body.
 * @param {Object} res - Express response object used to send back the success message upon successful update.
 *
 * @returns {Promise<void>}
 */
export const UpdateTrainerSalary = async (req, res) => {
  try {
    const { TrainerId } = req.params;
    const { salary } = req.body;
    const trainer = await Trainer.findById(TrainerId);
    trainer.salary = salary;
    await trainer.save();
    res.status(200).json({ message: "Salary updated successfully" });
  }
  catch (err) {
    console.log(err)
  }
}

/**
 * Updates the status of a trainer assignment.
 * Searches for a trainer with the specified trainer ID and assignment with the specified member ID, start date, end date, and extra payment.
 * Updates the AdminActions field of the assignment with the provided AdminActions value.
 * If successful, returns a success message with the updated trainer.
 * If the trainer or assignment is not found, a 404 error is returned.
 * Catches and logs any errors encountered during the process.
 * @param {Object} req - The request object containing the trainer ID, member ID, start date, end date, extra payment, and AdminActions in the request body.
 * @param {Object} res - The response object used to send back the success message or error message.
 * @returns {Promise<void>}
 */
export const handleUpdateStatus = async (req, res) => {
  const { trainerId, memberId, startDate, endDate, extra_payment, AdminActions } = req.body;

  try {
    const trainer = await Trainer.findOneAndUpdate(
      {
        _id: trainerId,
        "trainers_assigned": {
          $elemMatch: {
            memberId: memberId,
            extra_payment: Number(extra_payment),
            start_date: startDate,
            end_date: endDate,
          },
        },
      },
      { $set: { "trainers_assigned.$.AdminActions": AdminActions } },
      { new: true }
    );

    if (trainer) {
      res.status(200).json({ message: "Status updated successfully", trainer });
    } else {
      res.status(404).json({ message: "Trainer or assignment not found" });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
/**
 * Adds a new trainer request from a user to the specified trainer.
 * Checks if a request already exists for the same trainerId and memberId.
 * If a request already exists, a 400 error is returned.
 * If not, the request is added to the trainer's assigned list.
 * If successful, returns a success message with the updated trainer.
 * If the trainer is not found, a 404 error is returned.
 * Catches and logs any errors encountered during the process.
 * @param {Object} req - The request object containing the trainer ID, member ID, start date, end date, member name, member email, and member contact in the request body.
 * @param {Object} res - The response object used to send back the success message or error message.
 * @returns {Promise<void>}
 */
export const RequestFromUserForTrainer = async (req, res) => {
  const { trainerId, memberId, startDate, endDate, memberName, memberEmail, memberContact } = req.body;

  try {
    // Check if a request already exists for the same trainerId and memberId
    const existingRequest = await Trainer.findOne({
      _id: trainerId,
      "trainers_assigned": { $elemMatch: { memberId: memberId } },
    });
    const AlreadyAssigned = await Trainer.findOne({
      _id: trainerId,
      "trainers_assigned": { $elemMatch: { paidByUser: true, memberId: memberId, AdminActions: "ASSIGNED" } },
    })
    if (AlreadyAssigned) { return res.status(400).json({ message: "YOU HAVE ALREADY BEEN ASSIGNED TO THIS TRAINER" }) }
    else if (existingRequest) {
      // If a request already exists, send an error message
      return res.status(400).json({ message: "REQUEST ALREADY SENT TO ADMIN" });
    }
    const trainer = await Trainer.findOneAndUpdate(
      { _id: trainerId },
      {
        $push: {
          trainers_assigned: {
            memberId,
            memberName,
            memberContact,
            memberEmail,
            start_date: startDate,
            end_date: endDate,
            extra_payment: 0,
            _id: trainerId,
          },
        },
      },
      { new: true } // Return the updated trainer
    );

    if (trainer) {
      res.status(200).json({ message: "Trainer request added successfully", trainer });
    } else {
      res.status(404).json({ message: "Trainer not found" });
    }
  } catch (err) {
    console.error("Error adding trainer request:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

const sendShiftUpdateMail = async (trainerEmail, trainerName, day, time) => {
  // Email Content
  const emailContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <img src="https://firebasestorage.googleapis.com/v0/b/code-execution-engine.appspot.com/o/Fitnest.jpg?alt=media&token=c640c29b-1021-4717-b034-24c774010cc3" alt="Fit Nest" style="width: 120px;" />
      </div>
      <h2 style="color: #4caf50; text-align: center; margin-top: 20px;">Shift Assignment Notification</h2>
      <p style="font-size: 16px; text-align: center; color:black">Hi <strong>${trainerName}</strong>,</p>
      <p style="font-size: 16px; text-align: center; color:black">
        We are pleased to inform you that your shift has been <strong>assigned/updated</strong> to the following schedule:
      </p>
      <ul style="font-size: 16px; text-align: center; list-style-type: none; padding: 0;">
        <li><strong>Day:</strong> ${day}</li>
        <li><strong>Time:</strong> ${time}</li>
      </ul>
      <p style="font-size: 16px; text-align: center; color:black">
        Thank you for your dedication and commitment. If you have any questions regarding your shift, feel free to contact us.
      </p>
      <p style="text-align: center; font-size: 16px; color: #4caf50;">Cheers, <br/> The Fit Nest Team</p>
    </div>
  `;

  // Email Options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: trainerEmail,
    subject: `Shift Assigned/Updated to ${day}, ${time}`,
    html: emailContent,
  };

  // Send Email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending shift update email:', error);
  }
};

const sendEmailShiftRemove = async (trainerName, trainerEmail, day, time) => {
  // Email Content
  const emailContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <img src="https://firebasestorage.googleapis.com/v0/b/code-execution-engine.appspot.com/o/Fitnest.jpg?alt=media&token=c640c29b-1021-4717-b034-24c774010cc3" alt="Fit Nest" style="width: 120px;" />
      </div>
      <h2 style="color: #ff6b6b; text-align: center; margin-top: 20px;">Shift Removal Notification</h2>
      <p style="font-size: 16px; text-align: center; color:black">Hi <strong>${trainerName}</strong>,</p>
      <p style="font-size: 16px; text-align: center; color:black">
        We regret to inform you that your scheduled shift on <strong>${day}</strong> at <strong>${time}</strong> has been removed.
      </p>
      <p style="font-size: 16px; text-align: center; color:black">Thank you for your understanding.</p>
      <p style="text-align: center; font-size: 16px; color: #4caf50;">Cheers, <br/> The Fit Nest Team</p>
    </div>
  `;

  // Email Options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: trainerEmail,
    subject: `Shift Removal Notification for ${day} at ${time}`,
    html: emailContent,
  };

  // Send Email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending shift removal email:', error);
  }
};

const sendMailAfterRefund = async (trainerEmail, trainerName, amount, userName, userEmail, startDate, endDate) => {
  // Email to Trainer
  const trainerEmailContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <img src="https://firebasestorage.googleapis.com/v0/b/code-execution-engine.appspot.com/o/Fitnest.jpg?alt=media&token=c640c29b-1021-4717-b034-24c774010cc3" alt="Fit Nest" style="width: 120px;" />
      </div>
      <h2 style="color: #ff6b6b; text-align: center; margin-top: 20px;">Assignment Removed</h2>
      <p style="font-size: 16px; text-align: center; color:black">Hi <strong>${trainerName}</strong>,</p>
      <p style="font-size: 16px; text-align: center; color:black">
        Your assignment as a personal trainer for <strong>${userName}</strong> from <strong>${new Date(startDate).toLocaleDateString()}</strong> to <strong>${new Date(endDate).toLocaleDateString()}</strong> has been removed. We regret any inconvenience caused.
      </p>
      <p style="font-size: 16px; text-align: center; color:black">Thank you for your understanding.</p>
      <p style="text-align: center; font-size: 16px; color: #4caf50;">Cheers, <br/> The Fit Nest Team</p>
    </div>
  `;

  // Email to User
  const userEmailContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <img src="https://firebasestorage.googleapis.com/v0/b/code-execution-engine.appspot.com/o/Fitnest.jpg?alt=media&token=c640c29b-1021-4717-b034-24c774010cc3" alt="Fit Nest" style="width: 120px;" />
      </div>
      <h2 style="color: #ff6b6b; text-align: center; margin-top: 20px;">Trainer Assignment Removed</h2>
      <p style="font-size: 16px; text-align: center; color:black">Hi <strong>${userName}</strong>,</p>
      <p style="font-size: 16px; text-align: center; color:black">
        Your assignment with the personal trainer <strong>${trainerName}</strong> has been removed. The assigned dates were from <strong>${new Date(startDate).toLocaleDateString()}</strong> to <strong>${new Date(endDate).toLocaleDateString()}</strong>.
      </p>
      <p style="font-size: 16px; text-align: center; color:black">
        We sincerely apologize for the inconvenience caused. You have been refunded 100% of the payment amount: <strong>₹${amount}</strong>.
      </p>
      <p style="font-size: 16px; text-align: center; color:black">Thank you for your patience and understanding.</p>
      <p style="text-align: center; font-size: 16px; color: #4caf50;">Cheers, <br/> The Fit Nest Team</p>
    </div>
  `;

  // Send emails
  try {
    // Email to Trainer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: trainerEmail,
      subject: `ASSIGNMENT REMOVED: ${userName}`,
      html: trainerEmailContent,
    });
    // Email to User
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Trainer Assignment Removed & Refund Processed`,
      html: userEmailContent,
    });
  } catch (error) {
    console.error('Error sending emails:', error);
  }
};

const sendApproveConfirmationMail = async (trainerEmail, trainerName, userName, userContact, userEmail, startDate, endDate, extraPayment) => {
  const trainerEmailContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <img src="https://firebasestorage.googleapis.com/v0/b/code-execution-engine.appspot.com/o/Fitnest.jpg?alt=media&token=c640c29b-1021-4717-b034-24c774010cc3" alt="Fit Nest" style="width: 120px;" />
      </div>
      <h2 style="color: #4caf50; text-align: center; margin-top: 20px;">You Have Been Assigned a Personal Training Client</h2>
      <p style="font-size: 16px; text-align: center; color:black">Hi <strong>${trainerName}</strong>,</p>
      <p style="font-size: 16px; text-align: center; color:black">We are pleased to inform you that you have been assigned as a personal trainer to <strong>${userName}</strong>. Below are the details:</p>
      
      <ul style="font-size: 16px; color:black; list-style-type: none; padding: 0; text-align: left;">
        <li><strong>Client Name:</strong> ${userName}</li>
        <li><strong>Contact:</strong> ${userContact}</li>
        <li><strong>Email:</strong> ${userEmail}</li>
        <li><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</li>
        <li><strong>End Date:</strong> ${new Date(endDate).toLocaleDateString()}</li>
        <li><strong>Extra Payment:</strong> ₹${extraPayment}</li>
      </ul>
      
      <p style="margin-top: 30px; font-size: 16px; text-align: center;color:black">We look forward to your exceptional training services!</p>
      <p style="text-align: center; font-size: 16px; color: #4caf50;">Cheers, <br/> The Fit Nest Team</p>
    </div>
  `;

  const userEmailContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <img src="https://firebasestorage.googleapis.com/v0/b/code-execution-engine.appspot.com/o/Fitnest.jpg?alt=media&token=c640c29b-1021-4717-b034-24c774010cc3" alt="Fit Nest" style="width: 120px;" />
      </div>
      <h2 style="color: #4caf50; text-align: center; margin-top: 20px;">Your Personal Trainer Has Been Assigned</h2>
      <p style="font-size: 16px; text-align: center; color:black">Hi <strong>${userName}</strong>,</p>
      <p style="font-size: 16px; text-align: center;color:black">Your requested personal trainer has been approved and assigned. Below are the details:</p>
      
      <ul style="font-size: 16px; color:black; list-style-type: none; padding: 0; text-align: left;">
        <li><strong>Trainer Name:</strong> ${trainerName}</li>
        <li><strong>Email:</strong> ${trainerEmail}</li>
        <li><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</li>
        <li><strong>End Date:</strong> ${new Date(endDate).toLocaleDateString()}</li>
      </ul>
      
      <p style="margin-top: 30px; font-size: 16px; text-align: center;color:black">We wish you great success on your fitness journey!</p>
      <p style="text-align: center; font-size: 16px; color: #4caf50;">Cheers, <br/> The Fit Nest Team</p>
    </div>
  `;

  try {
    // Sending email to the trainer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: trainerEmail,
      subject: `YOU HAVE BEEN ASSIGNED AS A PERSONAL TRAINER TO ${userName}`,
      html: trainerEmailContent,
    });
    // Sending email to the user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Your Requested Personal Trainer Has Been Assigned`,
      html: userEmailContent,
    });
  } catch (error) {
    console.error('Error sending emails:', error);
  }
};

/**
 * Updates a trainer's shift in the database.
 *
 * This function takes a trainer id and an array of shift objects as input and
 * updates the trainer's shift in the database. The function returns a JSON response
 * with a message indicating whether the operation was successful or not. If the
 * operation is successful, the response will also include the updated trainer object.
 *
 * @param {string} req.params.TrainerId - The id of the trainer whose shift is to be updated.
 * @param {object} req.body - The request body containing the shift data.
 * @param {array} req.body.shift - An array of shift objects, each containing a day and time.
 *
 * @returns {object} A JSON response object with a message indicating the result of the operation.
 */
export const UpdateTrainerShift = async (req, res) => {
  try {
    const { TrainerId } = req.params;
    const { shift } = req.body;

    // Validate input
    if (!shift || !Array.isArray(shift)) {
      return res.status(400).json({ message: "Invalid shift data provided." });
    }

    // Fetch the trainer from the database
    const trainer = await Trainer.findById(TrainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found." });
    }

    // Loop through the shift array to check if the shift already exists
    shift.forEach(newShift => {
      const isShiftExist = trainer.shift.some(existingShift =>
        existingShift.day === newShift.day && existingShift.time === newShift.time
      );

      // If the shift doesn't exist, push it to the trainer's shift array
      if (!isShiftExist) {
        trainer.shift.push(newShift);
      }
    });
    // Save the changes
    await trainer.save();
    // await handleSendEmail(trainer.email, "Shift Updated", `Your shift has been updated to ${shift[0].day} at ${shift[0].time}`);
    sendShiftUpdateMail(trainer.email, trainer.trainer_name, shift[0].day, shift[0].time);
    res.status(200).json({ message: "Shift updated successfully", trainer });
  } catch (err) {
    console.error("Error updating shift:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
/**
 * Removes a shift from a trainer's document.
 * @param {string} req.params.TrainerId - The ID of the trainer to remove the shift from.
 * @param {object} req.body - An object containing the day and time of the shift to remove.
 * @param {string} req.body.day - The day of the shift to remove.
 * @param {string} req.body.time - The time of the shift to remove.
 *
 * @returns {object} A JSON response object with a message indicating the result of the operation.
 */
export const RemoveTrainerShift = async (req, res) => {
  try {
    const { TrainerId } = req.params;
    const { day, time } = req.body;
    const trainer = await Trainer.findById(TrainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found." });
    }
    // Filter out the shift that matches both day and time
    trainer.shift = trainer.shift.filter(s => !(s.day === day && s.time === time));
    // Save the updated trainer document
    const updatedTrainer = await trainer.save();
    sendEmailShiftRemove(trainer.trainer_name, trainer.email, day, time);
    res.status(200).json({ message: "Shift removed successfully", trainer: updatedTrainer });
  } catch (err) {
    console.error("Error removing shift:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

/**
 * Updates a trainer's availability status.
 * @param {string} req.params.TrainerId - The ID of the trainer to update.
 * @param {object} req.body - An object containing the updated availability status.
 * @param {boolean} req.body.availability - The new availability status.
 *
 * @returns {object} A JSON response object with a message indicating the result of the operation.
 */
export const UpdateTrainerAvailability = async (req, res) => {
  try {
    const { TrainerId } = req.params;
    const { availability } = req.body;
    const trainer = await Trainer.findById(TrainerId);
    trainer.availability = availability;
    await trainer.save();
    res.status(200).json({ message: "Availability updated successfully" });
  }
  catch (err) {
    console.log(err)
  }
}

/**
 * Updates a trainer's rating based on the rating provided in the request body.
 * The trainer is identified by the TrainerId parameter in the request URL.
 * The user providing the rating is identified by the UserId parameter in the request URL.
 * If the user has already rated the trainer, the rating is updated.
 * If not, a new rating is added to the trainer's ratings array.
 * The function returns a JSON response with a message indicating the result of the operation.
 * If the operation is successful, the response will also include the updated trainer object.
 *
 * @param {string} req.params.TrainerId - The ID of the trainer to rate.
 * @param {string} req.params.UserId - The ID of the user providing the rating.
 * @param {object} req.body - The request body containing the rating data.
 * @param {number} req.body.rating - The rating value to be updated.
 *
 * @returns {object} A JSON response object with a message indicating the result of the operation.
 */
export const RateTrainer = async (req, res) => {
  try {
    const { TrainerId, UserId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 0 || rating > 5) {
      return res.status(400).json({ message: "Invalid rating value." });
    }

    const trainer = await Trainer.findById(TrainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found." });
    }

    // Check if the user has already rated
    const existingRating = trainer.ratings.find(
      (r) => r.UserId.toString() === UserId
    );

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
    } else {
      // Add new rating
      trainer.ratings.push({ UserId, rating });
    }

    await trainer.save();
    res.status(200).json({ message: "Rating updated successfully", trainer });
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
/**
 * Approves a trainer request sent by a user.
 * The trainer is identified by the trainerId parameter in the request URL.
 * The member is identified by the memberId parameter in the request URL.
 * The function updates the AdminActions field of the assigned trainer with the ASSIGNED status.
 * If the operation is successful, the response will include the updated trainer object.
 *
 * @param {string} req.params.trainerId - The ID of the trainer to approve.
 * @param {string} req.params.memberId - The ID of the member who sent the request.
 * @param {object} req.body - The request body containing the approval data.
 * @param {string} req.body.AdminActions - The status of the assignment (ASSIGNED, NOT-ASSIGNED, PENDING, REQUEST-TO-PAY).
 * @param {string} req.body.name - The name of the member who sent the request.
 * @param {string} req.body.email - The email address of the member who sent the request.
 * @param {string} req.body.contact - The contact number of the member who sent the request.
 * @param {string} req.body.startDate - The start date of the assignment.
 * @param {string} req.body.endDate - The end date of the assignment.
 * @param {number} req.body.extra_payment - The extra payment to be made to the trainer.
 *
 * @returns {object} A JSON response object with the updated trainer object.
 */
export const ApproveByAdmin = async (req, res) => {
  const { trainerId, memberId } = req.params;
  const { AdminActions, name, email, contact, startDate, endDate, extra_payment } = req.body;
  console.log(trainerId, memberId, AdminActions, name, email, contact, startDate, endDate, extra_payment);
  try {

    // Find the trainer and update the assigned trainer's AdminActions
    const trainer = await Trainer.findOneAndUpdate(
      {
        // _id: trainerId,
        "trainers_assigned": {
          $elemMatch: {
            memberId: memberId,
            memberName: name,
            memberEmail: email,
            memberContact: contact,
            start_date: startDate,
            end_date: endDate,
            AdminActions: "REQUEST-TO-PAY",
            paidByUser: true,
            // extra_payment:extra_payment,
          },
        },
      },
      {
        $set: {
          "trainers_assigned.$.AdminActions": 'ASSIGNED', // Update the AdminActions field
          "trainers_assigned.$._id": trainerId,
        },
      },
      { new: true } // Return the updated trainer
    );

    if (trainer) {
      sendApproveConfirmationMail(trainer.email, trainer.trainer_name, name, contact, email, startDate, endDate, extra_payment);
      res.status(200).json({ message: "Trainer approved successfully", trainer });
    } else {
      res.status(404).json({ message: "Trainer or assigned member not found" });
    }
  } catch (err) {
    console.log(err)
    console.error("Error approving trainer:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
/**
 * Removes a trainer from a member's assigned trainers.
 * The trainer is identified by the trainerId parameter in the request URL.
 * The member is identified by the memberId parameter in the request URL.
 * If the operation is successful, the response will include the updated trainer object.
 * If the trainer or member is not found, a 404 error is returned.
 * If an error occurs during the process, a 500 error is returned.
 *
 * @param {string} req.params.trainerId - The ID of the trainer to remove.
 * @param {string} req.params.memberId - The ID of the member to remove the trainer from.
 *
 * @returns {object} A JSON response object with the updated trainer object.
 */
export const removeTrainerFromMember = async (req, res) => {
  const { trainerId, memberId } = req.params;
  try {
    // Validate the required fields
    if (!trainerId || !memberId) {
      return res.status(400).json({ message: 'Trainer and member IDs are required.' });
    }
    // Find the trainer to update the assigned trainer's list
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found.' });
    }
    // Find the member to update the trainer reference
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found.' });
    }
    // Find the assignment in the trainer's trainers_assigned array
    const assignmentIndex = trainer.trainers_assigned.findIndex(
      (assignment) => assignment.memberId.toString() === memberId
    );
    if (assignmentIndex === -1) {
      return res.status(404).json({ message: 'Trainer not assigned to this member.' });
    }
    // Remove the assignment from the trainer's trainers_assigned array
    trainer.trainers_assigned.splice(assignmentIndex, 1);
    // Save the updated trainer
    await trainer.save();
    res.status(200).json(trainer);
  } catch (error) {
    console.error('Error removing trainer:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
/**
 * Processes a refund for a given payment using the Razorpay payment gateway.
 *
 * This function attempts to refund the specified amount for the provided payment ID.
 * The refund amount is converted to paise before processing.
 * In case of an error during the refund process, it logs the error to the console.
 *
 * @param {string} paymentId - The ID of the payment to refund.
 * @param {number} amount - The amount to refund, in currency units.
 */
const requestRefund = async (paymentId, amount) => {
  try {
    // Assuming Razorpay as the payment gatewa
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100, // Amount in paise (₹1 = 100 paise)
    });
    if (refund.status === 'processed') {
      return true;
    }
  } catch (error) {
    console.error("Refund Error:", error);
    return false;
  }
}
/**
 * Processes a refund for a given payment using the Razorpay payment gateway
 * and removes the assigned trainer from the trainer's trainers_assigned array.
 *
 * This function first processes the refund using the `requestRefund` function.
 * If the refund is successful, it then removes the assigned trainer from the
 * trainer's trainers_assigned array using the `findOneAndUpdate` method.
 * If an error occurs during the refund process, it logs the error to the console.
 *
 * @param {string} trainerId - The ID of the trainer to remove.
 * @param {string} memberId - The ID of the member to remove the trainer from.
 * @param {string} paymentId - The ID of the payment to refund.
 * @param {number} amount - The amount to refund, in currency units.
 *
 * Response:
 * @returns {Object} - A JSON response indicating success or failure of the
 *   refund and removal of the trainer. If the trainer is found and the refund
 *   is successful, a 200 status code is returned with a success message.
 *   If the trainer is not found, a 404 status code is returned with an error
 *   message. If an error occurs during the refund process, a 500 status code
 *   is returned with an error message.
 */
export const RefundAfterPaymentAndRemove = async (req, res) => {
  const { trainerId, memberId } = req.params;
  const { paymentId, amount, userName, userEmail, startDate, endDate } = req.body;

  try {
    // First, process the refund
    const refundStatus = await requestRefund(paymentId, amount);
    if (refundStatus) {
      // Then, remove the assigned trainer
      const trainer = await Trainer.findOneAndUpdate(
        {
          _id: trainerId,
          "trainers_assigned": {
            $elemMatch: {
              memberId: memberId,
              PaymentId: paymentId,
              paidByUser: true,
            }
          }
        },
        {
          $pull: {
            trainers_assigned: {
              memberId: memberId,
              PaymentId: paymentId,
            }
          }
        },
        { new: true } // Return the updated document
      );
      sendMailAfterRefund(trainer.email, trainer.trainer_name, amount, userName, userEmail, startDate, endDate);
      if (trainer) {
        console.log('Trainer removed successfully');
        res.status(200).json({ message: 'Refund processed and trainer removed successfully.' });
      } else {
        console.log('Trainer not found');
        res.status(404).json({ error: 'Trainer not found or conditions not met.' });
      }
    }
    else {
      res.status(404).json({ error: 'Refund failed.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while processing the refund and removing the trainer.' });
  }
}
/**
 * Requests payment from a user for a trainer. Updates the trainer's trainers_assigned array
 * by setting the AdminActions field to "REQUEST-TO-PAY", the start_date and end_date fields
 * to the given dates, and the extra_payment field to the given amount.
 *
 * @param {string} trainerId - The ID of the trainer to request payment for.
 * @param {string} memberId - The ID of the member to request payment from.
 * @param {string} AdminActions - The AdminActions field to set (must be "REQUEST-TO-PAY").
 * @param {string} name - The name of the member to request payment from.
 * @param {string} email - The email of the member to request payment from.
 * @param {string} contact - The contact number of the member to request payment from.
 * @param {string} startDate - The start date of the assignment.
 * @param {string} endDate - The end date of the assignment.
 * @param {number} extra_payment - The extra payment to request from the user.
 *
 * Response:
 * @returns {Object} - A JSON response indicating success or failure of the request.
 *   If the trainer is found and the request is successful, a 200 status code is returned
 *   with the updated trainer object. If the trainer is not found, a 404 status code is returned
 *   with an error message. If an error occurs during the update process, a 500 status code is
 *   returned with an error message.
 */
export const requestForPayFromUser = async (req, res) => {
  const { trainerId, memberId } = req.params;
  const { AdminActions, name, email, contact, startDate, endDate, extra_payment } = req.body;
  console.log(trainerId, memberId, AdminActions, name, email, contact, startDate, endDate, extra_payment);
  try {
    const trainer = await Trainer.findOneAndUpdate(
      {
        // _id: trainerId,
        "trainers_assigned": {
          $elemMatch: {
            memberId: memberId,
            memberName: name,
            memberEmail: email,
            memberContact: contact,
            start_date: null,
            end_date: null,
            AdminActions: "PENDING",
            paidByUser: false,
            // extra_payment:0 || extra_payment,
          },
        },
      },
      {
        $set: {
          "trainers_assigned.$.AdminActions": 'REQUEST-TO-PAY', // Update the AdminActions field
          "trainers_assigned.$.start_date": startDate, // Update the start_date field
          "trainers_assigned.$.end_date": endDate, // Update the end_date field
          "trainers_assigned.$.extra_payment": Number(extra_payment),
          "trainers_assigned.$._id": trainerId,
        },
      },
      { new: true } // Return the updated trainer
    );

    if (trainer) {
      console.log('Trainer approved successfully');
      res.status(200).json({ message: "Trainer approved successfully", trainer });
    } else {
      console.log('Trainer or assigned member not found');
      res.status(404).json({ message: "Trainer or assigned member not found" });
    }
  } catch (err) {
    console.log(err)
    console.error("Error approving trainer:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
/**
 * @api {get} /api/Trainer/GetAssignedTrainers/:TrainerId
 * @apiName Get all assigned trainers
 * @apiGroup Trainer
 * @apiDescription Get all assigned trainers for a given trainer
 * @apiPermission authenticated
 * @apiParam {string} TrainerId - The ID of the trainer to fetch assigned trainers for
 * @apiSuccess {Object[]} trainers_assigned - An array of assigned trainers
 * @apiSuccess {string} trainers_assigned.memberId - The ID of the member assigned to the trainer
 * @apiSuccess {string} trainers_assigned.memberName - The name of the member assigned to the trainer
 * @apiSuccess {string} trainers_assigned.memberContact - The contact number of the member assigned to the trainer
 * @apiSuccess {string} trainers_assigned.memberEmail - The email of the member assigned to the trainer
 * @apiSuccess {string} trainers_assigned.start_date - The start date of the assignment
 * @apiSuccess {string} trainers_assigned.end_date - The end date of the assignment
 * @apiSuccess {number} trainers_assigned.extra_payment - The extra payment requested from the member
 * @apiError {Object} 404 - The trainer or assigned member was not found
 * @apiError {Object} 500 - An error occurred while fetching trainers
 */
export const GetAllAssignedTrainers = async (req, res) => {
  try {
    const { TrainerId } = req.params;

    // Find the trainer by TrainerId
    const trainer = await Trainer.findById(TrainerId);

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Check if trainers_assigned field exists and is not empty
    if (!trainer.trainers_assigned || trainer.trainers_assigned.length === 0) {
      return res.status(200).json({ message: "No trainers assigned", trainers_assigned: [] });
    }

    // Return the trainers_assigned array
    res.status(200).json({ trainers_assigned: trainer.trainers_assigned });
  } catch (err) {
    console.error("Error fetching assigned trainers:", err);
    res.status(500).json({ message: "An error occurred while fetching trainers" });
  }
};


/**
 * Retrieves trainers assigned to a specific user.
 * The user is identified by the userId parameter in the request URL.
 * If successful, the response will include an array of trainers assigned to the user, 
 * each populated with the assigned details.
 * If an error occurs, it will be logged to the console.
 *
 * @param {Object} req - The request object containing the user ID in params.
 * @param {Object} res - The response object used to send back the list of assigned trainers.
 * @returns {Promise<void>}
 */

export const TrainersAssignedToUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const trainers = await Trainer.find({
      "trainers_assigned.memberId": userId,
    }).populate("trainers_assigned")
    res.status(200).json(trainers);
  }
  catch (err) {
    console.log(err)
  }
}
/**
 * @api {get} /api/Trainer/AllMails
 * @apiName Get all trainer emails
 * @apiGroup Trainer
 * @apiDescription Get all trainer emails
 * @apiPermission authenticated
 * @apiSuccess {Object[]} trainers - An array of trainers
 * @apiSuccess {string} trainers.email - The email of the trainer
 * @apiSuccess {string} trainers.trainer_name - The name of the trainer
 * @apiError {Object} 500 - An error occurred while fetching emails
 */
export const GetAllTrainersMails = async (req, res) => {
  try {
    const trainers = await Trainer.find({}).select("email trainer_name");
    res.status(200).json(trainers);
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ message: "Error fetching emails", error });
  }
}
/**
 * Creates a new trainer in the database.
 * 
 * This function checks if a trainer with the same name and contact already exists.
 * If the trainer exists, it returns a message indicating the trainer already exists.
 * Otherwise, it creates a new trainer with the details provided in the request body.
 * 
 * @param {Object} req - The request object containing the trainer details in the body.
 * @param {Object} res - The response object used to send back the created trainer or an error message.
 * 
 * @returns {Object} A JSON response object with the newly created trainer or a message indicating
 *                   the trainer already exists.
 */

export const CreateTrainer = async (req, res) => {
  try {
    // console.log()
    const existingTrainer = await Trainer.findOne({ trainer_name: req.body.trainer_name, trainer_contact: req.body.trainer_contact });
    if (existingTrainer) {
      console.log("Trainer already exists");
      return res.status(200).json({ message: "Trainer already exists" });
    }
    const trainer = new Trainer(req.body);
    await trainer.save();
    res.status(200).json(trainer);
  }
  catch (err) {
    console.log(err)
  }
}

/**
 * Deletes a trainer from the database.
 * @param {Object} req - The request object containing the TrainerID parameter.
 * @param {Object} res - The response object used to send back the deleted trainer or an error message.
 * @returns {Object} A JSON response object with the deleted trainer or a message indicating the trainer was not found.
 */
export const deleteTrainer = async (req, res) => {
  try {
    const { TrainerID } = req.params;
    const trainer = await Trainer.findByIdAndDelete(TrainerID);
    console.log(trainer);
    res.status(200).json(trainer);
  }
  catch (err) {
    console.log(err)
  }
}