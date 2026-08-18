const SkeletonCard = () => {
  return (
    <div className="bg-black border border-zinc-900 rounded-lg overflow-hidden animate-pulse">

      {/* Header */}

      <div className="flex items-center gap-3 p-4">

        <div className="w-9 h-9 rounded-full bg-zinc-800" />

        <div className="space-y-2">

          <div className="w-24 h-3 bg-zinc-800 rounded" />

          <div className="w-16 h-2 bg-zinc-900 rounded" />

        </div>

      </div>

      {/* Image */}

      <div className="aspect-square bg-zinc-900" />

      {/* Footer */}

      <div className="p-4 space-y-3">

        <div className="flex gap-5">

          <div className="w-8 h-8 rounded-full bg-zinc-800" />

          <div className="w-8 h-8 rounded-full bg-zinc-800" />

          <div className="w-8 h-8 rounded-full bg-zinc-800" />

        </div>

        <div className="w-32 h-3 bg-zinc-800 rounded" />

        <div className="space-y-2">

          <div className="w-full h-3 bg-zinc-900 rounded" />

          <div className="w-2/3 h-3 bg-zinc-900 rounded" />

        </div>

      </div>

    </div>
  );
};

export default SkeletonCard;