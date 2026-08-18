const SkeletonGrid = ({ count = 9 }) => {
  return (
    <div className="max-w-2xl mx-auto grid grid-cols-3 gap-1">

      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="aspect-square bg-zinc-900 animate-pulse"
        />
      ))}

    </div>
  );
};

export default SkeletonGrid;