const nodemailer = require('nodemailer');
require('dotenv').config();

(async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to yourself
      subject: "Test Email",
      text: "This is a test email from Node.js",
    });

    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Error sending test email:", err);
  }
})();
