import React, { useEffect, useRef, useState, useCallback } from "react";

interface InfiniteScrollProps {
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
  children: React.ReactNode;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  loadMore,
  hasMore,
  loading,
  children,
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;

    observerRef.current = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && !loading) {
        loadMore();
      }
    });

    if (loaderRef.current) {
      observerRef.current.observe(loaderRef.current);
    }

    return () => {
      if (observerRef.current && loaderRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, loading]);

  return (
    <div>
      {children}
      {hasMore && (
        <div ref={loaderRef} style={{ height: "50px", textAlign: "center" }}>
          {loading ? (
            <p>Loading more items...</p>
          ) : (
            <p>Scroll down to load more</p>
          )}
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
