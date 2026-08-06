import React from 'react'

const ProfilePostsGrid = ({ posts }) => {

  return (
    <div className='grid grid-cols-3 gap-1'>

      {posts.map((post) => (
        <img src={post.imageUrl} alt="Post" className='aspect-square object-cover cursor-pointer' />
      ))}

    </div>
  )
}

export default ProfilePostsGrid