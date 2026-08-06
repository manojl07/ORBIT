import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { getMe } from '../api/auth.api'
import { getUserPosts } from '../api/post.api'
import Loader from '../conponents/ui/Loader'
import ProfileHeader from '../conponents/profile/ProfileHeader'
import ProfilePostsGrid from '../conponents/profile/ProfilePostsGrid'
import {useAuth} from '../hooks/useAuth'


const Profile = () => {

  const {user, isAuthLoading} = useAuth();

  const {data: postsData, isLoading: postsLoading} = useQuery({
    queryKey: ["user-posts", user?.id,],

    queryFn: () => getUserPosts({userId: user.id}),

    enabled: !!user,

  });

  if(isAuthLoading || postsLoading){
    return <Loader />
  }


  return (
    <div className='min-h-screen bg-black'>

      <div className='max-w-4xl mx-auto'>

        <ProfileHeader user={user} />

        <ProfilePostsGrid posts={postsData.data.posts} />

      </div>

    </div>
  )
}

export default Profile