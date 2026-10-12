import { useEffect, useRef } from 'react';

import { Spinner } from '../Loader/Spinner/Spinner';

type TProps = {
  hasNextPage: boolean;
  onFetch: () => void;
  isLoading?: boolean;
  loaderSize?: number;
};

export const InfinitePagination = ({ hasNextPage, isLoading, onFetch, loaderSize }: TProps) => {
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = triggerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isLoading) {
          onFetch();
        }
      },
      {
        rootMargin: '50px',
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isLoading, onFetch]);

  return <div ref={triggerRef}>{isLoading && <Spinner size={loaderSize} />}</div>;
};
