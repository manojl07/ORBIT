import { useMutation, useQueryClient, } from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import { updateProfile, } from "../api/auth.api";

import { queryKeys, } from "../constants/queryKey";

import toast from "react-hot-toast";

const useUpdateProfile = (onSuccessCallback) => {
  const queryClient = useQueryClient();

  const { setUser } = useAuth();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      const updatedUser = response.data;

      /* ========================================
         UPDATE GLOBAL AUTH USER
      ======================================== */
      setUser(updatedUser);

      /* ========================================
         UPDATE CURRENT PROFILE IMMEDIATELY
      ======================================== */
      queryClient.setQueryData(queryKeys.profile(updatedUser.id), (oldData) => {
        if (!oldData) {
          return oldData;
        }

        return {
          ...oldData,

          data: {
            ...oldData.data,
            ...updatedUser,
          },
        };
      }
      );

      /* ========================================
         REFRESH DEPENDENT DATA
      ======================================== */
      queryClient.invalidateQueries({ queryKey: queryKeys.userPosts(updatedUser.id), });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed, });
      queryClient.invalidateQueries({ queryKey: queryKeys.followers(updatedUser.id), });
      queryClient.invalidateQueries({ queryKey: queryKeys.following(updatedUser.id), });
      queryClient.invalidateQueries({ queryKey: ["search-users",], });
      toast.success("Profile updated 🚀");

      onSuccessCallback?.();
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });
};

export default useUpdateProfile;