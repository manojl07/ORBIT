import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  Plus,
  Heart,
  User,
  X,
} from "lucide-react";

import SearchBar from "../components/search/SearchBar";

const MobileBottomNav = ({ onOpenModal }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);

  const isHome = location.pathname === "/";

  const isProfile =
    location.pathname === "/profile" ||
    location.pathname.startsWith("/profile/");

  const handleHome = () => {
    setSearchOpen(false);
    navigate("/");
  };

  const handleSearch = () => {
    setSearchOpen(true);
  };

  const handleCreate = () => {
    setSearchOpen(false);
    onOpenModal?.();
  };

  const handleProfile = () => {
    setSearchOpen(false);
    navigate("/profile");
  };

  return (
    <>
      {/* MOBILE SEARCH */}
{searchOpen && (
  <div
    className="
      md:hidden
      fixed
      left-3
      right-3
      top-[4.5rem]
      bottom-24
      z-[110]
    "
  >
    <div
      className="
        relative
        w-full
        max-w-md
        mx-auto
        rounded-2xl
        border
        border-white/10
        bg-black/60
        backdrop-blur-2xl
        shadow-[0_20px_60px_rgba(0,0,0,0.55)]
        p-2.5
      "
    >

      <SearchBar
        autoFocus
        onClosePanel={() =>
          setSearchOpen(false)
        }
      />

    </div>
  </div>
)}

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed left-3 right-3 bottom-3 z-[100]">
        <div
          className="
            h-16
            rounded-2xl
            border border-white/15

            bg-black/50
            backdrop-blur-2xl
            backdrop-saturate-150

            shadow-[0_12px_40px_rgba(0,0,0,0.55)]
          "
        >
          <div className="grid grid-cols-5 h-full items-center px-2">

            {/* HOME */}
            <NavButton
              icon={<Home size={21} />}
              active={isHome}
              label="Home"
              onClick={handleHome}
            />

            {/* SEARCH */}
            <NavButton
              icon={<Search size={21} />}
              active={searchOpen}
              label="Search"
              onClick={handleSearch}
            />

            {/* CREATE */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleCreate}
                aria-label="Create post"
                className="
                  flex
                  items-center
                  justify-center

                  w-12
                  h-12

                  rounded-xl

                  bg-zinc-800/90
                  border border-white/20
                  text-white

                  shadow-[0_6px_20px_rgba(0,0,0,0.45)]

                  transition
                  active:scale-90
                "
              >
                <Plus size={25} strokeWidth={2.2} />
              </button>
            </div>

            {/* HEART */}
            <NavButton
              icon={<Heart size={21} />}
              label="Activity"
              onClick={() => {}}
            />

            {/* PROFILE */}
            <NavButton
              icon={<User size={21} />}
              active={isProfile}
              label="Profile"
              onClick={handleProfile}
            />

          </div>
        </div>
      </nav>
    </>
  );
};

const NavButton = ({
  icon,
  active,
  label,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`
        flex
        items-center
        justify-center
        w-full
        h-12
        rounded-xl
        transition-all
        duration-200

        ${
          active
            ? "bg-white/10 text-white"
            : "text-zinc-400 hover:text-white"
        }
      `}
    >
      {icon}
    </button>
  );
};

export default MobileBottomNav;