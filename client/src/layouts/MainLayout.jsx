import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import CreatePostModal from "../components/post/CreatePostModal";
import MobileBottomNav from "./MobileBottomNav";

const MainLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  // Start each route at the top of the page.
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return (
    <>
      <Navbar onOpenModal={() => setIsOpen(true)} />

      <MobileBottomNav
        onOpenModal={() => setIsOpen(true)}
      />

      <CreatePostModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      {children}
    </>
  );
};

export default MainLayout;