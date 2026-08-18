import React from 'react'
import EmptyState from "../UI/EmptyState";


const ProfilePostsGrid = ({ posts, onPostClick }) => {

  if (!posts.length) {
    return (
      <EmptyState
        icon="📷"
        title="No Posts Yet"
        description="Share your first photo."
      />
    );
  }

  return (
    <div className='grid grid-cols-3 gap-1'>

      {posts.map((post) => (
        <button key={post.id || post._id} type='button' onClick={() => onPostClick(post)} className='group relative aspect-square overflow-hidden'>

          <img src={post.imageUrl} alt="Post" className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105' />

          <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300'></div>

        </button>
      ))}

    </div>
  )
}

export default ProfilePostsGrid