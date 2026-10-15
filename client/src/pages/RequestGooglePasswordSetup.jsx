import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { requestGooglePasswordSetup } from "../api/auth.api";

const RequestGooglePasswordSetup = () => {
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: requestGooglePasswordSetup,

    onSuccess: (response) => {
      toast.success(
        response.message ||
          "If your account is eligible, a setup email has been sent."
      );
      setEmail("");
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast.error("Enter your email address");
      return;
    }

    mutation.mutate(normalizedEmail);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-8">
      <form
        onSubmit={handleSubmit}
        autoComplete="on"
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8"
      >
        <h1 className="text-2xl font-bold text-white">
          Set up an ORBIT password
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          If you created your ORBIT account with Google and want to sign in
          with an email and password too, enter your email address. We’ll
          send a secure setup link if your account is eligible.
        </p>

        <div className="mt-6 space-y-4">
          <label htmlFor="setup-email" className="block text-sm text-zinc-300">
            Email address
          </label>

          <input
            id="setup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="w-full rounded-lg bg-zinc-800 p-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? "Sending..." : "Send setup link"}
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

export default RequestGooglePasswordSetup;