import API from "./axios"


export const getFeed = async ({ page = 1, limit = 10 }) => {
  const { data } = await API.get(`/posts/feed?page=${page}&limit=${limit}`)

  return data;
}

export const getUserPosts = async ({ userId, page = 1, limit = 10 }) => {

  const { data } = await API.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);

  return data;
}