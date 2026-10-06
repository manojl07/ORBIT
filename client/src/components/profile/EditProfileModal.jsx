import { useEffect, useRef, useState, } from "react";
import { Camera, X, Check, XCircle, LoaderCircle, } from "lucide-react";
import useUpdateProfile from "../../hooks/useUpdateProfile";
import useUsernameAvailability from "../../hooks/useUsernameAvailability";

import toast from "react-hot-toast";

const EditProfileModal = ({ isOpen, onClose, user, }) => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const fileInputRef = useRef(null);

  /* ========================================
     LOAD CURRENT USER
  ======================================== */

  useEffect(() => {
    if (!user) {
      return;
    }

    setUsername(user.username || "");
    setBio(user.bio || "");
    setPreview(user.profileImg || "");
    setImage(null);
  }, [user]);

  /* ========================================
     MODAL EFFECTS
  ======================================== */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose,]);

  /* ========================================
     USERNAME AVAILABILITY
  ======================================== */

  const usernameAvailability = useUsernameAvailability({ username, currentUsername: user?.username || "", enabled: isOpen, });

  /* ========================================
     UPDATE PROFILE
  ======================================== */

  const mutation = useUpdateProfile(onClose);

  /* ========================================
     IMAGE HANDLER
  ======================================== */

  const handleImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImage(file);

    const previewUrl = URL.createObjectURL(file);

    setPreview(previewUrl);
  };

  /* ========================================
     USERNAME STATUS COLORS
  ======================================== */

  const usernameWrapperClass = (() => {
    switch (usernameAvailability.status) {
      case "available": return `border-emerald-500/70 shadow-[0_0_20px_rgba(34,197,94,0.15)]`;

      case "current": return `border-zinc-600`;
      case "taken":
      case "invalid":
      case "error":
        return `border-red-500/60`;

      case "checking": return `border-blue-500/60`;

      default: return `border-zinc-700`;
    }
  })();

  /* ========================================
     USERNAME STATUS ICON
  ======================================== */

  const renderUsernameIcon = () => {
    switch (usernameAvailability.status) {
      case "available":
      case "current": return (<Check size={18} className="text-emerald-400" />);
      case "taken":
      case "invalid":
      case "error":
        return (<XCircle size={18} className="text-red-400" />);

      case "checking": return (<LoaderCircle size={18} className="animate-spin text-blue-400" />);

      default: return null;
    }
  };

  /* ========================================
     SUBMIT
  ======================================== */

  const handleSubmit = (event) => {
    event.preventDefault();

    const status = usernameAvailability.status;

    if (status === "checking") {
      return;
    }

    if (status === "taken" || status === "invalid" || status === "error") {
      toast.error(usernameAvailability.message || "Please choose a valid username.");
      return;
    }

    const formData = new FormData();

    formData.append("username", username.trim());

    formData.append("bio", bio.trim());

    if (image) {
      formData.append("profileImg", image);
    }

    mutation.mutate(formData);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4" >
      <div onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden" >
        <form onSubmit={handleSubmit} >
          {/* ====================================
              HEADER
          ==================================== */}

          <div className="flex items-start justify-between px-4 pt-4 pb-3 sm:px-6 sm:pt-5" >
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Edit Profile</h2>

              <p className="mt-1 text-xs sm:text-sm text-zinc-400" >Update your username,photo and bio.</p>
            </div>

            <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition hover:bg-zinc-700 hover:text-white" aria-label="Close" >
              <X size={18} />
            </button>
          </div>

          <div className="border-t border-zinc-800" />

          {/* ====================================
              PROFILE PHOTO
          ==================================== */}

          <div className="px-4 py-4 sm:px-6 sm:py-5" >
            <h3 className="mb-4 text-base sm:text-lg font-semibold text-white" >Profile Photo</h3>

            <div className="flex justify-center">
              <div className="relative">
                <img src={preview} alt={user?.username || "Profile"}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-zinc-700 object-cover" />

                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-700 border border-zinc-500 text-white shadow-lg transition hover:bg-zinc-600 active:scale-95" aria-label="Change profile " >
                  <Camera size={16} />
                </button>
              </div>
            </div>

            <p className="mt-2 text-center text-xs text-zinc-500" >Tap the camera to change your photo</p>

            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImage} />
          </div>

          <div className="border-t border-zinc-800" />

          {/* ====================================
              USERNAME
          ==================================== */}

          <div className="px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center justify-between" >
              <label htmlFor="profile-username" className="text-base sm:text-lg font-semibold text-white" >Username</label>

              <span className="text-xs text-zinc-500">{username.length}/30</span>
            </div>

            <div className={`mt-2 flex items-center gap-2 rounded-xl border bg-zinc-950 px-3 transition-all duration-300 ${usernameWrapperClass}`} >
              <span className="text-zinc-500 text-sm select-none " >@</span>

              <input id="profile-username" type="text" value={username}
                onChange={(event) => setUsername(event.target.value.toLowerCase())}
                maxLength={30} autoComplete="off" spellCheck={false} placeholder="username"
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-zinc-600" />

              <div className="flex shrink-0 items-center justify-center " aria-hidden="true" >
                {renderUsernameIcon()}
              </div>
            </div>

            <p aria-live="polite" className={` mt-2 text-xs
                ${usernameAvailability.status === "available" || usernameAvailability.status === "current"
                ? "text-emerald-400"
                : usernameAvailability.status === "checking"
                  ? "text-blue-400"
                  : usernameAvailability.status === "taken" || usernameAvailability.status === "invalid" ||
                    usernameAvailability.status === "error" ? "text-red-400" : "text-zinc-500"}`} >
              {usernameAvailability.message}
            </p>
          </div>

          <div className="border-t border-zinc-800" />

          {/* ====================================
              BIO
          ==================================== */}

          <div className="px-4 py-4 sm:px-6 sm:py-5" >
            <div className="flex items-center justify-between" >
              <label htmlFor="profile-bio" className="text-base sm:text-lg font-semibold text-white" >Bio</label>

              <span className="text-xs text-zinc-500">{bio.length}/150</span>
            </div>

            <textarea id="profile-bio" rows={3} maxLength={150} value={bio} onChange={(event) => setBio(event.target.value)}
              placeholder="Tell people about yourself..."
              className="mt-2 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white outline-none transition focus:border-blue-500" />
          </div>

          <div className="border-t border-zinc-800" />

          {/* ====================================
              FOOTER
          ==================================== */}

          <div className="flex justify-end gap-2 px-4 py-3 sm:px-6 sm:py-4" >
            <button type="button" onClick={onClose} disabled={mutation.isPending}
              className="rounded-lg border border-zinc-700 px-4 py-2 sm:px-5 text-xs sm:text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60" >
              Cancel
            </button>

            <button type="submit" disabled={mutation.isPending || usernameAvailability.status === "checking" || usernameAvailability.status === "taken" || usernameAvailability.status === "invalid" || usernameAvailability.status === "error"}
              className="rounded-lg bg-blue-600 px-4 py-2 sm:px-5 text-xs sm:text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60" >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;