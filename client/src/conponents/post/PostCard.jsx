import React from 'react'

const PostCard = ({ post }) => {
  return (
    <div className='bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden'>

      <div className='flex items-center gap-3 p-4'>

        <img src={post.user.profileImg} alt={post.user.username} className='w-10 h-10 rounded-full object-cover' />

        <div>
          <h3 className='text-white font-semibold'>{post.user.username}</h3>
        </div>
      </div>

      <img src={post.imageUrl} alt="Post" className='w-full aspect-square object-cover' />

      <div className='p-4'>
        <div className='flex gap-4 text-white'>
          <span>❤️ {post.likesCount}</span>
          <span>💬 {post.commentsCount}</span>
        </div>

        {post.caption && (
          <p className='text-zinc-300 mt-3'>
            <span className='font-semibold text-white mr-2'>{post.user.username}</span>
            {post.caption}
          </p>
        )}
      </div>

    </div>

  )
}

export default PostCard