import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth"
import { getMe } from "../api/auth.api";


const AuthInitializer = ({ children }) => {
  const { setUser, setIsAuthLoading } = useAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await getMe();
        setUser(response.data)

      } catch (error) {
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    }

    initializeAuth();

  }, [])

  return children;
}

export default AuthInitializer