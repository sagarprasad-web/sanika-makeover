const express = require("express");
const Inquiry = require("../models/Inquiry");

const router = express.Router();

// Create a new inquiry
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, eventDate, message } = req.body;

    const inquiry = new Inquiry({
      name,
      email,
      phone,
      eventDate,
      message,
    });

    const savedInquiry = await inquiry.save();

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
});

module.exports = router;
