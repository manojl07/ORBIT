import React from "react";
import SearchItem from "./SearchItem";


const SearchDropdown = ({
  users,
  loading,
  onClose,
}) => {

  return (
    <div
      className="
        absolute
        left-0
        right-0
        top-full
        mt-2

        w-full

        rounded-2xl
        border
        border-zinc-800

        bg-zinc-950/95
        backdrop-blur-xl

        shadow-[0_20px_50px_rgba(0,0,0,0.55)]

        overflow-hidden

        z-[120]
      "
    >

      {/* LOADING */}

      {loading && (
        <div
          className="
            px-4
            py-4
            text-center
            text-sm
            text-zinc-400
          "
        >
          Searching...
        </div>
      )}


      {/* NO USERS */}

      {!loading &&
        users.length === 0 && (
          <div
            className="
              px-4
              py-5
              text-center
              text-sm
              text-zinc-500
            "
          >
            No users found
          </div>
        )}


      {/* RESULTS */}

      {!loading &&
        users.length > 0 && (
          <div
            className="
              max-h-[min(420px,calc(100dvh-230px))]
              overflow-y-auto
              overscroll-contain

              scrollbar-thin
              scrollbar-thumb-zinc-700
              scrollbar-track-transparent
            "
          >

            {users.map((user) => (
              <SearchItem
                key={user.id}
                user={user}
                onSelect={onClose}
              />
            ))}

          </div>
        )}

    </div>
  );
};


export default SearchDropdown;