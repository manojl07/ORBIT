import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { getFeed } from '../api/post.api'
import PostCard from '../conponents/post/PostCard'
import { Link } from 'react-router-dom'
import { getMe } from '../api/auth.api'
import Loader from '../conponents/ui/Loader'

const Feed = () => {

  const { data, isLoading, error } = useQuery({
    queryKey: ["feed"],

    queryFn: () => getFeed({ page: 1, limit: 10 })

  })

  if (isLoading) {
    return (
    <Loader />
    )
  }

  if (error) {
    return (
      <div className='text-red-500'>Failed to load feed</div>
    )
  }


  return (
    <div className='min-h-screen bg-black py-10'>

      <Link to={`/profile`} className='text-white' >Profile</Link>

      <div className='max-w-2xl mx-auto space-y-6'>

        {data.data.posts.map((post) => (
          <PostCard key={post.id || post._id} post={post} />
        ))}

      </div>

    </div>
  )
}

export default Feed;