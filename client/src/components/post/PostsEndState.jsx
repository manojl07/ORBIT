import { CheckCircle2 } from "lucide-react";

const PostEndState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">

      <div className="w-16 h-16 rounded-full border border-zinc-700 flex items-center justify-center mb-3">
        <CheckCircle2 size={34} className="text-white" />
      </div>

      <h2 className="text-white text-xl font-semibold">You've seen all the latest posts.</h2>
      <p className="mt-2 mb-5 max-w-sm text-center text-zinc-500 leading-6 italic">You've seen all the latest posts. Check back later for something new.</p>
    </div>
  );
};

export default PostEndState;