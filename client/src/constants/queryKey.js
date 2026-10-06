export const queryKeys = {
  feed: ["feed"],

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