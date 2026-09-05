const FeedPostSkeleton = () => {
  return (
    <div
      className="
        bg-zinc-950
        border
        border-zinc-800/70
        rounded-2xl
        overflow-hidden
        animate-pulse
      "
    >

      {/* =========================================
          HEADER
      ========================================== */}
      <div className="flex items-center px-4 py-3">

        {/* Avatar */}
        <div
          className="
            w-8
            h-8
            rounded-full
            bg-zinc-800
            shrink-0
          "
        />

        {/* Username */}
        <div
          className="
            ml-3
            h-3
            w-24
            rounded
            bg-zinc-800
          "
        />

        {/* Dot */}
        <div
          className="
            ml-2
            mr-2
            w-1.5
            h-1.5
            rounded-full
            bg-zinc-800
          "
        />

        {/* Follow */}
        <div
          className="
            h-3
            w-12
            rounded
            bg-zinc-800
          "
        />

      </div>


      {/* =========================================
          IMAGE
      ========================================== */}
      <div
        className="
          w-full
          aspect-[1.05/1]
          bg-zinc-800
        "
      />


      {/* =========================================
          CONTENT
      ========================================== */}
      <div className="px-4 py-3">

        {/* Actions */}
        <div className="flex items-center gap-5">

          {/* Like */}
          <div
            className="
              w-5
              h-5
              rounded
              bg-zinc-800
            "
          />

          {/* Comment */}
          <div
            className="
              w-5
              h-5
              rounded
              bg-zinc-800
            "
          />

        </div>


        {/* Likes count */}
        <div
          className="
            mt-3
            h-3
            w-16
            rounded
            bg-zinc-800
          "
        />


        {/* Caption */}
        <div className="mt-3 space-y-2">

          <div
            className="
              h-3
              w-4/5
              rounded
              bg-zinc-800
            "
          />

          <div
            className="
              h-3
              w-3/5
              rounded
              bg-zinc-800
            "
          />

        </div>


        {/* View comments */}
        <div
          className="
            mt-2
            h-3
            w-36
            rounded
            bg-zinc-900
          "
        />


        {/* Date */}
        <div
          className="
            mt-2
            h-2
            w-20
            rounded
            bg-zinc-900
          "
        />

      </div>

    </div>
  );
};

export default FeedPostSkeleton;