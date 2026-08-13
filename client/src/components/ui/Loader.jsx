const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">

        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
        </div>

        <div className="text-center">
          <h3 className="text-white font-semibold text-lg">
            Loading Feed
          </h3>

          <p className="text-zinc-500 text-sm">
            Preparing your feed...
          </p>
        </div>

      </div>
    </div>
  );
};

export default Loader;