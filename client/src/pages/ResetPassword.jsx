import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  useMutation,
} from "@tanstack/react-query";

import toast from "react-hot-toast";

import {
  resetPassword,
} from "../api/auth.api";

const ResetPassword = () => {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const token =
    searchParams.get(
      "token"
    );

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const mutation =
    useMutation({
      mutationFn:
        resetPassword,

      onSuccess: (
        response
      ) => {
        toast.success(
          response.message ||
            "Password reset successfully"
        );

        navigate("/login", {
          replace: true,
        });
      },

      onError: (error) => {
        toast.error(
          error?.response?.data
            ?.message ||
            "Reset link is invalid or expired"
        );
      },
    });

  const handleSubmit =
    (event) => {
      event.preventDefault();

      if (!token) {
        toast.error(
          "Reset token is missing"
        );

        return;
      }

      if (password.length < 8) {
        toast.error(
          "Password must be at least 8 characters"
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        toast.error(
          "Passwords do not match"
        );

        return;
      }

      mutation.mutate({
        token,
        password,
      });
    };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">

      <form
        onSubmit={handleSubmit}
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-zinc-800
          bg-zinc-900
          p-6
          sm:p-8
        "
      >
        <h1 className="text-2xl font-bold text-white">
          Reset Password
        </h1>

        {!token && (
          <p className="mt-3 text-red-400">
            This reset link is missing or invalid.
          </p>
        )}

        <div className="mt-6 space-y-4">

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            placeholder="New password"
            className="
              w-full
              rounded-lg
              bg-zinc-800
              p-3
              text-white
              outline-none
              focus:ring-2
              focus:ring-blue-600
            "
          />

          <input
            type="password"
            value={
              confirmPassword
            }
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
            placeholder="Confirm new password"
            className="
              w-full
              rounded-lg
              bg-zinc-800
              p-3
              text-white
              outline-none
              focus:ring-2
              focus:ring-blue-600
            "
          />

          <button
            type="submit"
            disabled={
              mutation.isPending ||
              !token
            }
            className="
              w-full
              rounded-lg
              bg-blue-600
              py-3
              font-semibold
              text-white
              hover:bg-blue-500
              disabled:opacity-50
            "
          >
            {mutation.isPending
              ? "Resetting..."
              : "Reset Password"}
          </button>
        </div>

        <Link
          to="/login"
          className="
            mt-5
            block
            text-center
            text-sm
            text-blue-500
          "
        >
          Back to Login
        </Link>
      </form>
    </div>
  );
};

export default ResetPassword;