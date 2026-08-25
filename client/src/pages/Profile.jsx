import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getUserPosts } from "../api/post.api";
import { getUserProfile } from "../api/user.api";

import { useAuth } from "../hooks/useAuth";

import Loader from "../components/ui/Loader";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfilePostsGrid from "../components/profile/ProfilePostsGrid";
import PostModal from "../components/post/PostModal";
import EditProfileModal from "../components/profile/EditProfileModal";
import SkeletonGrid from "../components/UI/SkeletonGrid";

const Profile = () => {

  const { userId } = useParams();

  const { user, isAuthLoading } = useAuth();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  /*
  ==================================================
  PROFILE ID
  ==================================================
  */

  const profileId = userId || user?.id;


  /*
  ==================================================
  USER PROFILE
  ==================================================
  */

  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({

    queryKey: [
      "user-profile",
      profileId,
    ],

    queryFn: () =>
      getUserProfile(profileId),

    enabled: !!profileId,

  });


  /*
  ==================================================
  USER POSTS
  ==================================================
  */

  const {
    data: postsData,
    isLoading: postsLoading,
  } = useQuery({

    queryKey: [
      "user-posts",
      profileId,
    ],

    queryFn: () =>
      getUserPosts({
        userId: profileId,
      }),

    enabled: !!profileId,

  });


  /*
  ==================================================
  LOADING
  ==================================================
  */

  if (
    isAuthLoading ||
    profileLoading ||
    postsLoading
  ) {
    return (
      <div className="min-h-screen bg-black">

        <div className="max-w-4xl mx-auto py-10">

          <SkeletonGrid />

        </div>

      </div>
    );
  }


  /*
  ==================================================
  ERROR
  ==================================================
  */

  if (
    profileError ||
    !profileData?.data
  ) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">

        <p className="text-zinc-400">
          Failed to load profile.
        </p>

      </div>
    );
  }


  const profileUser =
    profileData.data;

  const posts =
    postsData?.data?.posts ?? [];


  /*
  ==================================================
  UI
  ==================================================
  */

  return (
    <div className="min-h-screen bg-black">

      <div className="max-w-4xl mx-auto">

        {/* PROFILE HEADER */}

        <ProfileHeader
          user={profileUser}
          onEditProfile={() =>
            setIsEditOpen(true)
          }
        />


        {/* POSTS */}

        <ProfilePostsGrid
          posts={posts}
          onPostClick={(post) => {

            setSelectedPost(post);

            setIsModalOpen(true);

          }}
        />


        {/* POST MODAL */}

        <PostModal
          isOpen={isModalOpen}

          onClose={() => {

            setIsModalOpen(false);

            setSelectedPost(null);

          }}

          post={selectedPost}
        />


        {/* EDIT PROFILE */}

        <EditProfileModal
          isOpen={isEditOpen}

          onClose={() =>
            setIsEditOpen(false)
          }

          user={profileUser}
        />

      </div>

    </div>
  );
};

export default Profile;