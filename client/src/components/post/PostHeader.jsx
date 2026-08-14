import { MoreHorizontal } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const PostHeader = ({ post }) => {

  const { user } = useAuth();

  const ownerId =
    post.user?._id ||
    post.user?.id;

  return (
    <div
      className="flex items-center justify-between px-3 py-2 min-[500px]:px-4 min-[500px]:py-3 min-[1000px]:px-5 min-[1000px]:py-4 border-b
        border-zinc-800">

      <div className="flex items-center gap-2">

        <img
          src={post.user?.profileImg}
          alt={post.user?.username || ""}
          className="w-8 h-8 min-[500px]:w-9 min-[500px]:h-9 min-[1000px]:w-10 min-[1000px]:h-10 rounded-full object-cover" />

        <p className="text-xs min-[500px]:text-sm min-[1000px]:text-base font-semibold text-white">
          {post.user?.username}
        </p>

      </div>


      {user?.id === ownerId && (
        <button type="button" className="p-1.5 min-[500px]:p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
          <MoreHorizontal size={18} className="min-[500px]:w-5 min-[500px]:h-5" />
        </button>
      )}

    </div>
  );
};

export default PostHeader;