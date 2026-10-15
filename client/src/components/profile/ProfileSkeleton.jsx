import SkeletonGrid from "../ui/SkeletonGrid";

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-black">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">

        {/* PROFILE HEADER SKELETON */}
        <section className="mb-8 animate-pulse">
          <div className="flex items-start gap-5 sm:gap-10">

            {/* AVATAR */}
            <div className="h-20 w-20 shrink-0 rounded-full bg-zinc-800 sm:h-32 sm:w-32" />

            {/* PROFILE DETAILS */}
            <div className="min-w-0 flex-1 space-y-4 pt-1">

              {/* USERNAME + BUTTON */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-5 w-32 rounded bg-zinc-800 sm:w-40" />
                <div className="h-8 w-20 rounded-lg bg-zinc-800" />
              </div>

              {/* STATS */}
              <div className="hidden items-center gap-8 sm:flex">
                <div className="h-4 w-20 rounded bg-zinc-800" />
                <div className="h-4 w-24 rounded bg-zinc-800" />
                <div className="h-4 w-20 rounded bg-zinc-800" />
              </div>

              {/* BIO */}
              <div className="hidden space-y-2 sm:block">
                <div className="h-4 w-28 rounded bg-zinc-800" />
                <div className="h-3 w-56 max-w-full rounded bg-zinc-800" />
              </div>
            </div>
          </div>

          {/* MOBILE STATS */}
          <div className="mt-5 flex justify-around border-y border-zinc-800 py-4 sm:hidden">
            <div className="space-y-2">
              <div className="mx-auto h-4 w-8 rounded bg-zinc-800" />
              <div className="h-3 w-14 rounded bg-zinc-800" />
            </div>

            <div className="space-y-2">
              <div className="mx-auto h-4 w-8 rounded bg-zinc-800" />
              <div className="h-3 w-16 rounded bg-zinc-800" />
            </div>

            <div className="space-y-2">
              <div className="mx-auto h-4 w-8 rounded bg-zinc-800" />
              <div className="h-3 w-14 rounded bg-zinc-800" />
            </div>
          </div>

          {/* MOBILE BIO */}
          <div className="mt-4 space-y-2 sm:hidden">
            <div className="h-4 w-28 rounded bg-zinc-800" />
            <div className="h-3 w-56 max-w-full rounded bg-zinc-800" />
          </div>
        </section>

        {/* POSTS SECTION DIVIDER */}
        <div className="mb-5 border-t border-zinc-800" />

        {/* POSTS GRID SKELETON */}
        <section aria-label="Loading profile posts">
          <SkeletonGrid count={9} />
        </section>

      </main>
    </div>
  );
};

export default ProfileSkeleton;