import React from 'react'
import userProfileNavigation from '../../hooks/useProfileNavigation'

const SearchItem = ({user, onSelect}) => {
  const goToProfile = userProfileNavigation();

  const handleClick = () => {
    onSelect?.();
    goToProfile(user.id)
  }


  return (
    <button className='w-full flex items-center gap-3 p-3 hover:bg-zinc-800 transition' onClick={handleClick}>

      <img src={user.profileImg} alt={user.username} className='w-10 h-10 rounded-full object-cover' />

      <div className='text-left'><p className='text-white font-medium'>{user.username}</p></div>

    </button>
  )
}

export default SearchItem