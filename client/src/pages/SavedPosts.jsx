
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  Heart,
  MessageCircle,
  RefreshCw,
} from "lucide-react";

import {
  getSavedPosts,
  getLikedPosts,
  getCommentedPosts,
} from "../api/post.api";

import { queryKeys } from "../constants/queryKey";
import useSavePost from "../hooks/useSavePost";

import PostModal from "../components/post/PostModal";
import FeedEndTrigger from "../components/feed/FeedEndTrigger";
import PostsEndState from "../components/post/PostsEndState";
import EmptyState from "../components/ui/EmptyState";
import SkeletonGrid from "../components/ui/SkeletonGrid";

const PAGE_SIZE = 12;

const activityTabs = [
  {
    id: "saved",
    label: "Saved",
    icon: Bookmark,
    queryKey: queryKeys.savedPosts,
    fetchPosts: getSavedPosts,
    emptyTitle: "No saved posts yet",
    emptyDescription:
      "Save posts you want to revisit, and they'll appear here.",
    emptyIcon: "🔖",
  },
  {
    id: "liked",
    label: "Liked",
    icon: Heart,
    queryKey: queryKeys.likedPosts,
    fetchPosts: getLikedPosts,
    emptyTitle: "No liked posts yet",
    emptyDescription:
      "Posts you like will be collected here.",
    emptyIcon: "❤️",
  },
  {
    id: "commented",
    label: "Commented",
    icon: MessageCircle,
    queryKey: queryKeys.commentedPosts,
    fetchPosts: getCommentedPosts,
    emptyTitle: "No commented posts yet",
    emptyDescription:
      "Posts you've commented on will appear here.",
    emptyIcon: "💬",
  },
];

/* =====================================================
   YOUR ACTIVITY
===================================================== */

const SavedPosts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPost, setSelectedPost] = useState(null);

  const requestedTab = searchParams.get("tab");

  const activeTab = activityTabs.some(
    (item) => item.id === requestedTab
  )
    ? requestedTab
    : "saved";

  const queryClient = useQueryClient();

  const tab =
    activityTabs.find((item) => item.id === activeTab) ??
    activityTabs[0];

  const {
    data,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: tab.queryKey,

    queryFn: ({ pageParam = 1 }) =>
      tab.fetchPosts({
        page: pageParam,
        limit: PAGE_SIZE,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;

      if (!pagination) {
        return undefined;
      }

      return pagination.page < pagination.totalPages
        ? pagination.page + 1
        : undefined;
    },

    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const posts =
    data?.pages?.flatMap(
      (page) => page?.data?.posts ?? []
    ) ?? [];

  const handleTabChange = (tabId) => {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.set("tab", tabId);

    setSearchParams(nextParams, { replace: true });
    setSelectedPost(null);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  const handleRetry = async () => {
    await queryClient.invalidateQueries({
      queryKey: tab.queryKey,
    });

    await refetch();
  };

  return (
    <div className="min-h-screen bg-black">
      <main className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-8">
        {/* PAGE HEADER */}

        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Your activity
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Your saved posts, likes, and conversations in one place.
          </p>
        </header>

        {/* ACTIVITY TABS */}

        <div
          role="tablist"
          aria-label="Your activity"
          className="mb-5 grid grid-cols-3 border-b border-zinc-800"
        >
          {activityTabs.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`activity-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="activity-panel"
                onClick={() => handleTabChange(item.id)}
                className={`relative flex min-h-12 items-center justify-center gap-2 px-2 text-sm font-medium transition sm:min-h-14 sm:text-base ${active
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-200"
                  }`}
              >
                <Icon
                  size={18}
                  fill={
                    active && item.id === "liked"
                      ? "currentColor"
                      : "none"
                  }
                />

                <span>{item.label}</span>

                {active && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* ACTIVE TAB CONTENT */}

        <section
          id="activity-panel"
          role="tabpanel"
          aria-labelledby={`activity-tab-${activeTab}`}
          aria-busy={isLoading || isFetching}
        >
          {isLoading ? (
            <SkeletonGrid />
          ) : isError ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <p className="text-base font-semibold text-white">
                Couldn't load {tab.label.toLowerCase()} posts
              </p>

              <p className="mt-2 max-w-sm text-sm text-zinc-500">
                Something went wrong while loading your activity.
              </p>

              <button
                type="button"
                onClick={handleRetry}
                disabled={isFetching}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50"
              >
                <RefreshCw size={15} />
                Try again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={tab.emptyIcon}
              title={tab.emptyTitle}
              description={tab.emptyDescription}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:gap-4">
              {posts.map((post) => (
                <ActivityPostTile
                  key={post.id ?? post._id}
                  post={post}
                  activeTab={activeTab}
                  onPostClick={handlePostClick}
                />
              ))}
            </div>
          )}
        </section>

        {/* INFINITE SCROLL */}

        {hasNextPage && !isError && (
          <FeedEndTrigger
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}

        {isFetchingNextPage && (
          <p className="py-6 text-center text-sm text-zinc-500">
            Loading more activity...
          </p>
        )}

        {!hasNextPage && posts.length > 0 && !isError && (
          <PostsEndState />
        )}
      </main>

      <PostModal
        isOpen={Boolean(selectedPost)}
        onClose={handleCloseModal}
        post={selectedPost}
        sourceQueryKey={tab.queryKey}
      />
    </div>
  );
};

/* =====================================================
   ACTIVITY POST TILE
===================================================== */

const ActivityPostTile = ({
  post,
  activeTab,
  onPostClick,
}) => {
  const {
    toggleSaved,
    isPending,
  } = useSavePost({ post });

  const showComment = activeTab === "commented";

  return (
    <article className="min-w-0 overflow-hidden rounded-lg bg-zinc-950">
      <div className="group relative aspect-square overflow-hidden bg-zinc-900">
        <button
          type="button"
          onClick={() => onPostClick(post)}
          aria-label={`Open post${post.caption ? `: ${post.caption}` : ""
            }`}
          className="absolute inset-0 h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
        >
          <img
            src={post.imageUrl}
            alt={post.caption || "Post"}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />

          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/50 group-hover:opacity-100 group-focus-visible:bg-black/50 group-focus-visible:opacity-100">
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

        {/* SAVE CONTROL */}

        <button
          type="button"
          disabled={isPending}
          onClick={() => toggleSaved()}
          aria-label={
            post.isSaved
              ? "Remove post from saved"
              : "Save post"
          }
          title={
            post.isSaved
              ? "Remove from saved"
              : "Save post"
          }
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition hover:bg-black disabled:opacity-50"
        >
          <Bookmark
            size={17}
            fill={post.isSaved ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* YOUR MOST RECENT COMMENT */}

      {showComment && post.latestComment && (
        <button
          type="button"
          onClick={() => onPostClick(post)}
          className="block w-full px-2.5 py-2 text-left sm:px-3"
        >
          <p className="line-clamp-2 text-xs leading-5 text-zinc-400 sm:text-sm">
            <span className="font-semibold text-zinc-300">
              Your comment:{" "}
            </span>
            {post.latestComment}
          </p>
        </button>
      )}
    </article>
  );
};

export default SavedPosts;
