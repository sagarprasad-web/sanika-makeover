const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  const result = await transporter.sendMail({
    from: `"Sanika Makeover" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });

  return result;
};

module.exports = sendEmail;