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

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

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

  const handleImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl"
          >
            {/* Close */}

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
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
            >
              <X size={20} />
            </motion.button>

            <h2 className="mb-6 text-2xl font-bold text-white">
              Create Post
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-[1.1fr_0.9fr] gap-6">

                {/* LEFT SIDE */}

                <div>

                  <motion.label
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="relative flex h-[420px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-black transition hover:border-blue-500" >

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
                      <div className="flex flex-col items-center">

                        <div
                          className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800" >
                          <ImagePlus
                            size={32}
                            className="text-zinc-400"
                          />
                        </div>

                        <p className="mt-5 text-lg font-semibold text-white">
                          Select a photo
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
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

                  {image && (
                    <p className="mt-3 truncate text-center text-sm text-zinc-500">
                      📷 {image.name}
                    </p>
                  )}

                </div>

                {/* RIGHT SIDE */}

                <div className="flex h-[420px] flex-col overflow-hidden rounded-2xl border border-zinc-800  bg-zinc-950" >

                  {/* USER */}

                  <div className="flex items-center gap-3 border-b border-zinc-800 p-4">

                    <img
                      src={user?.profileImg}
                      alt={user?.username}
                      className="h-11 w-11 rounded-full object-cover"
                    />

                    <div>

                      <h3 className="font-semibold text-white">
                        {user?.username}
                      </h3>

                      <p className="text-xs text-zinc-500">
                        Creating a new post
                      </p>

                    </div>

                  </div>

                  {/* TEXTAREA */}

                  <textarea
                    value={caption}
                    onChange={(e) =>
                      setCaption(e.target.value)
                    }
                    placeholder="Share what's happening..."
                    maxLength={2200}
                    className="flex-1 resize-none bg-transparent p-5 text-[15px] leading-7 text-white outline-none placeholder:text-zinc-500" />

                  {/* FOOTER */}

                  <div className="border-t border-zinc-800 px-5 py-4">

                    <div className="flex items-center justify-between text-sm">

                      <span className="text-zinc-500">
                        Write a meaningful caption
                      </span>

                      <span
                        className={`${caption.length > 2000
                          ? "text-orange-400"
                          : "text-zinc-500"
                          }`} >
                        {caption.length}/2200
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="mt-8 flex justify-end gap-3">

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-zinc-700 px-7 py-3 font-medium text-white transition hover:bg-zinc-800" >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={createPostMutation.isPending}
                  className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-500  disabled:opacity-60" >
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