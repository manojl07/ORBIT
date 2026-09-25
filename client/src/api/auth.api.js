import API from "./axios";

/* =====================================================
   REGISTER
===================================================== */

export const registerUser =
  async (formData) => {
    const { data } =
      await API.post(
        "/auth/register",
        formData
      );

    return data;
  };

/* =====================================================
   LOGIN
===================================================== */

export const loginUser =
  async (body) => {
    const { data } =
      await API.post(
        "/auth/login",
        body
      );

    return data;
  };

/* =====================================================
   GET ME
===================================================== */

export const getMe = async () => {
  const { data } =
    await API.get("/auth/me");

  return data;
};

/* =====================================================
   LOGOUT
===================================================== */

export const logoutUser =
  async () => {
    const { data } =
      await API.post(
        "/auth/logout"
      );

    return data;
  };

export const logoutAllDevices =
  async () => {
    const { data } =
      await API.post(
        "/auth/logout-all"
      );

    return data;
  };

/* =====================================================
   PROFILE
===================================================== */

export const updateProfile =
  async (formData) => {
    const { data } =
      await API.patch(
        "/auth/profile",
        formData
      );

    return data;
  };

/* =====================================================
   EMAIL VERIFICATION
===================================================== */

export const verifyEmail =
  async (token) => {
    const { data } =
      await API.post(
        "/auth/verify-email",
        { token }
      );

    return data;
  };

export const resendVerification =
  async (email) => {
    const { data } =
      await API.post(
        "/auth/resend-verification",
        { email }
      );

    return data;
  };

/* =====================================================
   PASSWORD RECOVERY
===================================================== */

export const forgotPassword =
  async (email) => {
    const { data } =
      await API.post(
        "/auth/forgot-password",
        { email }
      );

    return data;
  };

export const resetPassword =
  async ({
    token,
    password,
  }) => {
    const { data } =
      await API.post(
        "/auth/reset-password",
        {
          token,
          password,
        }
      );

    return data;
  };