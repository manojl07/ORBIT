import {
  Heart,
  MessageCircle,
} from "lucide-react";

import EmptyState from "../ui/EmptyState";

const ProfilePostsGrid = ({
  posts,
  onPostClick,
}) => {
  if (!posts?.length) {
    return (
      <EmptyState
        icon="📷"
        title="No Posts Yet"
        description="Share your first photo."
      />
    );
  }

  return (
    <section
      className="
        mx-auto
        w-full
      "
    >
      <div
        className="
          grid

          grid-cols-3

          gap-[2px]

          bg-black
        "
      >
        {posts.map((post) => (
          <button
            key={
              post.id ||
              post._id
            }
            type="button"
            onClick={() =>
              onPostClick(post)
            }
            aria-label={`View post${
              post.caption
                ? `: ${post.caption}`
                : ""
            }`}
            className="
              group

              relative

              aspect-square

              overflow-hidden

              bg-zinc-900

              outline-none

              focus-visible:ring-2
              focus-visible:ring-white
              focus-visible:ring-inset
            "
          >
            {/* =================================
                IMAGE
            ================================= */}

            <img
              src={post.imageUrl}
              alt={
                post.caption ||
                "Post"
              }
              loading="lazy"
              className="
                h-full
                w-full

                object-cover

                transition-transform
                duration-500
                ease-out

                group-hover:scale-[1.06]
                group-focus-visible:scale-[1.06]
              "
            />

            {/* =================================
                DARK OVERLAY
            ================================= */}

            <div
              className="
                pointer-events-none

                absolute
                inset-0

                bg-black/0

                transition-all
                duration-300

                group-hover:bg-black/50
                group-focus-visible:bg-black/50
              "
            />

            {/* =================================
                HOVER DETAILS
            ================================= */}

            <div
              className="
                pointer-events-none

                absolute
                inset-0

                flex
                items-center
                justify-center

                opacity-0

                transition-all
                duration-300

                group-hover:opacity-100
                group-focus-visible:opacity-100
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-6

                  text-white
                "
              >
                {/* LIKES */}

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Heart
                    size={20}
                    fill="currentColor"
                  />

                  <span
                    className="
                      text-sm
                      font-semibold
                    "
                  >
                    {post.likesCount ??
                      0}
                  </span>
                </div>

                {/* COMMENTS */}

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <MessageCircle
                    size={20}
                    fill="currentColor"
                  />

                  <span
                    className="
                      text-sm
                      font-semibold
                    "
                  >
                    {post.commentsCount ??
                      0}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default ProfilePostsGrid;