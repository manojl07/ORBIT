import API from '../api/axios'

export const getComments = async (postId) => {
  const { data } = await API.get(`/posts/${postId}/comments`)

  return data;
}

export const createComment = async ({ postId, content }) => {
  const { data } = await API.post(`/posts/${postId}/comments`, { content })

  return data;
}

export const deleteComment = async (commentId) => {
  const {data} = await API.delete(`/comments/${commentId}`)

  return data;
}