import {
  useEffect,
  useRef,
  useState,
} from "react";

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
  resendVerification,
  verifyEmail,
} from "../api/auth.api";

const VerifyEmail = () => {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const token =
    searchParams.get(
      "token"
    );

  const email =
    searchParams.get(
      "email"
    ) || "";

  const [
    resendEmail,
    setResendEmail,
  ] = useState(email);

  const hasVerified =
    useRef(false);

  const verifyMutation =
    useMutation({
      mutationFn:
        verifyEmail,

      onSuccess: () => {
        toast.success(
          "Email verified successfully 🎉"
        );

        navigate("/login", {
          replace: true,
        });
      },

      onError: (error) => {
        toast.error(
          error?.response?.data
            ?.message ||
            "Verification link is invalid or expired"
        );
      },
    });

  const resendMutation =
    useMutation({
      mutationFn:
        resendVerification,

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
            "Unable to resend verification email"
        );
      },
    });

  useEffect(() => {
    if (
      token &&
      !hasVerified.current
    ) {
      hasVerified.current = true;

      verifyMutation.mutate(
        token
      );
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">

      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-zinc-800
          bg-zinc-900
          p-6
          text-center
          sm:p-8
        "
      >
        <div className="text-5xl">
          ✉️
        </div>

        <h1 className="mt-5 text-2xl font-bold text-white">
          Verify your email
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Check your inbox for the ORBIT verification link.
        </p>

        {token &&
          verifyMutation.isPending && (
            <p className="mt-6 text-blue-400">
              Verifying your email...
            </p>
          )}

        {!token && (
          <div className="mt-6">

            <input
              type="email"
              value={resendEmail}
              onChange={(event) =>
                setResendEmail(
                  event.target.value
                )
              }
              placeholder="Email address"
              className="
                w-full
                rounded-lg
                bg-zinc-800
                p-3
                text-white
                outline-none
              "
            />

            <button
              type="button"
              disabled={
                resendMutation.isPending
              }
              onClick={() => {
                const value =
                  resendEmail.trim();

                if (!value) {
                  toast.error(
                    "Enter your email"
                  );

                  return;
                }

                resendMutation.mutate(
                  value
                );
              }}
              className="
                mt-4
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
              {resendMutation.isPending
                ? "Sending..."
                : "Resend Verification Email"}
            </button>
          </div>
        )}

        <Link
          to="/login"
          className="
            mt-6
            block
            text-sm
            text-blue-500
          "
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;