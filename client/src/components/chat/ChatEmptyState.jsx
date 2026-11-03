
import { MessageCircle } from "lucide-react";

const ChatEmptyState = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-black px-6 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950">
        <MessageCircle
          size={34}
          strokeWidth={1.4}
          className="text-zinc-400"
        />
      </div>

      <h2 className="text-lg font-semibold text-white">
        Your messages
      </h2>

      <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
        Select a conversation to continue chatting with your connections.
      </p>
    </div>
  );
};

export default ChatEmptyState;
