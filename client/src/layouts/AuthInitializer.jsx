import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth"
import { getMe } from "../api/auth.api";
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from "@tanstack/react-query";
import { registerLogoutHandler } from "../services/auth.service";
import toast from 'react-hot-toast'


const AuthInitializer = ({ children }) => {
  const { setUser, setIsAuthLoading } = useAuth();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // =========================================
  // INITIALIZE AUTH
  // =========================================
  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      try {
        const response = await getMe();
        if (!mounted) return;
        setUser(response.data)
      } catch (error) {
        if (!mounted) return;
        if (error?.response?.status === 401) {
          setUser(null);
        } else {
          toast.error("Auth Initailization failed: error");
          setUser(null)
        }
      } finally {
        if (mounted) {
          setIsAuthLoading(false);
        }
      }
    }
    initialize();

    return () => {
      mounted = false;
    }
  }, [setUser, setIsAuthLoading])

  // =========================================
  // GLOBAL LOGOUT / SESSION EXPIRATION
  // =========================================
  useEffect(() => {
    const unregister = registerLogoutHandler(async ({ sessionExpired }) => {
      queryClient.clear();
      setUser(null);

      if (sessionExpired) {
        toast.error("Session expired. Please Login again.")
      }

      navigate('/login', { replace: true })
    })

    return unregister;
  }, [navigate, queryClient, setUser])

  return children;
}

export default AuthInitializer