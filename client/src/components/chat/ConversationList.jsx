
import { MessageCircle, Search, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import ConversationItem from "./ConversationItem";

const ConversationList = ({
  conversations,
  selectedConversationId,
  isLoading,
  isError,
  onRetry,
  onSelect,
}) => {
  const [search, setSearch] = useState("");

  const filteredConversations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return conversations;

    return conversations.filter((conversation) =>
      conversation.otherUser?.username
        ?.toLowerCase()
        .includes(normalizedSearch)
    );
  }, [conversations, search]);

  return (
    <div className="flex h-full flex-col bg-black">
      {/* HEADER */}
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-zinc-800 px-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Messages
          </h1>

          {!isLoading && !isError && (
            <p className="mt-0.5 text-xs text-zinc-500">
              {conversations.length} conversations
            </p>
          )}
        </div>

        <button
          type="button"
          aria-label="Messages"
          className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
        >
          <MessageCircle size={21} />
        </button>
      </div>

      {/* SEARCH */}
      <div className="shrink-0 px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3">
          <Search size={17} className="shrink-0 text-zinc-500" />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations..."
            className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* CONVERSATION CONTENT */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <ConversationSkeleton />
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-sm text-zinc-400">
              Failed to load conversations.
            </p>

            <button
              type="button"
              onClick={() => onRetry?.()}
              className="mt-4 inline-flex items-center gap-2 text-sm text-white hover:text-zinc-300"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 rounded-full bg-zinc-900 p-5">
              <MessageCircle size={25} className="text-zinc-500" />
            </div>

            <h3 className="text-sm font-semibold text-white">
              {search ? "No results found" : "No conversations yet"}
            </h3>

            <p className="mt-2 max-w-[240px] text-xs leading-5 text-zinc-500">
              {search
                ? "Try searching with another username."
                : "Visit someone's profile and tap Message to start a conversation."}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              active={selectedConversationId === conversation._id}
              onClick={() => onSelect(conversation._id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const ConversationSkeleton = () => (
  <div className="space-y-1 p-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="flex animate-pulse items-center gap-3 rounded-xl p-3"
      >
        <div className="h-12 w-12 shrink-0 rounded-full bg-zinc-800" />

        <div className="flex-1 space-y-2">
          <div className="h-3 w-28 rounded bg-zinc-800" />
          <div className="h-3 w-40 max-w-full rounded bg-zinc-900" />
        </div>
      </div>
    ))}
  </div>
);

export default ConversationList;
