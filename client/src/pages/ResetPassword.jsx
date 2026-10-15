import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { resetPassword } from "../api/auth.api";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,64}$/;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: resetPassword,

    onSuccess: (response) => {
      toast.success(response.message || "Password reset successfully");

      navigate("/login", { replace: true });
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Reset link is invalid or expired"
      );
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Reset token is missing");
      return;
    }

    if (!passwordRegex.test(password)) {
      toast.error(
        "Use 8–64 characters with uppercase, lowercase, a number and a special character (@$!%*?&)"
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Confirmation is only for frontend validation.
    mutation.mutate({ token, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-8">
      <form
        onSubmit={handleSubmit}
        autoComplete="on"
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8"
      >
        <h1 className="text-2xl font-bold text-white">
          Reset Password
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Choose a strong password for your ORBIT account.
        </p>

        {!token && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            This reset link is missing or invalid.
          </p>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                required
                aria-label="New password"
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
          </div>

          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                required
                aria-label="Confirm new password"
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
          </div>

          <p className="text-xs leading-5 text-zinc-500">
            Passwords must be 8–64 characters and include uppercase and
            lowercase letters, a number, and one of @$!%*?&.
          </p>

          <button
            type="submit"
            disabled={mutation.isPending || !token}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? "Resetting..." : "Reset Password"}
          </button>
        </div>

        <Link
          to="/login"
          className="mt-5 block text-center text-sm text-blue-500 hover:text-blue-400"
        >
          Back to Login
        </Link>
      </form>
    </div>
  );
};

export default ResetPassword;