import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Home,
  Search,
  MessageCircle,
  Heart,
  User,
} from "lucide-react";

import SearchBar from "../components/search/SearchBar";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);

  const isHome = location.pathname === "/";

  const isProfile =
    location.pathname === "/profile" ||
    location.pathname.startsWith("/profile/");

  const isMessages = location.pathname.startsWith("/messages");

  const handleHome = () => {
    setSearchOpen(false);
    navigate("/");
  };

  const handleSearch = () => {
    setSearchOpen((prev) => !prev);
  };

  const handleMessages = () => {
    setSearchOpen(false);
    navigate("/messages");
  };

  const handleProfile = () => {
    setSearchOpen(false);
    navigate("/profile");
  };

  return (
    <>
      {/* MOBILE SEARCH */}
      {searchOpen && (
        <div className="fixed bottom-24 left-3 right-3 top-[4.5rem] z-[110] md:hidden">
          <div
            className="
              relative mx-auto w-full max-w-md
              rounded-2xl border border-white/10
              bg-black/60 p-2.5 backdrop-blur-2xl
              shadow-[0_20px_60px_rgba(0,0,0,0.55)]
            "
          >
            <SearchBar
              autoFocus
              onClosePanel={() => setSearchOpen(false)}
            />
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-3 left-3 right-3 z-[100] md:hidden">
        <div
          className="
            h-16 rounded-2xl
            border border-white/15
            bg-black/50
            backdrop-blur-2xl
            backdrop-saturate-150
            shadow-[0_12px_40px_rgba(0,0,0,0.55)]
          "
        >
          <div className="grid h-full grid-cols-5 items-center px-2">

            <NavButton
              icon={<Home size={21} />}
              active={isHome}
              label="Home"
              onClick={handleHome}
            />

            <NavButton
              icon={<Search size={21} />}
              active={searchOpen}
              label="Search"
              onClick={handleSearch}
            />

            <NavButton
              icon={<MessageCircle size={22} />}
              active={isMessages}
              label="Messages"
              onClick={handleMessages}
            />

            <NavButton
              icon={<Heart size={21} />}
              label="Likes"
              onClick={() => {}}
            />

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

const NavButton = ({ icon, active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-current={active ? "page" : undefined}
    className={`
      flex h-12 w-full items-center justify-center
      rounded-xl transition-all duration-200
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

export default MobileBottomNav;