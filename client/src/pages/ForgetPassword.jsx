import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useMutation,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  forgotPassword,
} from "../api/auth.api";

const ForgotPassword = () => {
  const [email, setEmail] =
    useState("");

  const mutation =
    useMutation({
      mutationFn:
        forgotPassword,

      onSuccess: (
        response
      ) => {
        toast.success(
          response.message
        );
      },

      onError: (error) => {
        toast.error(
          error?.response?.data
            ?.message ||
            "Unable to process request"
        );
      },
    });

  const handleSubmit =
    (event) => {
      event.preventDefault();

      const normalized =
        email.trim();

      if (!normalized) {
        toast.error(
          "Enter your email"
        );

        return;
      }

      mutation.mutate(
        normalized
      );
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
          Forgot Password
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Enter your email and we'll send you a password reset link.
        </p>

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          placeholder="Email address"
          className="
            mt-6
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
            mutation.isPending
          }
          className="
            mt-4
            w-full
            rounded-lg
            bg-blue-600
            py-3
            font-semibold
            text-white
            transition
            hover:bg-blue-500
            disabled:opacity-50
          "
        >
          {mutation.isPending
            ? "Sending..."
            : "Send Reset Link"}
        </button>

        <Link
          to="/login"
          className="
            mt-5
            block
            text-center
            text-sm
            text-blue-500
            hover:text-blue-400
          "
        >
          Back to Login
        </Link>
      </form>
    </div>
  );
};

export default ForgotPassword;