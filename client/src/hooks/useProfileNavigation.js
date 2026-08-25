import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";


const userProfileNavigation = () => {
  const navigate = useNavigate();

  const {user} = useAuth();

  const goToProfile = (targetedUserId) => {
    if(!targetedUserId) return;

    if(targetedUserId === user?.id){
      navigate("/profile")
    } else {
      navigate(`/profile/${targetedUserId}`)
    }
  }

  return goToProfile;
}

export default userProfileNavigation