export const queryKeys = {
  // Keep all your existing keys.
  feed: ["feed"],
  profile: (userId) => ["user-profile", userId],
  userPosts: (userId) => ["user-posts", userId],
  comments: (postId) => ["comments", postId],
  followers: (userId) => ["followers", userId],
  following: (userId) => ["following", userId],
  searchUsers: (query) => ["search-users", query],

  // Activity collections
  savedPosts: ["saved-posts"],
  likedPosts: ["liked-posts"],
  commentedPosts: ["commented-posts"],
  usernameAvailability: (username) => ["username-availability",username,],
};