const { z } = require("zod");

const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,64}$/;

const registerSchema = z.object({
  username: z.string().trim().min(3).max(30).regex(usernameRegex, "Invalid Username"),

  email: z.string().trim().email(),
  password: z.string().regex(passwordRegex, "Weak Password"),

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

const resendVerificationSchema = z.object({ email: z.string().trim().email(), });

const forgotPasswordSchema = z.object({ email: z.string().trim().email(), });

const resetPasswordSchema = z.object({ token: z.string().min(20), password: z.string().regex(passwordRegex, "Weak Password"), });

const updateProfileSchema = z.object({ bio: z.string().trim().max(150, "Bio cannot exceed more than 150 characters").optional(), });

module.exports = { registerSchema, loginSchema, refreshSchema, logoutSchema, tokenSchema, resendVerificationSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema, };