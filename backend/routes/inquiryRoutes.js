const express = require("express");
const { createInquiry } = require("../controllers/inquiryController");

const router = express.Router();

// Create a new inquiry
router.post("/", createInquiry);

module.exports = router;