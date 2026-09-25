const { sendMail } = require("../config/mail.config");

const getClientUrl = () => { return (process.env.CLIENT_URL || "").replace(/\/$/, ""); };

const sendVerificationEmail = async ({ email, username, token, }) => {
  const verificationUrl = `${getClientUrl()}/verify-email?token=${encodeURIComponent(token)}`;

  await sendMail({
    to: email,
    subject: "Verify your ORBIT account",
    text: `Hi ${username},Verify your ORBIT account: ${verificationUrl} This link will expire in 24 hours. If you did not create this account, you can ignore this email.`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to ORBIT 🚀</h2>

        <p>Hi ${username},</p>

        <p>Please verify your email address to secure your account.</p>

        <p><a href="${verificationUrl}" style="display:inline-block; padding:12px 20px; background:#2563eb; color:white; text-decoration:none; border-radius:8px;" >Verify Email</a></p>

        <p>This link expires in 24 hours.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async ({ email, username, token, }) => {
  const resetUrl = `${getClientUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  await sendMail({
    to: email, subject: "Reset your ORBIT password", 
    text: `Hi ${username},Reset your ORBIT password:${resetUrl} This link will expire in 15 minutes. 
    If you did not request this, you can safely ignore this email.`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset your ORBIT password</h2>

        <p>Hi ${username},</p>

        <p>We received a request to reset your password.</p>

        <p>
          <a href="${resetUrl}" style="display:inline-block; padding:12px 20px; background:#2563eb; color:white; text-decoration:none; border-radius:8px;" >Reset Password</a>
        </p>

        <p>This link expires in 15 minutes.</p>
      </div>
    `,
  });
};

module.exports = {sendVerificationEmail,sendPasswordResetEmail,};