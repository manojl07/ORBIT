import React, { useState } from 'react'
import EditProfileModal from './EditProfileModal';

const ProfileHeader = ({ user }) => {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className='flex flex-col items-center gap-4 py-8'>

        <img src={user.profileImg} alt={user.username} className='w-22 h-22 rounded-full object-cover border-4 border-zinc-800' />

        <h1 className='text-2xl font-bold text-white'>{user.username}</h1>

        <button onClick={() => setIsOpen(true)} className='px-5 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700'>
          Edit Profile
        </button>

        <div className='flex gap-8 text-white'>

          <div>
            <strong>{user.postsCount}</strong>
            <p>Posts</p>
          </div>

          <div>
            <strong>{user.followersCount}</strong>
            <p>Followers</p>
          </div>

          <div>
            <strong>{user.followingCount}</strong>
            <p>Following</p>
          </div>

        </div>

        {user.bio && (
          <p className='text-zinc-400 text-center'>{user.bio}</p>
        )}

      </div>

      <EditProfileModal isOpen={isOpen} onClose={() => setIsOpen(false)} user={user} />
    </>
  )
}

export default ProfileHeader