import React, {
  useEffect,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  useForm,
} from "react-hook-form";

import {
  useMutation,
} from "@tanstack/react-query";

import toast from "react-hot-toast";

import {
  getMe,
  loginUser,
} from "../api/auth.api";

import {
  useAuth,
} from "../hooks/useAuth";

import GoogleButton from "../components/auth/GoogleButton";

const Login = () => {
  const navigate =
    useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const {
    setUser,
  } = useAuth();

  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm();

  useEffect(() => {
    const oauth =
      searchParams.get(
        "oauth"
      );

    if (!oauth) {
      return;
    }

    const messages = {
      cancelled:
        "Google sign-in was cancelled.",
      invalid:
        "Google authentication could not be verified.",
      failed:
        "Google sign-in failed. Please try again.",
    };

    toast.error(
      messages[oauth] ||
        "Google sign-in failed."
    );

    setSearchParams(
      {},
      {
        replace: true,
      }
    );
  }, []);

  const loginMutation =
    useMutation({
      mutationFn: loginUser,

      onSuccess: async () => {
        try {
          const me =
            await getMe();

          setUser(me.data);

          toast.success(
            "Login successful 🚀"
          );

          navigate("/");
        } catch {
          toast.error(
            "Failed to fetch user"
          );
        }
      },

      onError: (error) => {
        toast.error(
          error?.response?.data
            ?.message ||
            "Login failed"
        );
      },
    });

  const onSubmit =
    (data) => {
      loginMutation.mutate(
        data
      );
    };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">

      <form
        onSubmit={handleSubmit(
          onSubmit
        )}
        autoComplete="off"
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
        <h1 className="text-3xl font-bold text-white text-center">
          Login
        </h1>

        <div className="mt-7">

          <GoogleButton />

        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />

          <span className="text-xs text-zinc-600">
            OR
          </span>

          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="space-y-4">

          <div>
            <input
              type="text"
              placeholder="Email or username"
              {...register(
                "identifier",
                {
                  required:
                    "Username or Email is required",
                }
              )}
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

            {errors.identifier && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors
                    .identifier
                    .message
                }
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              {...register(
                "password",
                {
                  required:
                    "Password is required",
                }
              )}
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

            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors
                    .password
                    .message
                }
              </p>
            )}
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-500 hover:text-blue-400"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={
              loginMutation.isPending
            }
            className="
              w-full
              rounded-lg
              bg-blue-600
              p-3
              font-semibold
              text-white
              transition
              hover:bg-blue-500
              disabled:opacity-50
            "
          >
            {loginMutation.isPending
              ? "Logging in..."
              : "Login"}
          </button>
        </div>

        <p className="mt-6 text-center text-zinc-400">
          Don't have an account?

          <Link
            to="/register"
            className="ml-2 text-blue-500"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;