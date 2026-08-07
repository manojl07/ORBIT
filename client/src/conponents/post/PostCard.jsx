import React from 'react'
import { Heart } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toggleLike } from '../../api/post.api'
import { data } from 'react-router-dom'


const PostCard = ({ post }) => {

  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(post._id),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["feed"] })

      const previousFreed = queryClient.getQueryData(["feed"])

      queryClient.setQueryData(["feed"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            posts: oldData.data.posts.map((p) => {
              if (p.id !== post.id) {
                return p;
              }

              return {
                ...p,
                isLiked: !p.isLiked,
                likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
              }
            })
          }
        }
      })

      return { previousFreed };
    },

    onError: (error, variable, context) => {
      queryClient.setQueryData(["feed"], context.previousFreed)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] })
    }


  })

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
          <button onClick={() => likeMutation.mutate()} className='flex items-center gap-2' disabled={likeMutation.isPending}>

            <Heart size={22} fill={post.isLiked ? "currentColor" : "none"} className={`transition-all duration-200 ${post.isLiked
                ? "text-red-500 scale-110"
                : "text-white"
              }
  `} />
            {post.likesCount}

          </button>
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