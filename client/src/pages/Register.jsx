import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { getMe, registerUser } from '../api/auth.api'
import toast from 'react-hot-toast'


const Register = () => {
  const navigate = useNavigate();

  const { setUser } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: async () => {
      try {
        const me = await getMe();

        setUser(me.data);

        toast.success("Account created 🚀")

        navigate('/');

      } catch (error) {
        toast.error("Failed to fetch user")
      }
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Registration failed")
    }

  })

  const onSubmit = (formValues) => {
    const formData = new FormData();

    formData.append("username", formValues.username);
    formData.append("email", formValues.email);
    formData.append("password", formValues.password);
    formData.append("bio", formValues.bio || "")

    if (formValues.profileImage?.[0]) {
      formData.append("profileImage", formValues.profileImage[0])
    }

    registerMutation.mutate(formData)
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-zinc-950'>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-950'
      >

        <h1 className='text-3xl font-bold text-white mb-6 text-center'>Register</h1>

        <div className='space-y-4'>

          <input
            type="text"
            placeholder='Username'
            {...register("username", { required: "Username required" })}
            className='w-full p-3 rounded-lg bg-zinc-800 text-white' />

          {errors.usename && (
            <p className='text-red-500 text-sm'>{errors.username.message}</p>
          )}

          <input
            type="email"
            placeholder='Email'
            {...register("email", {
              required: "Email is required"
            })}
            className='w-full p-3 rounded-lg bg-zinc-800 text-white' />

          {errors.email && (
            <p className='text-red-500 text-sm'>
              {errors.email.message}
            </p>
          )}

          <input
            type="text"
            placeholder='Password'
            {...register("passowrd", {
              required: "Password is required"
            })}
            className='w-full p-3 rounded-lg bg-zinc-800 text-white' />
          {errors.password && (
            <p className='text-red-500 text-sm'>
              {errors.password.message}
            </p>
          )}

          <textarea
            placeholder='Bio (optional)'
            {...register("bio")}
            className='w-full p-3 rounded-lg bg-zinc-800 text-white resize-none'
          />

          <button
            type='submit'
            disabled={registerMutation.isPending}
            className='w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold'>
            {
              registerMutation.isPending
                ? "Creating..."
                : "Register"
            }
          </button>

        </div>

        <p className='text-center text-zinc-400 mt-5'>Already have an account?
          <Link to="/login" className='text-blue-500 ml-2' >Login</Link>
        </p>
      </form>
    </div>
  )
}

export default Register