import { useState } from "react"
import Navbar from "./Navbar";
import CreatePostModal from "../components/post/CreatePostModal";
import MobileBottomNav from "../layouts/MobileBottomNav";


const MainLayout = ({ children }) => {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Navbar onOpenModal={() => setIsOpen(true)} />
      <MobileBottomNav onOpenModal={() => setIsOpen(true)} />
      <CreatePostModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        {children}
    </>
  )
}

export default MainLayout