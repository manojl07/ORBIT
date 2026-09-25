import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { X, ImagePlus } from "lucide-react";
import toast from "react-hot-toast";

import { queryKeys } from "../../constants/queryKey";
import { useAuth } from "../../hooks/useAuth";
import { createPost } from "../../api/post.api";
import {
  backdropVariants,
  modalVariants,
} from "../../constants/animation";

const CreatePostModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const { user } = useAuth();

  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  /* ========================================
     BODY LOCK + ESCAPE KEY
  ======================================== */

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  /* ========================================
     CREATE POST MUTATION
  ======================================== */

  const createPostMutation = useMutation({
    mutationFn: createPost,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.feed,
      });

      toast.success("Post created 🚀");

      setCaption("");
      setImage(null);
      setPreview("");

      onClose();
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to create post"
      );
    },
  });

  /* ========================================
     IMAGE HANDLER
  ======================================== */

  const handleImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);

    const previewUrl = URL.createObjectURL(file);

    setPreview(previewUrl);
  };

  /* ========================================
     FORM SUBMIT
  ======================================== */

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please select an image");
      return;
    }

    const formData = new FormData();

    formData.append("caption", caption);
    formData.append("image", image);

    createPostMutation.mutate(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="
            fixed
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            bg-black/70
            backdrop-blur-sm
            p-2
            sm:p-4
          "
        >
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="
              relative
              w-full
              max-w-5xl
              max-h-[calc(100dvh-16px)]
              sm:max-h-[calc(100dvh-32px)]
              overflow-hidden
              rounded-2xl
              sm:rounded-3xl
              border
              border-zinc-800
              bg-zinc-900
              p-3
              sm:p-6
              lg:p-8
              shadow-2xl
            "
          >

            {/* ========================================
                CLOSE BUTTON
            ======================================== */}

            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{
                rotate: 90,
                scale: 1.08,
              }}
              whileTap={{
                scale: 0.9,
              }}
              transition={{
                duration: 0.15,
              }}
              className="
                absolute
                right-2.5
                top-2.5
                sm:right-4
                sm:top-4
                z-20
                flex
                h-8
                w-8
                sm:h-10
                sm:w-10
                items-center
                justify-center
                rounded-full
                bg-zinc-800
                text-zinc-300
                hover:bg-zinc-700
                hover:text-white
              "
              aria-label="Close"
            >
              <X size={18} className="sm:hidden" />
              <X size={20} className="hidden sm:block" />
            </motion.button>


            {/* ========================================
                TITLE
            ======================================== */}

            <h2
              className="
                mb-3
                sm:mb-6
                pr-10
                text-lg
                sm:text-2xl
                font-bold
                text-white
              "
            >
              Create Post
            </h2>


            <form onSubmit={handleSubmit}>

              {/* ========================================
                  MAIN CONTENT
              ======================================== */}

              <div
                className="
                  grid
                  grid-cols-1
                  lg:grid-cols-[1.1fr_0.9fr]
                  gap-3
                  sm:gap-6
                "
              >

                {/* ========================================
                    IMAGE SECTION
                ======================================== */}

                <div>

                  <motion.label
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="
                      relative
                      flex
                      h-44
                      sm:h-72
                      lg:h-105
                      cursor-pointer
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-xl
                      sm:rounded-2xl
                      border
                      border-zinc-800
                      bg-black
                      transition
                      hover:border-blue-500
                    "
                  >

                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="
                          h-full
                          w-full
                          object-contain
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          flex-col
                          items-center
                          px-4
                          text-center
                        "
                      >

                        <div
                          className="
                            flex
                            h-12
                            w-12
                            sm:h-16
                            sm:w-16
                            items-center
                            justify-center
                            rounded-full
                            bg-zinc-800
                          "
                        >
                          <ImagePlus
                            size={28}
                            className="text-zinc-400"
                          />
                        </div>

                        <p
                          className="
                            mt-2
                            sm:mt-5
                            text-base
                            sm:text-lg
                            font-semibold
                            text-white
                          "
                        >
                          Select a photo
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            sm:text-sm
                            text-zinc-500
                          "
                        >
                          Drag or click to upload
                        </p>

                      </div>
                    )}

                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={handleImage}
                    />

                  </motion.label>


                  {/* FILE NAME */}

                  {image && (
                    <p
                      className="
                        mt-2
                        sm:mt-3
                        truncate
                        text-center
                        text-xs
                        sm:text-sm
                        text-zinc-500
                      "
                    >
                      📷 {image.name}
                    </p>
                  )}

                </div>


                {/* ========================================
                    USER + CAPTION SECTION
                ======================================== */}

                <div
                  className="
                    flex
                    h-52
                    sm:h-64
                    lg:h-105
                    min-h-0
                    flex-col
                    overflow-hidden
                    rounded-xl
                    sm:rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-950
                  "
                >

                  {/* ====================================
                      USER HEADER
                  ==================================== */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      shrink-0
                      border-b
                      border-zinc-800
                      p-2.5
                      sm:p-4
                    "
                  >

                    {/* USER INFO */}

                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-2.5
                      "
                    >

                      <img
                        src={user?.profileImg}
                        alt={
                          user?.username ||
                          "Profile"
                        }
                        className="
                          h-9
                          w-9
                          sm:h-11
                          sm:w-11
                          rounded-full
                          object-cover
                          shrink-0
                        "
                      />

                      <div className="min-w-0">

                        <h3
                          className="
                            truncate
                            text-sm
                            sm:text-base
                            font-semibold
                            text-white
                          "
                        >
                          {user?.username}
                        </h3>

                        <p
                          className="
                            text-[10px]
                            sm:text-xs
                            text-zinc-500
                          "
                        >
                          Creating a new post
                        </p>

                      </div>

                    </div>


                    {/* CHARACTER COUNT */}

                    <span
                      className={`
                        shrink-0
                        text-[10px]
                        sm:text-xs
                        ${
                          caption.length > 2000
                            ? "text-orange-400"
                            : "text-zinc-500"
                        }
                      `}
                    >
                      {caption.length}/2200
                    </span>

                  </div>


                  {/* ====================================
                      CAPTION TEXTAREA
                  ==================================== */}

                  <textarea
                    value={caption}
                    onChange={(e) =>
                      setCaption(e.target.value)
                    }
                    placeholder="Share what's happening..."
                    maxLength={2200}
                    className="
                      min-h-0
                      flex-1
                      w-full
                      resize-none
                      overflow-y-auto
                      bg-transparent
                      p-3
                      sm:p-5
                      text-sm
                      sm:text-[15px]
                      leading-6
                      sm:leading-7
                      text-white
                      outline-none
                      placeholder:text-zinc-500
                    "
                  />

                </div>

              </div>


              {/* ========================================
                  ACTION BUTTONS
              ======================================== */}

              <div
                className="
                  mt-3
                  sm:mt-8
                  flex
                  flex-row
                  justify-end
                  gap-2
                  sm:gap-3
                "
              >

                {/* CANCEL */}

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onClose}
                  disabled={
                    createPostMutation.isPending
                  }
                  className="
                    flex-1
                    sm:flex-none
                    rounded-lg
                    border
                    border-zinc-700
                    px-2
                    sm:px-7
                    py-2
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-zinc-800
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  Cancel
                </motion.button>


                {/* SHARE */}

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={
                    createPostMutation.isPending
                  }
                  className="
                    flex-1
                    sm:flex-none
                    rounded-lg
                    bg-blue-600
                    px-2
                    sm:px-8
                    py-2
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-blue-500
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {createPostMutation.isPending
                    ? "Sharing..."
                    : "Share Post"}
                </motion.button>

              </div>

            </form>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;