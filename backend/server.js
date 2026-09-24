const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");

require("dotenv").config();

const inquiryRoutes = require("./routes/inquiryRoutes");
const otpRoutes = require("./routes/otpRoutes");
const connectDB = require("./config/db");

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/inquiries", inquiryRoutes);
app.use("/api/otp", otpRoutes);
connectDB();



// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Sanika Makeover Backend is running!",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
