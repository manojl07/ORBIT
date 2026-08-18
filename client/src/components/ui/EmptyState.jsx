const EmptyState = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">

      <div className="text-5xl mb-4">
        {icon}
      </div>

      <h3 className="text-xl font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-zinc-500">
        {description}
      </p>

    </div>
  );
};

export default EmptyState;