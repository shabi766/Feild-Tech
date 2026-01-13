import { Testimonial } from "../Models/testimonial.model.js";

/**
 * Get all testimonials
 */
export const getTestimonials = async (req, res) => {
  try {
    const { status = 'approved', limit = 20 } = req.query;
    
    const testimonials = await Testimonial.find({ status })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      testimonials,
      success: true
    });
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    res.status(500).json({ 
      error: "Failed to fetch testimonials",
      success: false,
      error: err.message
    });
  }
};

/**
 * Create a new testimonial
 */
export const createTestimonial = async (req, res) => {
  try {
    const { name, role, photo, message, rating } = req.body;
    const userId = req.user?.userId || req.user?._id;

    if (!name || !role || !message) {
      return res.status(400).json({ 
        error: "Name, role, and message are required",
        success: false
      });
    }

    const testimonial = new Testimonial({
      name,
      role,
      photo,
      message,
      rating,
      userId,
      status: 'pending' // Requires approval
    });

    await testimonial.save();

    res.status(201).json({
      testimonial,
      success: true,
      message: "Testimonial submitted successfully. It will be reviewed before being published."
    });
  } catch (err) {
    console.error('Error creating testimonial:', err);
    res.status(400).json({ 
      error: "Failed to create testimonial",
      success: false,
      error: err.message
    });
  }
};

/**
 * Update testimonial status (admin)
 */
export const updateTestimonialStatus = async (req, res) => {
  try {
    const { testimonialId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        success: false
      });
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      testimonialId,
      { status },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({
        error: "Testimonial not found",
        success: false
      });
    }

    res.status(200).json({
      testimonial,
      success: true,
      message: `Testimonial ${status} successfully`
    });
  } catch (err) {
    console.error('Error updating testimonial:', err);
    res.status(500).json({ 
      error: "Failed to update testimonial",
      success: false,
      error: err.message
    });
  }
};

/**
 * Delete testimonial
 */
export const deleteTestimonial = async (req, res) => {
  try {
    const { testimonialId } = req.params;
    const userId = req.user?.userId || req.user?._id;

    const testimonial = await Testimonial.findById(testimonialId);
    if (!testimonial) {
      return res.status(404).json({
        error: "Testimonial not found",
        success: false
      });
    }

    // Check if user owns the testimonial or is admin
    if (testimonial.userId?.toString() !== userId?.toString() && req.user?.role !== 'Admin') {
      return res.status(403).json({
        error: "You don't have permission to delete this testimonial",
        success: false
      });
    }

    await Testimonial.findByIdAndDelete(testimonialId);

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully"
    });
  } catch (err) {
    console.error('Error deleting testimonial:', err);
    res.status(500).json({ 
      error: "Failed to delete testimonial",
      success: false,
      error: err.message
    });
  }
};
