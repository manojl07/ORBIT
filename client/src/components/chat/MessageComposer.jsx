
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

const TYPING_DEBOUNCE_MS = 1000;

const MessageComposer = ({onSend,onTypingStart,onTypingStop,isSending,disabled,}) => {
  const [text, setText] = useState("");

  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  const stopTyping = () => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop?.();
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    console.log("[COMPOSER] Input changed:", value);
    setText(value);

    if (!value.trim() || disabled) {
      stopTyping();
      return;
    }

    if (!isTypingRef.current) {
      console.log("[COMPOSER] Calling onTypingStart");
      isTypingRef.current = true;
      onTypingStart?.();
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {stopTyping();}, TYPING_DEBOUNCE_MS);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText || isSending || disabled) return;

    stopTyping();
    onSend(trimmedText);
    setText("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  useEffect(() => {
    if (disabled) {
      stopTyping();
    }
  }, [disabled]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      if (isTypingRef.current) {
        onTypingStop?.();
      }
    };
  }, [onTypingStop]);

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2" >
      <textarea value={text} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="Message..." rows={1} maxLength={2000} disabled={disabled} className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-5 text-white outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50" />

      <button type="submit" disabled={!text.trim() || isSending || disabled} aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black transition hover:bg-zinc-200 active:scale-95 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500" >
        {isSending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
        ) : (
          <Send size={18} />
        )}
      </button>
    </form>
  );
};

export default MessageComposer;
