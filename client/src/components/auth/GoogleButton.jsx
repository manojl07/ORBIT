const GoogleIcon = ({ size = 18 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.96h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.23Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.75 9.75 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.86a5.86 5.86 0 0 1 0-3.72V7.64H3.3a9.75 9.75 0 0 0 0 8.72l3.24-2.5Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.11c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.2 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.39l3.24 2.5C7.31 7.83 9.46 6.11 12 6.11Z"
      />
    </svg>
  );
};

const GoogleButton = ({
  text = "Continue with Google",
}) => {
  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
      console.error("VITE_API_URL is not configured.");
      return;
    }

    window.location.assign(`${apiUrl}/auth/google`);
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="
        w-full
        flex
        items-center
        justify-center
        gap-3
        rounded-lg
        border
        border-zinc-700
        bg-white
        px-4
        py-3
        text-sm
        font-semibold
        text-zinc-900
        transition
        hover:bg-zinc-100
        active:scale-[0.99]
      "
    >
      <GoogleIcon size={18} />
      <span>{text}</span>
    </button>
  );
};

export default GoogleButton;