import mongoose from "mongoose";
/**
 * Model for Trainers
 * This model stores the trainer's name, contact, email and salary
 * The trainer's shifts are stored in a separate collection
 * The trainers_assigned field stores the members assigned to the trainer
 * The trainer's email is required and unique
 * The trainer's salary is required and a number
 */
const TrainerSchema = new mongoose.Schema({
  trainer_name: {
    type: String,
    required: true,
  },
  trainer_contact: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  ratings: [
    {
      UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        min: 0,
        max: 5,
      },
    },
  ],
  shift: [
    {
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      time: {
        type: String,
      },
    },

  ],

  availability: {
    type: Boolean,
    default: true,
  },
  joining_date: {
    type: Date,
    default: Date.now,
  },
  profile_picture: {
    type: String,
    default: "",
  },
  trainers_assigned: [
    {
      memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      memberName: {
        type: String,
      },
      memberContact: {
        type: String,
      },
      memberEmail: {
        type: String,
      },
      paidByUser: {
        type: Boolean,
        default: false
      },
      PaymentId: {
        type: String,
        default: ""
      },
      AdminActions: {
        type: String,
        enum: ['ASSIGNED', 'NOT-ASSIGNED', 'PENDING', 'REQUEST-TO-PAY'],
        default: "PENDING"
      },
      start_date: {
        type: Date,
        // required: true,
        default: null,
      },
      end_date: {
        type: Date,
        default: null
      },
      extra_payment: {
        type: Number,
        default: 0,
      },
    },
  ],
});

TrainerSchema.methods.calculateAverageRating = function () {
  if (!this.ratings.length) return 0; // No ratings yet
  const totalRating = this.ratings.reduce((sum, { rating }) => sum + rating, 0);
  return totalRating / this.ratings.length;
};

const Trainer = mongoose.model('Trainer', TrainerSchema);
export default Trainer;