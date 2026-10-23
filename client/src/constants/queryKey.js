export const queryKeys = {
  feed: ["feed"],
  savedPosts: ["saved-posts"],
  likedPosts: ["liked-posts"],
  commentedPosts: ["commented-posts"],

  profile: (userId) => [
    "user-profile",
    userId,
  ],

  userPosts: (userId) => [
    "user-posts",
    userId,
  ],

  comments: (postId) => [
    "comments",
    postId,
  ],

  followers: (userId) => [
    "followers",
    userId,
  ],

  following: (userId) => [
    "following",
    userId,
  ],

  searchUsers: (query) => [
    "search-users",
    query,
  ],

  usernameAvailability: (
    username
  ) => [
      "username-availability",
      username,
    ],
};