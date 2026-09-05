import React, { useEffect, useRef } from 'react'

const FeedEndTrigger = ({hasNextPage, isFetchingNextPage, fetchNextPage}) => {

  const observerRef = useRef(null);

  useEffect(() => {
    if(!hasNextPage) return;

    const observer = new IntersectionObserver(([entry]) => {
      if(entry.isIntersecting && !isFetchingNextPage){
        fetchNextPage();
      }
    }, {
      root: null, rootMargin: "250px", threshold: 0,
    })

    const current = observerRef.current;

    if(current) { 
      observer.observe(current);
    }

    return () => {
      if(current){
        observer.unobserve(current);
      }
      observer.disconnect()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])
  

  return (
    <div ref={observerRef} className='h-1 w-full'></div>
  )
}

export default FeedEndTrigger