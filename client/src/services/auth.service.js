let logoutHandler = null;

let isLoggingOut = false;

export const registerLogoutHandler = (handler) => {
  logoutHandler = handler;

  return () => {
    logoutHandler = null;
  };
};

export const triggerLogout = async (
  options = {}
) => {
  if (isLoggingOut) return;

  isLoggingOut = true;

  try {
    await logoutHandler?.(options);
  } finally {
    isLoggingOut = false;
  }
};