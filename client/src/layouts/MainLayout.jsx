import { useState } from "react"
import Navbar from "./Navbar";
import CreatePostModal from "../conponents/post/CreatePostModal";


const MainLayout = ({ children }) => {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Navbar onOpenModal={() => setIsOpen(true)} />
      <CreatePostModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      {children}
    </>
  )
}

export default MainLayout