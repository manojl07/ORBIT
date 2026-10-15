import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { completeGooglePasswordSetup } from "../api/auth.api";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,64}$/;

const SetupPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: completeGooglePasswordSetup,

    onSuccess: (response) => {
      toast.success(
        response.message || "ORBIT password set up successfully"
      );

      navigate("/login", { replace: true });
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "The setup link is invalid, expired, or already used."
      );
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Password setup token is missing");
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
          Create your ORBIT password
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          You can continue using Google. This password gives you another
          way to sign in to ORBIT.
        </p>

        {!token && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            This setup link is missing or invalid. Request a new one.
          </p>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm text-zinc-300">
              New password
            </label>

            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
                className="w-full rounded-lg bg-zinc-800 p-3 pr-12 text-white outline-none focus:ring-2 focus:ring-blue-600"
              />

              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="mb-2 block text-sm text-zinc-300">
              Confirm password
            </label>

            <div className="relative">
              <input
                id="confirm-new-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
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
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-zinc-400 hover:text-white"
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
            Use 8–64 characters with uppercase and lowercase letters, a
            number, and one of @$!%*?&.
          </p>

          <button
            type="submit"
            disabled={mutation.isPending || !token}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? "Setting up..." : "Set up password"}
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

export default SetupPassword;