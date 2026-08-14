const PostMeta = ({ post }) => {
  return (
    <div className="px-5 py-3 border-t border-zinc-800">

      <p className="text-white font-semibold text-sm">
        {post.likesCount} {post.likesCount === 1 ? "like" : "likes"}
      </p>

      <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
        {new Date(post.createdAt).toLocaleDateString()}
      </p>

    </div>
  );
};

export default PostMeta;