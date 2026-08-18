import API from "../api/axios"

let logoutHandler = null;
let isLoggingOut = false;

export const registerLogoutHandler = (handler) => {
  logoutHandler = handler;

  return () => {
    logoutHandler = null;
  };
};

export const triggerLogout = async () => {
  if (isLoggingOut) return;

  isLoggingOut = true;

  try {
    await logoutHandler?.();
  } finally {
    isLoggingOut = false;
  }
};

export const refreshAccessToken = async () => {
  const {data} = await API.post('/auth/refresh');

  return data;
}

export const logoutUser = async () => {
  await API.post('/auth/logout');
}