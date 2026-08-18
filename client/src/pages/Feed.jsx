import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { getFeed } from '../api/post.api'
import PostCard from '../components/post/PostCard'
import { Link } from 'react-router-dom'
import Loader from '../components/ui/Loader'

import SkeletonCard from "../components/UI/SkeletonCard";

const Feed = () => {

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["feed"],

    queryFn: () => getFeed({ page: 1, limit: 10 })

  })

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

  if (isError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white font-semibold">
            Failed to load feed
          </p>

          <p className="text-zinc-500 text-sm mt-1">
            {error?.response?.data?.message ||
              "Something went wrong"}
          </p>
        </div>
      </div>
    )
  }

  const posts = data?.data?.posts ?? [];

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


  return (
    <main className="min-h-screen bg-black">
      <div className="w-full max-w-xl mx-auto">
        <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-5">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

export default Feed;