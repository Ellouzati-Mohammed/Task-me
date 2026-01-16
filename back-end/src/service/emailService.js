// emailService.js
const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendEmail(to, subject, text) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  let info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  });

  console.log("Email envoyé:", info.response);
}

// Test direct
sendEmail("i.fdili@edu.umi.ac.ma", "Test Nodemailer ", "Ceci est un test d'envoi d'email");
module.exports = { sendEmail };
