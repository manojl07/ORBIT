const { z } = require("zod");

const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,64}$/;

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username cannot exceed 30 characters")
  .regex(
    usernameRegex,
    "Username can only contain letters, numbers, dots and underscores"
  );

const passwordSchema = z
  .string()
  .regex(
    passwordRegex,
    "Password must be 8–64 characters and include uppercase, lowercase, a number and a special character (@$!%*?&)"
  );

const emailSchema = z.string().trim().email();

const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  bio: z.string().max(150).optional(),
});

const loginSchema = z.object({
  identifier: z.string().trim().min(3),
  password: z.string().min(6),
});

const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

const logoutSchema = z.object({});

const tokenSchema = z.object({
  token: z.string().min(20),
});

const resendVerificationSchema = z.object({
  email: emailSchema,
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: passwordSchema,
});

const googlePasswordSetupRequestSchema = z.object({
  email: emailSchema,
});

const googlePasswordSetupCompleteSchema = z.object({
  token: z.string().min(20),
  password: passwordSchema,
});

const updateProfileSchema = z.object({
  username: usernameSchema.optional(),
  bio: z.string().trim().max(150, "Bio cannot exceed 150 characters").optional(),
});

const checkUsernameSchema = z.object({
  username: usernameSchema,
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  tokenSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googlePasswordSetupRequestSchema,
  googlePasswordSetupCompleteSchema,
  updateProfileSchema,
  checkUsernameSchema,
};