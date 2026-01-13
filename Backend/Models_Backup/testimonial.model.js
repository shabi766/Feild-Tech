import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
  name: String,
  role: String,
  photo: String,
  message: String,
});

export default mongoose.model("Testimonial", testimonialSchema);
