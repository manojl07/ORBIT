import React from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toggleLike } from '../../api/post.api'
import { useState } from 'react'
import CommentModal from '../comment/CommentModal'


const PostCard = ({ post }) => {

  const [isCommentOpen, setIsCommentOpen] = useState(false);

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
              if (p._id !== post.id) {
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
    <div className='bg-zinc-950 border border-zinc-800/70 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.25)]'>

      <div className="flex items-center justify-between px-4 py-3">

        <div className="flex items-center gap-3 py-1">
          <img
            src={post.user.profileImg}
            alt={post.user.username}
            className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-700"
          />

          <div>
            <h3 className="text-sm text-white font-semibold">
              {post.user.username}
            </h3>
          </div>
        </div>
      </div>

      <img src={post.imageUrl} alt="Post" className='w-full aspect-[1.05/1]object-cover bg-zinc-900' />

      <div className="px-4 py-3">

        <div className="flex items-center gap-5 text-white">

          {/* Like */}
          <button
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            className="flex items-center gap-2 active:scale-90 transition-transform"
          >
            <Heart
              size={21}
              fill={post.isLiked ? "currentColor" : "none"}
              className={`transition-all duration-200 ${post.isLiked
                ? "text-red-500 scale-110"
                : "text-zinc-200"
                }`}
            />

            <span className="text-sm">
              {post.likesCount}
            </span>
          </button>

          {/* Comments */}
          <button
            onClick={() => setIsCommentOpen(true)}
            className="flex items-center gap-2 active:scale-90 transition-transform"
          >
            <MessageCircle
              size={21}
              className="text-zinc-200"
            />

            <span className="text-sm">
              {post.commentsCount}
            </span>
          </button>

        </div>

        {/* Caption */}
        {post.caption && (
          <p className="mt-3 text-sm leading-5 text-zinc-300">
            <span className="font-semibold text-white mr-2">
              {post.user.username}
            </span>

            {post.caption}
          </p>
        )}

        {/* Comments */}
        {post.commentsCount > 0 && (
          <button
            onClick={() => setIsCommentOpen(true)}
            className="mt-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors" >View all {post.commentsCount} comments</button>
        )}

        {/* Date */}
        <p className="mt-2 text-[10px] font-medium tracking-widest text-zinc-600  uppercase">
          {new Date(post.createdAt).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric",})}
        </p>

      </div>

      <CommentModal
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        post={post}
      />

    </div>

  )
}

export default PostCard