const SkeletonComments = ({ count = 6 }) => {
  return (
    <div className="p-4 space-y-5 animate-pulse">

      {Array.from({ length: count }).map((_, index) => (

        <div
          key={index}
          className="flex gap-3"
        >

          <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0" />

          <div className="flex-1 space-y-2">

            <div className="w-24 h-3 bg-zinc-800 rounded" />

            <div className="w-full h-3 bg-zinc-900 rounded" />

            <div className="w-3/4 h-3 bg-zinc-900 rounded" />

          </div>

        </div>

      ))}

    </div>
  );
};

export default SkeletonComments;