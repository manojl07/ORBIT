import { useQuery } from "@tanstack/react-query";

import { checkUsername } from "../api/user.api";

import { queryKeys } from "../constants/queryKey";

import useDebounce from "./useDebounce";

const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;

const normalizeUsername = (value = "") => value.trim().toLowerCase();

const useUsernameAvailability = ({ username, currentUsername, enabled = true, }) => {
  const debouncedUsername = useDebounce(username, 400);
  const normalizedUsername = normalizeUsername(username);
  const debouncedNormalizedUsername = normalizeUsername(debouncedUsername);
  const normalizedCurrentUsername = normalizeUsername(currentUsername);
  const isCurrentUsername = normalizedUsername.length > 0 && normalizedUsername === normalizedCurrentUsername;
  const isValid = usernameRegex.test(normalizedUsername);
  const waitingForDebounce = normalizedUsername !== debouncedNormalizedUsername;
  const shouldCheck = enabled && isValid && !isCurrentUsername && !waitingForDebounce;
  const query = useQuery({
    queryKey: queryKeys.usernameAvailability(debouncedNormalizedUsername),

    queryFn: async () => {
      const response = await checkUsername(debouncedNormalizedUsername);
      return response.data;
    },
    enabled: shouldCheck,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  /* ========================================
     STATE
  ======================================== */

  if (!normalizedUsername) return { status: "idle", message: "", isChecking: false, isAvailable: false, };

  if (!isValid) {
    return {
      status: "invalid",
      message: "Use 3–30 letters, numbers, dots or underscores.",
      isChecking: false,
      isAvailable: false,
    };
  }

  if (isCurrentUsername) {
    return {
      status: "current",
      message: "This is your current username.",
      isChecking: false,
      isAvailable: true,
    };
  }

  if (waitingForDebounce || query.isFetching) {
    return {
      status: "checking",
      message: "Checking availability...",
      isChecking: true,
      isAvailable: false,
    };
  }

  if (query.isError) {
    return {
      status: "error",
      message: "Couldn't check username. Try again.",
      isChecking: false,
      isAvailable: false,
    };
  }

  if (query.data?.available === true) {
    return {
      status: "available",
      message: "Username is available.",
      isChecking: false,
      isAvailable: true,
    };
  }

  if (query.data?.available === false) {
    return {
      status: "taken",
      message: "Username is already taken.",
      isChecking: false,
      isAvailable: false,
    };
  }

  return { status: "idle", message: "", isChecking: false, isAvailable: false, };
};

export default useUsernameAvailability;