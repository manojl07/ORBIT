
import { useParams, useNavigate } from "react-router-dom";

import useConversations from "../hooks/useConversations";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import ChatEmptyState from "../components/chat/ChatEmptyState";

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const {
    data: conversations = [],
    isLoading,
    isError,
    refetch,
  } = useConversations();

  const selectedConversation = conversations.find(
    (conversation) => conversation._id === conversationId
  );

  const handleSelectConversation = (id) => {
    navigate(`/messages/${id}`);
  };

  const handleBack = () => {
    navigate("/messages");
  };

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-black text-white">
      <div
        className="
          mx-auto flex
          h-[calc(100dvh-4rem)]
          max-w-6xl
          overflow-hidden
          border-x border-zinc-900
          md:h-[calc(100dvh-4.25rem)]
        "
      >
        {/* CONVERSATION LIST */}
        <aside
          className={`
            h-full w-full shrink-0 border-r border-zinc-800
            md:w-[340px] lg:w-[380px]
            ${
              conversationId
                ? "hidden md:block"
                : "block"
            }
          `}
        >
          <ConversationList
            conversations={conversations}
            selectedConversationId={conversationId}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            onSelect={handleSelectConversation}
          />
        </aside>

        {/* CHAT CONTENT */}
        <section
          className={`
            h-full min-w-0 flex-1
            ${
              conversationId
                ? "block"
                : "hidden md:block"
            }
          `}
        >
          {selectedConversation ? (
            <ChatWindow
              key={selectedConversation._id}
              conversation={selectedConversation}
              onBack={handleBack}
            />
          ) : conversationId ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="rounded-full bg-zinc-900 p-5">
                <span className="text-2xl">💬</span>
              </div>

              <h2 className="text-lg font-semibold">
                Conversation unavailable
              </h2>

              <p className="max-w-sm text-sm text-zinc-500">
                This conversation could not be found in your inbox.
              </p>

              <button
                onClick={handleBack}
                className="mt-2 text-sm font-medium text-white hover:text-zinc-300"
              >
                Back to messages
              </button>
            </div>
          ) : (
            <ChatEmptyState />
          )}
        </section>
      </div>
    </main>
  );
};

export default Messages;
