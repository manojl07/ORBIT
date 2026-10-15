import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import { getMe, registerUser } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";
import GoogleButton from "../components/auth/GoogleButton";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,64}$/;

const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {register,handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
  });

  const password = watch("password", "");

  const registerMutation = useMutation({
    mutationFn: registerUser,

    onSuccess: async () => {
      try {
        const me = await getMe();

        setUser(me.data);

        toast.success("Account created 🚀");

        navigate(
          `/verify-email?email=${encodeURIComponent(me.data.email)}`
        );
      } catch {
        toast.error("Account created, but user data could not be loaded.");
      }
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Registration failed");
    },
  });

  const onSubmit = (formValues) => {
    const formData = new FormData();

    formData.append("username", formValues.username);
    formData.append("email", formValues.email);
    formData.append("password", formValues.password);
    formData.append("bio", formValues.bio || "");

    // Intentionally do not send confirmPassword to the backend.
    if (formValues.profileImg?.[0]) {
      formData.append("profileImg", formValues.profileImg[0]);
    }

    registerMutation.mutate(formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="on"
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8"
      >
        <h1 className="text-center text-3xl font-bold text-white">
          Create your ORBIT account
        </h1>

        <div className="mt-7">
          <GoogleButton text="Sign up with Google" />
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs text-zinc-500">OR</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              autoComplete="username"
              aria-invalid={Boolean(errors.username)}
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
                maxLength: {
                  value: 30,
                  message: "Username cannot exceed 30 characters",
                },
                pattern: {
                  value: /^[a-zA-Z0-9._]+$/,
                  message: "Use only letters, numbers, dots and underscores",
                },
              })}
              className="w-full rounded-lg bg-zinc-800 p-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
            />

            {errors.username && (
              <p className="mt-1 text-sm text-red-400">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              className="w-full rounded-lg bg-zinc-800 p-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                {...register("password", {
                  required: "Password is required",
                  pattern: {
                    value: passwordRegex,
                    message:
                      "Use 8–64 characters with uppercase, lowercase, a number and a special character (@$!%*?&)",
                  },
                })}
                className="w-full rounded-lg bg-zinc-800 p-3 pr-12 text-white outline-none focus:ring-2 focus:ring-blue-600"
              />

              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-zinc-400 transition hover:text-white"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                className="w-full rounded-lg bg-zinc-800 p-3 pr-12 text-white outline-none focus:ring-2 focus:ring-blue-600"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((visible) => !visible)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                aria-pressed={showConfirmPassword}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-zinc-400 transition hover:text-white"
              >
                {showConfirmPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <textarea
            placeholder="Bio (optional)"
            maxLength={150}
            {...register("bio")}
            className="w-full resize-none rounded-lg bg-zinc-800 p-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
          />

          <div>
            <label
              htmlFor="profileImg"
              className="mb-2 block text-sm text-zinc-400"
            >
              Profile image (optional)
            </label>
            <input
              id="profileImg"
              type="file"
              accept="image/*"
              {...register("profileImg")}
              className="w-full text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-700 file:px-3 file:py-2 file:text-white hover:file:bg-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {registerMutation.isPending ? "Creating..." : "Register"}
          </button>
        </div>

        <p className="mt-6 text-center text-zinc-400">
          Already have an account?
          <Link to="/login" className="ml-2 text-blue-500 hover:text-blue-400">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;