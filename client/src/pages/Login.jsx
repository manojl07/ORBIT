import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import { getMe, loginUser } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";
import GoogleButton from "../components/auth/GoogleButton";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const oauth = searchParams.get("oauth");

    if (!oauth) return;

    const messages = {
      cancelled: "Google sign-in was cancelled.",
      invalid: "Google authentication could not be verified.",
      failed: "Google sign-in failed. Please try again.",
    };

    toast.error(messages[oauth] || "Google sign-in failed.");
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const loginMutation = useMutation({
    mutationFn: loginUser,

    onSuccess: async () => {
      try {
        const me = await getMe();

        setUser(me.data);
        toast.success("Login successful 🚀");
        navigate("/");
      } catch {
        toast.error("Failed to fetch user");
      }
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Login failed");
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="on"
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8"
      >
        <h1 className="text-center text-3xl font-bold text-white">
          Login
        </h1>

        <div className="mt-7">
          <GoogleButton />
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
              placeholder="Email or username"
              aria-invalid={Boolean(errors.identifier)}
              {...register("identifier", {
                required: "Username or email is required",
                minLength: {
                  value: 3,
                  message: "Enter a valid username or email",
                },
              })}
              className="w-full rounded-lg bg-zinc-800 p-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
            />

            {errors.identifier && (
              <p className="mt-1 text-sm text-red-400">
                {errors.identifier.message}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                aria-invalid={Boolean(errors.password)}
                {...register("password", {
                  required: "Password is required",
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
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-sm text-red-400">
                {errors.password.message}
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

            <p className="mt-2">
              <Link
                to="/setup-password/request"
                className="text-sm text-zinc-400 hover:text-white"
              >
                Want to set up an ORBIT password?
              </Link>
            </p>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className="mt-6 text-center text-zinc-400">
          Don't have an account?
          <Link to="/register" className="ml-2 text-blue-500 hover:text-blue-400">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;