import { useNavigate } from 'react-router-dom'

import { useQueryClient, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {useAuth} from './useAuth'
import { logoutUser } from '../api/auth.api'


const useLogout = () => {
  const navigate = useNavigate();

  const queryClient = useQueryClient()

  const {setUser} = useAuth();

  const mutation = useMutation({
    mutationFn: logoutUser,

    onSuccess: async () => {
      queryClient.clear();

      setUser(null)
      toast.success("Logged out successfully")
      navigate("/login", {replace: true})
    },

    onError: (error) => {
      console.error("Logout failed:", error);
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  })

  return {
    logout: mutation.mutateAsync,
    isLoggingOut: mutation.isPending,
  }
}

export default useLogout;