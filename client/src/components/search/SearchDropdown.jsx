import React from 'react'
import SearchItem from './SearchItem'

const SearchDropdown = ({users, loading, onClose}) => {

  return (
    <div className='absolute top-full mt-2 w-full rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl overflow-hidden z-50'>

      {loading && (
        <div className='p-5 text-center text-zinc-400'>Searching...</div>
      )}

      {!loading && users.length === 0 && (
        <div className='p-5 text-center text-zinc-500'>No users found</div>
      )}

      {!loading && users.map((user) => (
        <SearchItem key={user.id} user={user} onSelect={onClose} />
      ))}

    </div>

  )
}

export default SearchDropdown