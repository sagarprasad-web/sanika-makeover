const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  const result = await transporter.sendMail({
    from: `"Sanika Makeover" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    text: text,
  });

  return result;
};

module.exports = sendEmail;