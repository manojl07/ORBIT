import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { getMe } from '../api/auth.api'
import { getUserPosts } from '../api/post.api'
import Loader from '../components/ui/Loader'
import ProfileHeader from '../components/profile/ProfileHeader'
import ProfilePostsGrid from '../components/profile/ProfilePostsGrid'
import { useAuth } from '../hooks/useAuth'
import PostModal from '../components/post/PostModal'

import SkeletonGrid from "../components/UI/SkeletonGrid";


const Profile = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedPost, setSelectedPost] = useState(null);

  const { user, isAuthLoading } = useAuth();

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["user-posts", user?.id,],

    queryFn: () => getUserPosts({ userId: user.id }),

    enabled: !!user,

  });

  if (isAuthLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-black">

        <div className="max-w-4xl mx-auto py-10">

          <SkeletonGrid />

        </div>

      </div>
    );
  }


  return (
    <div className='min-h-screen bg-black'>

      <div className='max-w-4xl mx-auto'>

        <ProfileHeader user={user} />

        <ProfilePostsGrid posts={postsData?.data?.posts || []}
          onPostClick={(post) => {
            setSelectedPost(post);
            setIsModalOpen(true);
          }}
        />

        <PostModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
        />

      </div>

    </div>
  )
}

export default Profile