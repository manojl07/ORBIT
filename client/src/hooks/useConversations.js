import { useQuery } from "@tanstack/react-query";

import { getConversations } from "../api/chat.api";
import { queryKeys } from "../constants/queryKey";

const useConversations = () => {
  return useQuery({
    queryKey: queryKeys.conversations,

    queryFn: getConversations,

    staleTime: 30 * 1000,

    gcTime: 10 * 60 * 1000,

    refetchOnWindowFocus: true,
  });
};

export default useConversations;