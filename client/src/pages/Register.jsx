import React from "react";

import {
  Link,
  useNavigate,
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
  registerUser,
} from "../api/auth.api";

import {
  useAuth,
} from "../hooks/useAuth";

import GoogleButton from "../components/auth/GoogleButton";

const Register = () => {
  const navigate =
    useNavigate();

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

  const registerMutation =
    useMutation({
      mutationFn:
        registerUser,

      onSuccess: async (
        response
      ) => {
        try {
          const me =
            await getMe();

          setUser(me.data);

          toast.success(
            "Account created 🚀"
          );

          navigate(
            `/verify-email?email=${encodeURIComponent(
              me.data.email
            )}`
          );
        } catch {
          toast.error(
            "Account created, but user data could not be loaded."
          );
        }
      },

      onError: (error) => {
        toast.error(
          error?.response?.data
            ?.message ||
            "Registration failed"
        );
      },
    });

  const onSubmit =
    (formValues) => {
      const formData =
        new FormData();

      formData.append(
        "username",
        formValues.username
      );

      formData.append(
        "email",
        formValues.email
      );

      formData.append(
        "password",
        formValues.password
      );

      formData.append(
        "bio",
        formValues.bio || ""
      );

      if (
        formValues.profileImg?.[0]
      ) {
        formData.append(
          "profileImg",
          formValues
            .profileImg[0]
        );
      }

      registerMutation.mutate(
        formData
      );
    };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">

      <form
        onSubmit={handleSubmit(
          onSubmit
        )}
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
          Create your ORBIT account
        </h1>

        <div className="mt-7">

          <GoogleButton
            text="Sign up with Google"
          />

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
              placeholder="Username"
              {...register(
                "username",
                {
                  required:
                    "Username required",
                }
              )}
              className="
                w-full
                rounded-lg
                bg-zinc-800
                p-3
                text-white
                outline-none
              "
            />

            {errors.username && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors
                    .username
                    .message
                }
              </p>
            )}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              {...register(
                "email",
                {
                  required:
                    "Email is required",
                }
              )}
              className="
                w-full
                rounded-lg
                bg-zinc-800
                p-3
                text-white
                outline-none
              "
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors
                    .email
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

          <textarea
            placeholder="Bio (optional)"
            {...register(
              "bio"
            )}
            className="
              w-full
              rounded-lg
              bg-zinc-800
              p-3
              text-white
              resize-none
              outline-none
            "
          />

          <input
            type="file"
            accept="image/*"
            {...register(
              "profileImg"
            )}
            className="w-full text-white"
          />

          <button
            type="submit"
            disabled={
              registerMutation.isPending
            }
            className="
              w-full
              rounded-lg
              bg-blue-600
              p-3
              font-semibold
              text-white
              hover:bg-blue-500
              disabled:opacity-50
            "
          >
            {registerMutation.isPending
              ? "Creating..."
              : "Register"}
          </button>
        </div>

        <p className="mt-6 text-center text-zinc-400">
          Already have an account?

          <Link
            to="/login"
            className="ml-2 text-blue-500"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;