import API from './axios'

export const registerUser = async (FormData) => {
  const { data } = await API.post('/auth/register', FormData)

  return data;
}

export const loginUser = async (body) => {
  const {data} = await API.post('/auth/login', body)

  return data;
}

export const getMe = async () => {
  const {data} = await API.get('/auth/me');

  return data;
}

export const logoutUser = async () => {
  const {data} = await API.post('auth/logout')

  return data;
}

export const logoutAllDevices = async () => {
  const {data} = await API.post('/auth/logout-all');

  return data;
}