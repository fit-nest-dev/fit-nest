import mongoose from "mongoose";
/**
 * Model for change requests submitted by users.
 * Each request contains information about the changes a user wants to make to their profile.
 * The request is then reviewed by an admin, who can either approve or reject the request.
 * If the request is approved, the changes are made to the user's profile.
 * If the request is rejected, the request is deleted.
 * @typedef {Object} ChangeRequest
 * @property {ObjectId} userId - The ID of the user submitting the change request.
 * @property {Map<String,String>} requestedChanges - The requested changes to the user's profile.
 * @property {String} status - The current status of the request.
 * @property {Date} requestedAt - The date and time the request was made.
 * @property {ObjectId} reviewedBy - The ID of the admin who reviewed the request.
 * @property {Date} reviewedAt - The date and time the request was reviewed.
 */
const ChangeRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  requestedChanges: { type: Map, of: String, required: true }, // Key-value pair of fields to change
  status: { type: String, default: "Pending", enum: ["Pending", "Approved", "Rejected"] },
  requestedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who reviewed the request
});

export const ChangeRequest = mongoose.model("ChangeRequest", ChangeRequestSchema);