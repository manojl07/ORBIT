import  API from './axios';

/* --------------------------
   GET USER PROFILE
---------------------------*/
export const getUserProfile = async (userId) => {
  const {data} = await API.get(`/users/${userId}`);

  return data;
}

/* --------------------------
   FOLLOW / UNFOLLOW
---------------------------*/
export const toggleFollow = async (userId) => {
  const {data} = await API.patch(`/users/${userId}/follow`)

  return data;
}

/* --------------------------
   SEARCH USERS
---------------------------*/
export const searchUsers = async (query) => {
  const params = new URLSearchParams({
    q: query,
  });

  const { data } = await API.get(`/users/search?${params}`);

  return data;
};

