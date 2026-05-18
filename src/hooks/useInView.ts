import { useEffect, useRef, useState } from "react";

export function useInView<T extends HTMLElement = HTMLElement>(
  options: IntersectionObserverInit = {},
): { ref: React.RefObject<T | null>; inView: boolean } {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  // Memoize options by extracting stable primitive values for the dependency array
  const threshold = options.threshold;
  const rootMargin = options.rootMargin;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(element);
        }
      },
      { threshold: threshold ?? 0.15, rootMargin, root: options.root },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, options.root]);

  return { ref: ref as React.RefObject<T | null>, inView };
}
