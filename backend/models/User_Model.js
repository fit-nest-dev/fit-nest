// const mongoose = require('mongoose');
import mongoose from "mongoose";
/**
 * Model for storing user data in the database
 * Each user document contains information about the user's first name, last name, mobile number, email, and password.
 * The password field is hashed and salted for security.
 * Each user document also stores the user's membership details, diet plan, workout details, and feedback given.
 * The membership details field stores information about the membership plan the user is subscribed to.
 * The diet plan field stores information about the diet plan the user has selected.
 * The workout details field stores information about the workout plan the user has selected.
 * The feedback field stores an array of feedback messages given by the user.
 */
// Subdocument for Feedback
const FeedbackSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  message: { type: String, required: true },
});

// Subdocument for Membership Details
const MembershipDetailsSchema = new mongoose.Schema({
  membership_id: { type: String, unique: true, required: true,default: Date.now },
  membership_type: {
    type: String, required: true
    , enum: ['Monthly', 'BiMonthly', 'Quarterly', 'Quadrimester', 'SemiAnnual', 'Annual']
  }, //Monthly - 30 days , Bi Monthly 60 days , Quarterly - 90 days Quadrimester - 120 days , Semi Annual 180 days , Annual 360 days
  //this may vary as per the admin's wish as he may change it later
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  status: { type: String, required: true },
  PaidByUser: { type: Boolean, default: true },
});
const UserSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  mobile_number: { type: String, unique: true, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  isAdmin: { type: Boolean, default: false },
  membership_details: MembershipDetailsSchema, // Single Membership
  diet_plan: { type: mongoose.Schema.Types.ObjectId, ref: 'DietPlan' }, // Reference to DietPlan model
  workout_details: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan' }, // Reference to WorkoutPlan model
  feedback: [FeedbackSchema], // Array of feedback subdocuments
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  Address: { type: String },
});

// module.exports = mongoose.model('User', UserSchema);
const User = mongoose.model('User', UserSchema);
export default User;