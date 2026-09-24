const Inquiry = require("../models/Inquiry");

// Create a new inquiry
const createInquiry = async (req, res) => {
  try {
    const { name, email, phone, eventDate, message } = req.body;

    // Required field validation
    if (!name || !email || !phone || !eventDate) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Indian mobile number validation
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit Indian mobile number.",
      });
    }

    // Create inquiry
    const inquiry = new Inquiry({
      name,
      email,
      phone,
      eventDate,
      message,
    });

    // Save inquiry to MongoDB
    const savedInquiry = await inquiry.save();

    // Success response
    res.status(201).json({
      success: true,
      message: "Inquiry saved successfully!",
      inquiry: savedInquiry,
    });
  } catch (error) {
    console.error("Error saving inquiry:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save inquiry.",
    });
  }
};

module.exports = {
  createInquiry,
};