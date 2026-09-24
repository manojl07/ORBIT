import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getUserProfile } from "../api/user.api";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/ui/Loader";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfilePostsGrid from "../components/profile/ProfilePostsGrid";
import PostModal from "../components/post/PostModal";
import EditProfileModal from "../components/profile/EditProfileModal";
import SkeletonGrid from "../components/UI/SkeletonGrid";

import useInfiniteUserPosts from "../hooks/useInfiniteUserPosts";
import FeedEndTrigger from "../components/feed/FeedEndTrigger";
import PostsEndState from '../components/post/PostsEndState'

const Profile = () => {

  const { userId } = useParams();

  const { user, isAuthLoading } = useAuth();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  /*==================================================
  PROFILE ID
  ==================================================*/
  const profileId = userId || user?.id;

  /*==================================================
  USER PROFILE
  ==================================================*/
  const { data: profileData, isLoading: profileLoading, isError: profileError, } = useQuery({
    queryKey: ["user-profile", profileId,],
    queryFn: () => getUserProfile(profileId),
    enabled: !!profileId,
  });

  /*==================================================
  USER POSTS
  ==================================================*/
  const { data: postsData, isLoading: postsLoading, isError: postsError, fetchNextPage, hasNextPage, isFetchingNextPage, } = useInfiniteUserPosts(profileId);

  /*==================================================
  LOADING
  ==================================================*/
  if (isAuthLoading || profileLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto py-10">
          <SkeletonGrid />
        </div>
      </div>
    );
  }

  /*==================================================
  ERROR
  ==================================================*/
  if (profileError || !profileData?.data || postsError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">
          Failed to load profile.
        </p>
      </div>
    );
  }

  const profileUser = profileData.data;

  const posts = postsData?.pages?.flatMap((page) => page?.data?.posts ?? []) ?? [];

  /*==================================================
  UI
  ==================================================*/
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto">
        {/* PROFILE HEADER */}
        <ProfileHeader user={profileUser} isOwnProfile={String(profileId) === String(user.id)} onEditProfile={() => setIsEditOpen(true)} />
        {/* POSTS */}
        <ProfilePostsGrid posts={posts} onPostClick={(post) => { setSelectedPost(post); setIsModalOpen(true); }} />

        {hasNextPage && (
          <FeedEndTrigger fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} />
        )}

        {isFetchingNextPage && (
          <p className="text-center text-zinc-500 py-6">Loading more posts...</p>
        )}

        {!hasNextPage && posts.length > 0 && (
          <PostsEndState />
        )}

        {/* POST MODAL */}
        <PostModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedPost(null); }} post={selectedPost} />
        {/* EDIT PROFILE */}
        <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} user={profileUser} />
      </div>
    </div>
  );
};

export default Profile;