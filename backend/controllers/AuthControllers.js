import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateTokens.js";
import User from "../models/User_Model.js";
import nodemailer from 'nodemailer';
import crypto from "crypto";
import OtpModel from "../models/OTP_MODEL.js";
import dotenv from "dotenv"
dotenv.config()
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
/**
 * Sends an OTP code to the specified email address via email.
 * @param {string} email The email address to send the OTP code to.
 * @param {string} otp The OTP code to send.
 * @throws {Error} If there is an error sending the email.
 */
const sendOtpEmail = async (email, otp, reason) => {
  const isNewRegistration = reason === "FOR NEW USER REGISTRATION";
  const subject = isNewRegistration
    ? "Your OTP for Setting New Password"
    : "Your OTP for Password Reset";
  const bodyContent = isNewRegistration
    ? `Your OTP for setting a new password is <strong>${otp}</strong>.`
    : `Your OTP for resetting your password is <strong>${otp}</strong>.`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <img src="https://firebasestorage.googleapis.com/v0/b/code-execution-engine.appspot.com/o/Fitnest.jpg?alt=media&token=c640c29b-1021-4717-b034-24c774010cc3" alt=" Fit Nest" style="width: 120px;" />
      </div>
      
      <h2 style="color: #4caf50; text-align: center; margin-top: 20px;">Your OTP Code</h2>
      <p style="font-size: 16px; text-align: center; color:black">Dear User,</p>
      <p style="font-size: 16px; text-align: center; color:black">${bodyContent}</p>
      
      <p style="margin-top: 30px; font-size: 16px; text-align: center; color:black">This OTP is valid for the next 15 minutes. Please do not share it with anyone.</p>
      <p style="text-align: center; font-size: 16px; color: #4caf50;">Cheers, <br/> The Fit Nest Team</p>

      <div style="margin-top: 30px; text-align: center; font-size: 14px; color: #999;">
        <p>If you have any questions, please contact us at <a href="mailto:fitnest.patna@gmail.com" style="color: #4caf50; text-decoration: none;">fitnest.patna@gmail.com</a>.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};


/**
 * Checks if an email exists in the database and determines if the user is an admin.
 *
 * This function takes an email from the request body, queries the User database 
 * to check if a user with that email exists, and returns a JSON response indicating 
 * whether the email exists and if the user is an admin.
 *
 * @param {Object} req - Express request object containing the email in the request body.
 * @param {Object} res - Express response object used to send back the existence and admin status.
 * @returns {Object} JSON response with two properties: 
 *                   - exists: a boolean indicating if the email exists.
 *                   - isAdmin: a boolean indicating if the user is an admin.
 */

export const CheckMail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ exists: false, isAdmin: false ,Status:'NOT-FOUND'});
    let membershipStatus = 'null';
    let passwordField='null';
    if (user?.membership_details) {
      if(!user?.password){
        console.log("Password is null")
        passwordField='null';
      }
      else if(user?.password){
        console.log("Password is not null")
        passwordField='not-null';
      }
      const currentDate = new Date();
      if (user?.membership_details.end_date < currentDate) {
        membershipStatus = "Expired";
      } else {
        membershipStatus = "Active";
      }
    }
    if (user?.isAdmin === false) {
      return res.json({
        exists: true,
        isAdmin: false,
        Status:membershipStatus,
        passwordField:passwordField
      });
    }
    if (user?.isAdmin === true) {
      return res.json({
        exists: true,
        isAdmin: true,
        Status:'ADMIN'
      });
    }
    // Fallback response
    res.json({ exists: false, isAdmin: false,Status:'NOT-FOUND' });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const SaveNewPassword=async(req,res)=>{
  try{
   const {email,password}=req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    user.password = hashPassword;
    await user.save();
    res.json({ message: "New Password set successfully" ,success:true});
  }
  catch(err){
    console.log(err);
  }
}
/**
 * Sends a One-Time Password (OTP) to the specified email address.
 * Generates a 6-digit OTP, hashes it, and saves it to the OtpModel.
 * Sends the plain OTP to the user via email.
 * Returns a success response if the OTP is sent successfully, or an error response if there is an issue.
 * @param {Object} req - Express request object containing the email and reason in the request body.
 * @param {Object} res - Express response object used to send back the response.
 * @returns {Promise<void>}
 */
export const SendOTP = async (req, res) => {
  const { email, reason } = req.body;

  try {
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
    const saltRounds = 10;

    // Hash the OTP
    const hashedOtp = await bcrypt.hash(otp, saltRounds);

    // Save hashed OTP to OtpModel
    await OtpModel.updateOne(
      { email },
      { email, otp: hashedOtp },
      { upsert: true } // Create or update OTP entry
    );

    // Send plain OTP via email
    await sendOtpEmail(email, otp, reason);

    res.json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};
/**
 * Verifies a One-Time Password (OTP) for a given email.
 *
 * This function checks if the provided OTP matches the one stored in the database for the given email.
 * If the OTP is valid, it deletes the OTP entry from the database and sends a success response.
 * If the OTP is invalid or expired, it returns an error response.
 *
 * @param {Object} req - Express request object containing the email and OTP in the request body.
 * @param {Object} res - Express response object used to send back the verification result.
 * 
 * @returns {Object} JSON response indicating whether the OTP was verified successfully.
 * 
 * @throws {Error} Logs and returns an error message if OTP verification fails.
 */

export const VerifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ verified: false, error: "Email and OTP are required." });
    }

    // Find OTP entry in the database
    const otpEntry = await OtpModel.findOne({ email });
    if (!otpEntry) {
      return res.status(400).json({ verified: false, error: "Invalid or expired OTP." });
    }

    // Verify the OTP
    const isOtpValid = await bcrypt.compare(otp, otpEntry.otp); // Compare hashed OTP
    if (!isOtpValid) {
      return res.status(400).json({ verified: false, error: "Invalid OTP." });
    }

    // Clear OTP after successful verification
    await OtpModel.deleteOne({ email });

    res.json({ verified: true, message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP." });
  }
};
/**
 * Creates a new user account.
 *
 * This function takes in a request object containing the user's first name, last name, email, mobile number, and password.
 * It checks if the user already exists in the database and if not, creates a new user object, hashes the password, and saves the user to the database.
 * If the user already exists, it returns an error response.
 * If the user is created successfully, it generates a JWT token and sets it in the cookie, and sends a success response with the user details.
 *
 * @param {Object} req - Express request object containing the user details in the request body.
 * @param {Object} res - Express response object used to send back the response.
 *
 * @returns {Object} JSON response containing the user details or an error message if the user already exists or the request is invalid.
 *
 * @throws {Error} Logs and returns an error message if unable to save the user to the database.
 */
export const SignUp = async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNumber, password } = req.body;
    // Check if the user already exists (check by email)
    const user = await User.findOne({ email });
    // console.log(user)
    if (user ) {
      return res.status(400).json({ error: "User already exists" });
    }
    const sameMobileNumber = await User.findOne({ mobile_number: mobileNumber});
    if (sameMobileNumber) {
      return res.status(400).json({ error: "Mobile number already exists" });
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    // Create a new user object
    const newUser = new User({
      first_name: firstName,
      last_name: lastName,
      email: email,
      mobile_number: mobileNumber,
      password: hashPassword,
      isAdmin: false,
    });
    // Save the new user to the database
    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        mobile_number: newUser?.mobile_number,
        isAdmin: newUser?.isAdmin,
        membership_details: newUser?.membership_details || {},
        feedback: newUser?.feedback || [],
        Address: newUser?.Address || "",
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
/**
 * This function is used to sign up a new user before payment for a new membership when the user is not a member
 * This function takes the following parameters: firstName, lastName, email, mobileNumber, password and type
 * It checks if the user already exists in the database by email
 * If the user does not exist, it hashes the password and creates a new user object
 * The new user object is then saved to the database
 * If the user is saved successfully, it returns a success message with the user's id
 * If there is an error, it returns an error message with a 400 status code
 */
export const SignUpAfterPaymentForNewMembership = async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNumber, password, type, address } = req.body;
    // Check if the user already exists (check by email)
    const user = await User.findOne({ email });
    if (user && !user?.membership_details===undefined) {
      return res.status(400).json({ error: "User already exists" });
    }
    else if(user && user?.membership_details===undefined){
     return res.status(400).json({ error: "Pay Now to get Membership" });
    }
    const sameMobileNumber = await User.findOne({ mobile_number: mobileNumber});
    if (sameMobileNumber) {
      return res.status(400).json({ error: "Mobile number already exists" });
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    // Create a new user object
    const newUser = new User({
      first_name: firstName,
      last_name: lastName,
      email: email,
      mobile_number: mobileNumber,
      password: hashPassword,
      Address: address,
      isAdmin: false,
    });
    // Save the new user to the database
    if (newUser) {
      // generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      res.status(201).json({ message: "SUCCESS", AuthuserId: newUser._id });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
/**
 * Resets the password for a user using the provided email and new password.
 *
 * This function takes the following parameters: email, newPassword
 * It checks if the user exists in the database by email
 * If the user exists, it hashes the new password and updates the user's password
 * If the password is updated successfully, it returns a success message with a 200 status code
 * If there is an error, it returns an error message with a 500 status code
 *
 * @param {Object} req - Express request object containing the email and new password in the request body.
 * @param {Object} res - Express response object used to send back the response.
 *
 * @returns {Object} JSON response with a success message if the password is reset successfully, or an error message if there is a failure in the process.
 *
 * @throws {Error} Logs and returns an error message if there is a failure in the process.
 */
export const ResetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful." });
  } catch (error) {
    console.log("Error resetting password:", error);
    // console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
/**
 * Logs the user in to the application.
 * 
 * The login function takes an email and a password as arguments and logs
 * the user in to the application. If the login is successful, it will store
 * the user data in local storage and update the authentication context.
 * If the login fails, it will display an error to the user.
 * 
 * @param {string} email The user's email address
 * @param {string} password The user's password
 */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password!" });
    }
    // Compare the entered password with the stored hash
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid email or password!" });
    }
    // Generate token and set it in the cookie
    generateTokenAndSetCookie(user._id, res);
    // Send the response with the user details (excluding password)
    res.status(200).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      isAdmin: user.isAdmin,
      mobile_number: user?.mobile_number,
      feedback: user.feedback,
      membership_details: user.membership_details,
      cart: user.cart,
      Address: user.Address || "",
    });
  } catch (error) {
    console.log("Error in login controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
/**
 * Logs an admin user into the application.
 *
 * This function takes an Express request object containing an email and password
 * in the request body. It verifies the user's credentials and checks if the user
 * has admin privileges. If the credentials are valid and the user is an admin,
 * it generates a JWT token, sets it in a cookie, and sends a response with the
 * user details (excluding the password).
 *
 * @param {Object} req - Express request object containing the email and password in the request body.
 * @param {Object} res - Express response object used to send back the response.
 *
 * @returns {Object} JSON response containing the admin user details or an error message
 * if the credentials are invalid or the user is not an admin.
 *
 * @throws {Error} Logs and returns an error message if there is a failure in the login process.
 */

export const loginAsAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password!" });
    }
    if (user?.isAdmin === false) return res.status(400).json({ error: "You are not an admin!" });
    // Compare the entered password with the stored hash
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid email or password!" });
    }
    // Generate token and set it in the cookie
    generateTokenAndSetCookie(user._id, res);
    // Send the response with the user details (excluding password)
    res.status(200).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      isAdmin: user.isAdmin,
      feedback: user.feedback,
      membership_details: user.membership_details,
      cart: user.cart
    });
  } catch (error) {
    console.log("Error in login controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
/**
 * Logs the user out by removing the JWT cookie and sends a 200 response with
 * a success message. If an error occurs, it returns a 500 response with an
 * error message.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

export const logout = (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 });
    res.status(200).json({ message: "logged out successfully" })
  } catch (error) {
    console.log("error in logout controller")
    res.status(500).json({ error: "internal server error" })
  }
}



/**
 * Changes the user's password using the old password for verification.
 *
 * This function takes the current and new passwords from the request body
 * and verifies the user's identity by comparing the current password with
 * the stored password hash. If the current password is correct, the function
 * hashes the new password and updates the user's password in the database.
 * 
 * @param {Object} req - Express request object containing the current and new passwords in the request body and the user ID in the request parameters.
 * @param {Object} res - Express response object used to send back the response.
 *
 * @returns {Object} JSON response with a success message if the password is changed successfully, or an error message for invalid credentials or if the user is not found.
 *
 * @throws {Error} Logs and returns an error message if there is a failure in the process.
 */

export const changePasswordByOldPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user?.password || ""
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid password!" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword
      await user.save()
      return res.status(200).json({ success: "Password changed successfuly" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Internal server error" })
  }
}

/**
 * Changes the user's password using an OTP (One-Time Password) for verification.
 *
 * This function retrieves the user's OTP and new password from the request body
 * and verifies the OTP by checking it against the stored OTP in the database. 
 * If the OTP is valid, it hashes the new password and updates the user's password
 * in the database.
 *
 * @param {Object} req - Express request object containing the OTP, new password, and email in the request body, and user ID in the request parameters.
 * @param {Object} res - Express response object used to send back the response.
 *
 * @returns {Object} JSON response with a success message if the password is changed successfully, or an error message if the OTP is invalid or if there is an internal server error.
 *
 * @throws {Error} Logs and returns an error message if there is a failure in the process.
 */

export const changePasswordByOtp = async (req, res) => {
  try {
    const { otp, newPassword, email } = req.body;

    // Validate input
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required." });
    }

    // Find the user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Get the latest OTP entry for the user
    const latestOtp = await OtpModel.findOne({ email }).sort({ createdAt: -1 });
    if (!latestOtp) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    // Compare the provided OTP with the hashed OTP
    const isOtpValid = await bcrypt.compare(otp, latestOtp.otp);
    if (!isOtpValid) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Clear the OTP entry after successful password change
    await OtpModel.deleteOne({ email });

    res.status(200).json({ success: "Password changed successfully." });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
