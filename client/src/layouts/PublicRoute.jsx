import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"
import SkeletonCard from "../components/ui/SkeletonCard";


const PublicRoute = ({ children }) => {

  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <SkeletonCard />
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