import React from 'react'
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { getMe, loginUser } from '../api/auth.api';

const Login = () => {
  const navigate = useNavigate();

  const { setUser } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async () => {
      try {
        const me = await getMe();

        setUser(me.data);
        toast.success("Login successful 🚀")
        navigate('/')

      } catch (error) {
        toast.error("Failed to fetch user")
      }
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Login failed");
    }
  })

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-zinc-950'>

      <form onSubmit={handleSubmit(onSubmit)}
        className='w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800'>

        <h1 className='text-3xl font-bold text-white mb-6 text-center'>Login</h1>

        <div className='space-y-4'>

          <input
            type="text"
            placeholder='Email or username'
            {...register("identifier", {
              required: "Username or Email is required",
            })}
            className='w-full p-3 rounded-lg bg-zinc-800 text-white'
          />

          {errors.identifier && (
            <p className='text-red-500 text-sm'>
              {errors.identifier.message}
            </p>
          )}

          <input
            type="password"
            placeholder='Password'
            {...register("password", {
              required: "Password is required",
            })}
            className='w-full p-3 rounded-lg bg-zinc-800 text-white'
          />

          {errors.password && (
            <p className='text-red-500 text-sm'>
              {errors.password.message}
            </p>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className='w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold'
          >
            {loginMutation.isPending
              ? "Logging In..."
              : "Login"
            }
          </button>
        </div>

        <p className='text-center text-zinc-400 mt-5'>
          Don't have an account?

          <Link
            to="/register"
            className="text-blue-500 ml-2"
          >
            Register
          </Link>
        </p>
      </form>

    </div>
  )
}

export default Login