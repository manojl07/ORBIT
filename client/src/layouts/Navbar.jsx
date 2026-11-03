
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  ChevronDown,
  Plus,
  User,
  LogOut,
  MessageCircle,
  Heart,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import useLogout from "../hooks/useLogout";
import SearchBar from "../components/search/SearchBar";
import OrbitBrand from "../components/ui/OrbitBrand.jsx";

const Navbar = ({ onOpenModal }) => {
  const { user } = useAuth();
  const { logout, isLoggingOut } = useLogout();

  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);
  const { pathname } = useLocation();

  const isMessagesActive = pathname.startsWith("/messages");

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleCreatePost = () => {
    setOpen(false);
    onOpenModal?.();
  };

  return (
    <nav className="sticky top-0 z-100 w-full border-b border-zinc-800/70 bg-black">
      <div
        className="
          mx-auto flex h-16 max-w-6xl items-center justify-between
          px-4 sm:h-17 sm:px-6 lg:px-8
          md:grid md:grid-cols-3
        "
      >
        {/* LEFT — ORBIT BRAND */}
        <div className="flex justify-start">
          <Link
            to="/"
            aria-label="ORBIT home"
            className="inline-flex items-center transition-transform duration-400 hover:scale-[1.05]"
          >
            <OrbitBrand />
          </Link>
        </div>

        {/* CENTER — SEARCH */}
        <div className="hidden w-full justify-center md:flex">
          <SearchBar />
        </div>

        {/* RIGHT — NAVIGATION ACTIONS */}
        <div className="flex items-center justify-end gap-2 sm:gap-4">

          {/* DESKTOP MESSAGES */}
          <Link
            to="/messages"
            aria-label="Messages"
            title="Messages"
            className={`
              hidden h-10 w-10 items-center justify-center
              rounded-full transition-all duration-200
              active:scale-90 md:flex
              ${
                isMessagesActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
              }
            `}
          >
            <MessageCircle size={22} strokeWidth={2} />
          </Link>

          {/* DESKTOP LIKES */}
          <button
            type="button"
            aria-label="Likes"
            title="Likes"
            className="
              hidden h-10 w-10 items-center justify-center
              rounded-full text-zinc-300
              transition-all duration-200
              hover:bg-zinc-900 hover:text-white
              active:scale-90 md:flex
            "
          >
            <Heart size={22} strokeWidth={2} />
          </button>

          {/* CREATE POST — MOBILE + DESKTOP */}
          <button
            type="button"
            onClick={handleCreatePost}
            aria-label="Create post"
            title="Create post"
            className="
              flex h-9 w-9 items-center justify-center
              rounded-full text-zinc-200
              transition-all duration-200
              hover:bg-zinc-900 hover:text-white
              active:scale-90 sm:h-10 sm:w-10
            "
          >
            <Plus size={25} strokeWidth={2.2} />
          </button>

          {/* PROFILE MENU */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setOpen((prev) => !prev);
              }}
              className="
                flex items-center gap-1.5 rounded-full p-1.5
                transition-all duration-200 hover:bg-zinc-800 sm:gap-2
              "
              aria-label="Open profile menu"
              aria-expanded={open}
            >
              <img
                src={user?.profileImg}
                alt={user?.username || "Profile"}
                className="
                  h-8 w-8 shrink-0 rounded-full object-cover
                  ring-1 ring-zinc-700 sm:h-9 sm:w-9
                "
              />

              <ChevronDown
                size={20}
                className={`
                  text-zinc-400 transition-transform duration-200
                  ${open ? "rotate-180" : ""}
                `}
              />
            </button>

            {open && (
              <div
                onClick={(event) => event.stopPropagation()}
                className="
                  absolute right-0 top-full z-9999 mt-2 w-48
                  overflow-hidden rounded-xl border border-zinc-800
                  bg-zinc-950 shadow-[0_20px_60px_rgba(0,0,0,0.65)]
                "
              >
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="
                    flex items-center gap-3 px-4 py-3 text-sm
                    text-white transition-colors hover:bg-zinc-900
                  "
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="
                    flex w-full items-center gap-3 px-4 py-3
                    text-left text-sm text-red-500 transition-colors
                    hover:bg-zinc-900 disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <LogOut size={18} />
                  <span>
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
