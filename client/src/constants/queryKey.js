export const queryKeys = {
    feed: ["feed"],
    userposts: (userId) => ["user-posts", userId],
    comments: (postId) => ["comments", postId]
}