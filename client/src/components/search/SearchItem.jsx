import React from "react";

import userProfileNavigation
  from "../../hooks/useProfileNavigation";


const SearchItem = ({
  user,
  onSelect,
}) => {

  const goToProfile =
    userProfileNavigation();


  const handleClick = () => {

    onSelect?.();

    goToProfile(user.id);

  };


  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        w-full
        flex
        items-center
        gap-2.5
        px-3
        py-2.5

        text-left

        border-b
        border-zinc-800/60
        last:border-b-0

        hover:bg-zinc-800
        active:bg-zinc-800

        transition-colors
      "
    >

      <img
        src={user.profileImg}
        alt={user.username}
        className="
          w-9
          h-9
          sm:w-10
          sm:h-10

          shrink-0

          rounded-full
          object-cover

          border
          border-zinc-700
        "
      />


      <div className="min-w-0">

        <p
          className="
            truncate
            text-sm
            sm:text-base
            font-medium
            text-white
          "
        >
          {user.username}
        </p>

      </div>

    </button>
  );
};


export default SearchItem;