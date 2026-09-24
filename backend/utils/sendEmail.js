const nodemailer = require("nodemailer");
const dns = require("node:dns").promises;

const getGmailTransporter = async () => {
  let ipv4Address;

  try {
    const addresses = await dns.resolve4("smtp.gmail.com");
    ipv4Address = addresses && addresses.length > 0 ? addresses[0] : null;
  } catch (error) {
    ipv4Address = null;
  }

  if (!ipv4Address) {
    throw new Error(
      "No IPv4 address available for smtp.gmail.com; SMTP cannot be sent over IPv6 on this host.",
    );
  }

  return nodemailer.createTransport({
    host: ipv4Address,
    port: 587,
    secure: false,
    tls: {
      rejectUnauthorized: true,
      servername: "smtp.gmail.com",
    },
    connectionTimeout: 20000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async (to, subject, text) => {
  const transporter = await getGmailTransporter();

  const result = await transporter.sendMail({
    from: `"Sanika Makeover" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    text: text,
  });

  return result;
};

module.exports = sendEmail;
