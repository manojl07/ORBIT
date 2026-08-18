import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "./useAuth";
import { updateProfile } from "../api/auth.api";
import { queryKeys } from "../constants/queryKey";
import toast from "react-hot-toast";







const useUpdateProfile = (onSuccessCallback) => {
  const queryClient = useQueryClient();

  const { user, setUser } = useAuth();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      const updatedUser = response.data;
      setUser(updatedUser);

      queryClient.setQueryData(["user-posts", updatedUser.id], (oldData) => oldData);

      queryClient.invalidateQueries({ queryKey: queryKeys.feed })

      toast.success("Profile updated 🚀");

      onSuccessCallback?.();
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile")
    }
  })
}

export default useUpdateProfile;