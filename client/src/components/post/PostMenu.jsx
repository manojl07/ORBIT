import React from 'react'
import { useState } from 'react'
import { MoreHorizontal, Trash2 } from "lucide-react";

import { useAuth } from '../../hooks/useAuth';


const PostMenu = ({post, onDeleteClick}) => {
  const [showMenu, setShowMenu] = useState(false)
  const {user} = useAuth();

  const ownerId = post?.user?._id ?? post?.user?.id;
  const currentUserId = user?.id ?? user?._id;

  const isOwner = String(ownerId ?? "") === String(currentUserId ?? "");

  if(!post || !isOwner) return null;

  const handleDeleteClick = () => {
    setShowMenu(false);
    onDeleteClick?.();
  }
  return (
    <div className='relative ml-auto'>

      <button type='button' 
      onClick={(e) => {
      e.stopPropagation();
      setShowMenu((prev) => !prev);}}
      className='flex items-center justify-center w-9 h-9 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition' aria-label='Post options'
      ><MoreHorizontal size={21} /></button>

      {showMenu && (
        <div onClick={(e) => e.stopPropagation()} className='absolute right-0 top-10 z-100 w-44 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden'>

          <button type='button' onClick={handleDeleteClick} className='w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-500 hover:bg-zinc-800 transition'>
            <Trash2 size={17} /><span>Delete Post</span>
          </button>

        </div>
      )}

    </div>
  )
}

export default PostMenu