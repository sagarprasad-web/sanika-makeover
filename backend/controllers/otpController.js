const OTP = require("../models/OTP");
const sendEmail = require("../utils/sendEmail");

// =========================================================
// SEND OTP
// =========================================================

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check email exists
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Clean and normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Allow only valid Gmail addresses
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Gmail address.",
      });
    }

    // =====================================================
    // GENERATE 6-DIGIT OTP
    // =====================================================

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // =====================================================
    // REMOVE PREVIOUS OTP
    // =====================================================

    await OTP.deleteMany({
      email: normalizedEmail,
    });

    // =====================================================
    // SEND OTP EMAIL
    // =====================================================

    try {
      const emailResult = await sendEmail(
        normalizedEmail,
        "Sanika Makeover - Email Verification OTP",
        `Your Sanika Makeover verification code is: ${otp}

This OTP is valid for 5 minutes.

If you did not request this code, please ignore this email.`
      );

      // ===================================================
      // CHECK IF EMAIL WAS EXPLICITLY REJECTED
      // ===================================================

      console.log("EMAIL SEND RESULT:", emailResult);
      if (
        emailResult &&
        emailResult.rejected &&
        emailResult.rejected.includes(normalizedEmail)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "We couldn't send the verification code to this email address. Please check your Gmail address and try again.",
        });
      }
    } catch (emailError) {
      console.error(
        "Email sending failed:",
        emailError
      );

      return res.status(400).json({
        success: false,
        message:
          "We couldn't send the verification code to this email address. Please check your Gmail address and try again.",
      });
    }

    // =====================================================
    // IMPORTANT:
    // OTP TIMER STARTS AFTER EMAIL SEND COMPLETES
    // =====================================================

    const sentAt = new Date();

    const expiresAt = new Date(
      sentAt.getTime() + 5 * 60 * 1000
    );

    // =====================================================
    // SAVE OTP IN DATABASE
    // =====================================================

    await OTP.create({
      email: normalizedEmail,
      otp,
      expiresAt,
    });

    // =====================================================
    // SEND SUCCESS RESPONSE
    // =====================================================

    res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
      sentAt: sentAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error(
      "Send OTP error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to send OTP.",
    });
  }
};

// =========================================================
// VERIFY OTP
// =========================================================

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check required fields
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    // Clean and normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find OTP
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp,
    });

    // OTP not found
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // =====================================================
    // CHECK OTP EXPIRY
    // =====================================================

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    // =====================================================
    // OTP IS VALID
    // Delete it so it cannot be reused
    // =====================================================

    await OTP.deleteOne({
      _id: otpRecord._id,
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });

  } catch (error) {
    console.error(
      "Verify OTP error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to verify OTP.",
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  sendOTP,
  verifyOTP,
};