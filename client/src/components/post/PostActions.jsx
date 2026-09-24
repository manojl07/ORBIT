import React from "react";
import { Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

import useLikePost from "../../hooks/useLikePost";


const PostActions = ({ post, queryKey, onCommentClick, }) => {

  const {toggleLike, isPending} = useLikePost({post, queryKey})

  return (
    <div className="flex items-center gap-5 text-white">

      {/* LIKE */}
      <button onClick={() => toggleLike()} disabled={isPending} className="flex items-center gap-2" >

        <motion.div animate={post.isLiked ? {scale: [1, 1.35, 0.95, 1], rotate: [0, -8, 8, 0],} : {scale: 1, rotate: 0,}}
          whileTap={{scale: 0.75,}} transition={{duration: 0.35,}}>
          <Heart size={24} className={post.isLiked ? "fill-red-500 text-red-500" : "text-white"} />
        </motion.div>

        <span className="text-white text-sm font-medium">{post.likesCount}</span>

      </button>


      {/* COMMENT */}
      <button onClick={onCommentClick}className="flex items-center gap-2 transition-transform active:scale-90">
        <MessageCircle size={21} className="text-zinc-200" />
        <span className="text-sm">{post.commentsCount}</span>
      </button>

    </div>
  );
};

export default PostActions;