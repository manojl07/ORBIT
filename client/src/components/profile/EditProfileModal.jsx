import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";

import useUpdateProfile from "../../hooks/useUpdateProfile";

const EditProfileModal = ({
  isOpen,
  onClose,
  user,
}) => {
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    setBio(user.bio || "");
    setPreview(user.profileImg || "");
    setImage(null);
  }, [user]);

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

  const mutation = useUpdateProfile(onClose);

  const handleImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("bio", bio.trim());

    if (image) {
      formData.append("profileImg", image);
    }

    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/70
        backdrop-blur-sm
        p-4
      "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative
          w-full
          max-w-2xl
          max-h-[90vh]
          overflow-y-auto
          rounded-xl
          border
          border-zinc-800
          bg-zinc-900
          shadow-2xl
        "
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            right-4
            top-4
            z-20
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-zinc-800
            text-zinc-300
            transition
            hover:bg-zinc-700
            hover:text-white
          "
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 pt-6 pr-20">
            <h2 className="text-2xl font-bold text-white">
              Edit Profile
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Update your profile photo and bio.
            </p>
          </div>

          <div className="my-4 border-t border-zinc-800" />

          {/* Profile Photo */}
          <div className="px-6">
            <h3 className="mb-5 text-lg font-semibold text-white">
              Profile Photo
            </h3>

            <div className="grid items-center gap-6 md:grid-cols-[140px_1fr]">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={preview}
                    alt="Profile"
                    className="
                      h-28
                      w-28
                      rounded-full
                      border-4
                      border-zinc-700
                      object-cover
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="
                      absolute
                      bottom-0
                      right-0
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      bg-zinc-700
                      text-white
                      transition
                      hover:bg-zinc-600
                      active:scale-95
                    "
                    aria-label="Change profile photo"
                  >
                    <Camera size={16} />
                  </button>
                </div>
              </div>

              {/* Upload */}
              <div>
                <label className="mb-2 block text-base font-semibold text-white">
                  Change profile photo
                </label>

                <div
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="
                    flex
                    h-24
                    cursor-pointer
                    flex-col
                    items-center
                    justify-center
                    rounded-lg
                    border-2
                    border-dashed
                    border-zinc-700
                    text-center
                    transition
                    hover:border-blue-500
                    hover:bg-zinc-800/40
                    active:scale-[0.99]
                  "
                >
                  <ImagePlus
                    size={22}
                    className="text-zinc-400"
                  />

                  <p className="mt-1 max-w-[260px] truncate px-2 text-sm font-medium text-white">
                    {image
                      ? image.name
                      : "Click to upload"}
                  </p>

                  <p className="text-xs text-zinc-500">
                    PNG, JPG, JPEG • Max 5 MB
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImage}
                />
              </div>
            </div>
          </div>

          <div className="my-4 border-t border-zinc-800" />

          {/* Bio */}
          <div className="px-6">
            <label className="text-lg font-semibold text-white">
              Bio
            </label>

            <textarea
              rows={3}
              maxLength={150}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              className="
                mt-3
                w-full
                resize-none
                rounded-lg
                border
                border-zinc-700
                bg-zinc-950
                p-3
                text-sm
                text-white
                outline-none
                transition
                focus:border-blue-500
              "
            />

            <div className="mt-2 text-right text-xs text-zinc-500">
              {bio.length}/150
            </div>
          </div>

          <div className="my-4 border-t border-zinc-800" />

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 pb-6">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="
                rounded-lg
                bg-zinc-800
                px-5
                py-2
                text-sm
                font-medium
                text-white
                transition
                hover:bg-zinc-700
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="
                rounded-lg
                bg-blue-600
                px-5
                py-2
                text-sm
                font-medium
                text-white
                transition
                hover:bg-blue-500
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {mutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;