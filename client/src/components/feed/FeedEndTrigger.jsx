import { useEffect, useRef } from "react";

const FeedEndTrigger = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}) => {
  const observerRef = useRef(null);

  useEffect(() => {
    // No more pages to load.
    if (!hasNextPage) return;

    const current = observerRef.current;

    if (!current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "250px",
        threshold: 0,
      }
    );

    observer.observe(current);

    // Clean up the observer when the component
    // unmounts or its dependencies change.
    return () => {
      observer.disconnect();
    };
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  return <div ref={observerRef} className="h-1 w-full" />;
};

export default FeedEndTrigger;