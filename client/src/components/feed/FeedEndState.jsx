import { CheckCircle2 } from "lucide-react";

const FeedEndState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">

      <div className="w-16 h-16 rounded-full border border-zinc-700 flex items-center justify-center mb-5">
        <CheckCircle2
          size={34}
          className="text-white"
        />
      </div>

      <h2 className="text-white text-xl font-semibold">
        You're all caught up
      </h2>

      <p className="mt-2 max-w-sm text-center text-zinc-500 leading-6">
        You've seen all new posts.
        Check back later for more updates.
      </p>

    </div>
  );
};

export default FeedEndState;