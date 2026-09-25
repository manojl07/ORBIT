const nodemailer = require("nodemailer");

const createMailTransporter = () => {
  const required = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "MAIL_FROM",
  ];

  const missing = required.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing mail configuration: ${missing.join(", ")}`
    );
  }

  console.log("===== SMTP DEBUG =====");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_SECURE:", process.env.SMTP_SECURE);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("======================");

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure:
      String(process.env.SMTP_SECURE).toLowerCase() ===
      "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendMail = async ({
  to,
  subject,
  text,
  html,
}) => {
  const transporter = createMailTransporter();

  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendMail,
};