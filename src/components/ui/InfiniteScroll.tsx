import { useEffect, useRef, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  threshold?: number;
  rootMargin?: string;
  loaderText?: string;
  endMessage?: string;
  children: React.ReactNode;
}

export default function InfiniteScroll({
  onLoadMore,
  hasMore,
  loading,
  threshold = 0.5,
  rootMargin = "100px",
  loaderText = "लोड हुँदैछ...",
  endMessage = "थप सामग्री छैन",
  children
}: InfiniteScrollProps) {
  const { ref, inView } = useInView({
    threshold,
    rootMargin
  });

  useEffect(() => {
    if (inView && hasMore && !loading) {
      onLoadMore();
    }
  }, [inView, hasMore, loading, onLoadMore]);

  return (
    <div>
      {children}
      <div ref={ref} className="py-8 flex items-center justify-center">
        {loading && (
          <div className="flex items-center gap-3 text-slate-400 font-bold text-sm">
            <Loader2 size={18} className="animate-spin" />
            {loaderText}
          </div>
        )}
        {!hasMore && !loading && (
          <p className="text-slate-300 font-bold text-sm">{endMessage}</p>
        )}
      </div>
    </div>
  );
}
