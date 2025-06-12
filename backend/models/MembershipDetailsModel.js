import mongoose from "mongoose";
/**
 * Model for the membership plans which will be displayed to the user
 * This model stores the title, price, days and status of the membership plan
 * The status field is used to track whether the plan is active or not
 * The days field is used to track the number of days a user can purchase the membership plan
 * The price field is used to track the cost of the membership plan
 * The title field is used to track the name of the membership plan
 */
const MembershipPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
    },
    discountedPrice: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Export the model
const MembershipPlan = mongoose.model("MembershipPlan", MembershipPlanSchema);

export default MembershipPlan;
