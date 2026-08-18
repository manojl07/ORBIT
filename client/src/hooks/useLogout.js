import { useNavigate } from 'react-router-dom'

import { useQueryClient, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {useAuth} from './useAuth'
import { logoutUser } from '../services/auth.service'


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

    onError: () => {
      toast.error("Logout failed");
    }
  })

  return {
    logoutUser:mutation.mutate,
    isLoggingOut: mutation.isPending,
  }
}

export default useLogout;