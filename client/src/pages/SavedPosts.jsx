import { useState } from "react";
import {
  Bookmark,
  Heart,
  MessageCircle,
} from "lucide-react";

import useInfiniteSavedPosts from "../hooks/useInfiniteSavedPosts";
import useSavePost from "../hooks/useSavePost";

import PostModal from "../components/post/PostModal";
import FeedEndTrigger from "../components/feed/FeedEndTrigger";
import PostsEndState from "../components/post/PostsEndState";
import EmptyState from "../components/ui/EmptyState.jsx";
import SkeletonGrid from "../components/ui/SkeletonGrid.jsx";

/* =====================================================
   SAVED POSTS PAGE
===================================================== */

const SavedPosts = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSavedPosts();

  const posts =
    data?.pages?.flatMap(
      (page) => page?.data?.posts ?? []
    ) ?? [];

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closePostModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6">
          <SkeletonGrid />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-black px-4">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-white">
            Failed to load saved posts
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <main className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-8">
        {/* PAGE HEADER */}

        <div className="mb-6 flex items-center gap-3">
          <Bookmark size={25} className="text-white" />

          <div>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">
              Saved posts
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Only you can see the posts you've saved.
            </p>
          </div>
        </div>

        {/* EMPTY STATE */}

        {posts.length === 0 ? (
          <EmptyState
            icon="🔖"
            title="No saved posts yet"
            description="Save posts you want to revisit, and they'll appear here."
          />
        ) : (
          <section
            aria-label="Saved posts"
            className="grid grid-cols-3 gap-[2px] bg-black"
          >
            {posts.map((post) => (
              <SavedPostTile
                key={post.id ?? post._id}
                post={post}
                onPostClick={handlePostClick}
              />
            ))}
          </section>
        )}

        {/* INFINITE SCROLL */}

        {hasNextPage && (
          <FeedEndTrigger
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}

        {isFetchingNextPage && (
          <p className="py-6 text-center text-sm text-zinc-500">
            Loading more saved posts...
          </p>
        )}

        {!hasNextPage && posts.length > 0 && (
          <PostsEndState />
        )}
      </main>

      <PostModal
        isOpen={isModalOpen}
        onClose={closePostModal}
        post={selectedPost}
      />
    </div>
  );
};

/* =====================================================
   SAVED POST TILE
===================================================== */

const SavedPostTile = ({ post, onPostClick }) => {
  const { toggleSaved, isPending, isSaved, } = useSavePost({ post });

  return (
    <div className="group relative aspect-square overflow-hidden bg-zinc-900">
      <button
        type="button"
        onClick={() => onPostClick(post)}
        aria-label={`Open saved post${post.caption ? `: ${post.caption}` : ""
          }`}
        className="absolute inset-0 h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
      >
        <img
          src={post.imageUrl}
          alt={post.caption || "Saved post"}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />

        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/45 group-hover:opacity-100 group-focus-visible:bg-black/45 group-focus-visible:opacity-100">
          <span className="flex items-center gap-4 text-white">
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <Heart size={18} fill="currentColor" />
              {post.likesCount ?? 0}
            </span>

            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <MessageCircle size={18} fill="currentColor" />
              {post.commentsCount ?? 0}
            </span>
          </span>
        </span>
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() => toggleSaved()}
        aria-label="Remove post from saved"
        title="Remove from saved"
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-sm transition hover:bg-black disabled:cursor-wait disabled:opacity-50"
      >
        <Bookmark size={17} className={isSaved ? "fill-current" : ""}
        />
      </button>
    </div>
  );
};

export default SavedPosts;