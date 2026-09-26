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
    const { data, error } = await resend.emails.send({
      from: sender,
      to: [to],
      subject,
      text,
    });

    if (error) {
      const errorMessage = error?.message || "Unknown Resend email error";
      console.error("Resend email error:", errorMessage);
      throw new Error(`Resend email failed: ${errorMessage}`);
    }

    return data;
  } catch (error) {
    const message = error?.message || "Unknown Resend email error";
    console.error("Resend email error:", message);
    throw new Error(`Resend email failed: ${message}`);
  }
};

module.exports = sendEmail;
