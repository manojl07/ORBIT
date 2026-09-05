import React from "react";

import useInfiniteFeed from "../hooks/useInfiniteFeed";

import PostCard from "../components/post/PostCard";
import FeedEndTrigger from "../components/feed/FeedEndTrigger";
import SkeletonCard from "../components/ui/SkeletonCard";
import FeedPostSkeleton from "../components/ui/FeedPostSkeleton";
import FeedEndState from "../components/feed/FeedEndState";

const Feed = () => {

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteFeed();

  /* ================================
     INITIAL LOADING
  ================================= */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black py-10">

        <div className="max-w-lg mx-auto space-y-5">

          {[...Array(5)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}

        </div>

      </div>
    );
  }

  /* ================================
     ERROR
  ================================= */

  if (isError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">

          <p className="text-white font-semibold">
            Failed to load feed
          </p>

          <p className="text-zinc-500 text-sm mt-1">
            {error?.response?.data?.message ||
              error?.message ||
              "Something went wrong"}
          </p>

        </div>
      </div>
    );
  }

  /* ================================
     MERGE ALL PAGES
  ================================= */

  const posts =
    data?.pages?.flatMap(
      (page) =>
        page?.data?.posts ?? []
    ) ?? [];

  /* ================================
     EMPTY FEED
  ================================= */

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">

        <div className="text-center">

          <h2 className="text-white text-lg font-semibold">
            Your feed is empty
          </h2>

          <p className="text-zinc-500 text-sm mt-2">
            Create your first post and start your journey on Orbit.
          </p>

        </div>

      </div>
    );
  }

  /* ================================
     FEED
  ================================= */

  return (
    <main className="min-h-screen bg-black">

      <div className="w-full max-w-xl mx-auto">

        <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-5">

          {posts.map((post) => (
            <PostCard
              key={post._id ?? post.id}
              post={post}
            />
          ))}

          <>
            {hasNextPage && (
              <FeedEndTrigger
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            )}

            {isFetchingNextPage && (
              <>
                <FeedPostSkeleton />
                <FeedPostSkeleton />
              </>
            )}

            {!hasNextPage &&
              posts.length > 0 &&
              !isFetchingNextPage && (
                <FeedEndState />
              )}
          </>

        </div>

      </div>

    </main>
  );
};

export default Feed;