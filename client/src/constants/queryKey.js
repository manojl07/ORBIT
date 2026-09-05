export const queryKeys = {
  // Feed
  feed: ["feed"],

  // Profile
  profile: (userId) => ["user-profile", userId],

  // Posts
  userPosts: (userId) => ["user-posts", userId],

  // Comments
  comments: (postId) => ["comments", postId],

  // Social
  followers: (userId) => ["followers", userId],
  following: (userId) => ["following", userId],

  // Search
  searchUsers: (query) => ["search-users", query],
};