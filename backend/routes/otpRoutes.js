const express = require("express");
const { sendOTP, verifyOTP } = require("../controllers/otpController");
const router = express.Router();

// Send OTP
router.post("/send", sendOTP);

// Verify OTP
router.post("/verify", verifyOTP);

module.exports = router;