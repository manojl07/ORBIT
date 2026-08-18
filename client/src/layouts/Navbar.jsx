import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Plus,
  User,
  LogOut,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import useLogout from "../hooks/useLogout";

const Navbar = ({ onOpenModal }) => {
  const { user } = useAuth();
  const { logout, isLoggingOut } = useLogout();

  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);

  /*
  ========================================
  CLOSE MENU WHEN CLICKING OUTSIDE
  ========================================
  */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
  ========================================
  LOGOUT
  ========================================
  */

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav
      className="
        sticky
        top-0
        z-[100]

        w-full

        bg-black

        border-b
        border-zinc-800/70
      "
    >
      <div
        className="
          max-w-6xl
          mx-auto

          h-16
          sm:h-[68px]

          px-4
          sm:px-6
          lg:px-8

          flex
          items-center
          justify-between
        "
      >

        {/* ========================================
            LOGO
        ======================================== */}

        <Link
          to="/"
          className="
            relative
            inline-block

            font-[cursive]
            italic
            font-black

            text-3xl
            sm:text-4xl

            tracking-wide

            bg-gradient-to-b
            from-white
            via-zinc-200
            to-zinc-500

            bg-clip-text
            text-transparent

            drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)]

            transition-transform
            duration-300

            hover:scale-105
          "
        >
          Orbit
        </Link>


        {/* ========================================
            RIGHT SIDE
        ======================================== */}

        <div
          className="
            flex
            items-center
            gap-2
            sm:gap-4
          "
        >

          {/* ========================================
              CREATE POST
          ======================================== */}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenModal?.();
            }}
            className="
              flex
              items-center
              justify-center

              w-9
              h-9

              sm:w-10
              sm:h-10

              rounded-full

              text-zinc-200

              hover:bg-zinc-900
              hover:text-white

              transition-all
              duration-200

              active:scale-90
            "
            aria-label="Create post"
          >
            <Plus
              size={24}
              strokeWidth={2}
            />
          </button>


          {/* ========================================
              PROFILE WRAPPER
          ======================================== */}

          <div
            ref={menuRef}
            className="
              relative
            "
          >

            {/* PROFILE BUTTON */}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();

                setOpen((prev) => !prev);
              }}
              className="
                flex
                items-center
                gap-1.5
                sm:gap-2

                rounded-full

                p-1

                hover:bg-zinc-900

                transition-all
                duration-200
              "
              aria-label="Open profile menu"
              aria-expanded={open}
            >

              <img
                src={user?.profileImg}
                alt={user?.username || "Profile"}
                className="
                  w-8
                  h-8

                  sm:w-9
                  sm:h-9

                  rounded-full

                  object-cover

                  ring-1
                  ring-zinc-700

                  shrink-0
                "
              />

              <ChevronDown
                size={17}
                className={`
                  text-zinc-400

                  transition-transform
                  duration-200

                  ${open ? "rotate-180" : ""}
                `}
              />

            </button>


            {/* ========================================
                DROPDOWN
            ======================================== */}

            {open && (
              <div
                onClick={(event) =>
                  event.stopPropagation()
                }
                className="
                  absolute

                  right-0
                  top-full
                  mt-2

                  z-[9999]

                  w-48

                  overflow-hidden

                  rounded-xl

                  border
                  border-zinc-800

                  bg-zinc-950

                  shadow-[0_20px_60px_rgba(0,0,0,0.65)]
                "
              >

                {/* PROFILE */}

                <Link
                  to="/profile"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="
                    flex
                    items-center
                    gap-3

                    px-4
                    py-3

                    text-sm
                    text-white

                    hover:bg-zinc-900

                    transition-colors
                  "
                >

                  <User size={18} />

                  <span>
                    Profile
                  </span>

                </Link>


                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="
                    w-full

                    flex
                    items-center
                    gap-3

                    px-4
                    py-3

                    text-left
                    text-sm

                    text-red-500

                    hover:bg-zinc-900

                    transition-colors

                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >

                  <LogOut size={18} />

                  <span>
                    {isLoggingOut
                      ? "Logging out..."
                      : "Logout"}
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