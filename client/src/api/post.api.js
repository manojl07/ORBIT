import API from "./axios";

/* =====================================================
   FEED
===================================================== */

export const getFeed = async ({
  page = 1,
  limit = 10,
}) => {
  const { data } = await API.get(
    `/posts/feed?page=${page}&limit=${limit}`
  );

  return data;
};

/* =====================================================
   USER POSTS
===================================================== */

export const getUserPosts = async ({
  userId,
  page = 1,
  limit = 10,
}) => {
  const { data } = await API.get(
    `/posts/user/${userId}?page=${page}&limit=${limit}`
  );

  return data;
};

/* =====================================================
   CREATE POST
===================================================== */

export const createPost = async (formData) => {
  const { data } = await API.post(
    "/posts",
    formData
  );

  return data;
};

/* =====================================================
   LIKE
===================================================== */

export const toggleLike = async (postId) => {
  const { data } = await API.post(
    `/posts/${postId}/like`
  );

  return data;
};

/* =====================================================
   SAVE POST
===================================================== */

export const savePost = async (postId) => {
  const { data } = await API.put(
    `/posts/${postId}/save`
  );

  return data;
};

/* =====================================================
   UNSAVE POST
===================================================== */

export const unsavePost = async (postId) => {
  const { data } = await API.delete(
    `/posts/${postId}/save`
  );

  return data;
};

/* =====================================================
   GET SAVED POSTS
===================================================== */

export const getSavedPosts = async ({
  page = 1,
  limit = 12,
} = {}) => {
  const { data } = await API.get(
    `/posts/saved?page=${page}&limit=${limit}`
  );

  return data;
};

/* =====================================================
   GET LIKED POSTS
===================================================== */

export const getLikedPosts = async ({
  page = 1,
  limit = 12,
} = {}) => {
  const { data } = await API.get(
    `/posts/liked?page=${page}&limit=${limit}`
  );

  return data;
};

/* =====================================================
   GET COMMENTED POSTS
===================================================== */

export const getCommentedPosts = async ({
  page = 1,
  limit = 12,
} = {}) => {
  const { data } = await API.get(
    `/posts/commented?page=${page}&limit=${limit}`
  );

  return data;
};

/* =====================================================
   DELETE POST
===================================================== */

export const deletePost = async (postId) => {
  const { data } = await API.delete(
    `/posts/${postId}`
  );

  return data;
};