
import mongoose from 'mongoose';
/**
 * Model for storing user requests for a custom diet/workout plan PDF
 * This model stores the user's id, email, age, gender, height, bmi, weight, and fitness goal
 * The SentByAdmin field is used to track whether the request has been sent by an admin or not
 * The age, gender, height, bmi, weight, and fitnessGoal fields are required
 */
const UserPlanPdfRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    email: { type: String, Required: true },
    SentByAdmin: { type: Boolean, default: false },
    age: { type: Number, Required: true },
    gender: { type: String, Required: true },
    height: { type: Number, Required: true },
    bmi: { type: Number, Required: true },
    weight: { type: Number, Required: true },
    fitnessGoal: { type: String, Required: true },
})

const UserPlanPdfRequest = mongoose.model('UserPlanPdfRequest', UserPlanPdfRequestSchema);
export default UserPlanPdfRequest;