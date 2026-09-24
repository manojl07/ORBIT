import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"
import Loader from "../components/ui/Loader";


const PublicRoute = ({ children }) => {

  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <Loader />
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