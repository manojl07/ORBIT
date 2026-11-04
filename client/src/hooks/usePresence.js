import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../constants/queryKey";

const usePresence = () =>
  useQuery({
    queryKey: queryKeys.presence,
    queryFn: () => ({}),
    enabled: false,
    staleTime: Infinity,
    gcTime: 10 * 60 * 1000,
  });

export default usePresence;
