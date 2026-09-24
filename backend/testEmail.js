require("dotenv").config();

const sendEmail = require("./utils/sendEmail");

const test = async () => {
  try {
    await sendEmail(
      "sagarprasad28032003@gmail.com",
      "Sanika Makeover Email Test",
      "This is a test email from the Sanika Makeover backend."
    );

    console.log("Test email sent successfully!");
  } catch (error) {
    console.error("Email sending failed:", error.message);
  }
};

test();