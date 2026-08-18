const ErrorState = ({
  title = "Something went wrong",
  message = "Please try again.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">

      <div className="text-5xl mb-4">
        ⚠️
      </div>

      <h2 className="text-xl font-bold text-white">
        {title}
      </h2>

      <p className="text-zinc-500 mt-2">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
        >
          Try Again
        </button>
      )}

    </div>
  );
};

export default ErrorState;