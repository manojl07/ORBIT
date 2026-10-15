import { CheckCircle2 } from "lucide-react";

const PostsEndState = () => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-700">
        <CheckCircle2 size={34} className="text-white" />
      </div>

      <h2 className="text-xl font-semibold text-white">You're all caught up</h2>

      <p className="mt-2 max-w-sm text-center leading-6 text-zinc-500">You've seen all your saved posts. Check back later for more.</p>
    </div>
  );
};

export default PostsEndState;