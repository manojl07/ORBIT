import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"


const PublicRoute = ({ children }) => {

  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div>Loading...</div>
    )
  }

  if (user) {
    return (
      <Navigate to='/' />
    )
  }

  return children;
}

export default PublicRoute