import mongoose from "mongoose";
// Define the Resource Schema
// This schema stores the title, resource type, resource link, uploaded by, custom resource, created at, and updated at fields.
const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  resourceType: {
    type: String,
    enum: ['Video', 'Image', 'PDF', 'SUGGESTED_PRODUCTS', 'ABOUT_US', 'COUPONS', 'COMPANY_INFO', 'EVENTS'],
    required: true,
  },
  resourceLink: {
    type: String,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the user/admin who uploaded the resource
    ref: 'User',
  },
  customResource: {
    type: [],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model
const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;