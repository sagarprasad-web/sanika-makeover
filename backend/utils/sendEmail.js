const { Resend } = require("resend");

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY is not configured.");
}

const resend = new Resend(resendApiKey);

const sendEmail = async (to, subject, text) => {
  const sender = process.env.RESEND_FROM;

  if (!sender) {
    throw new Error(
      "RESEND_FROM is not configured. Set it to a verified Resend sender address.",
    );
  }

  try {
    const result = await resend.emails.send({
      from: sender,
      to: [to],
      subject,
      text,
    });

    return result;
  } catch (error) {
    const message = error?.message || "Unknown Resend email error";
    throw new Error(`Resend email failed: ${message}`);
  }
};

module.exports = sendEmail;
