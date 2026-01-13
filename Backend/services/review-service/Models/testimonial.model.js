import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  photo: {
    type: String
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId
    // No ref - belongs to Auth Service
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, { timestamps: true });

// Indexes
testimonialSchema.index({ status: 1 });
testimonialSchema.index({ userId: 1 });

export const Testimonial = mongoose.model("Testimonial", testimonialSchema);
