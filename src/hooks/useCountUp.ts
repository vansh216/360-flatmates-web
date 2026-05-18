import { useEffect, useRef, useState } from "react";

/**
 * Animated counter hook. Counts from 0 to target over duration ms.
 * Triggers when element enters viewport (uses IntersectionObserver).
 * Uses ease-out-quart easing.
 */
export function useCountUp(
  target: number,
  { duration = 1500, enabled = true }: { duration?: number; enabled?: boolean } = {}
): { ref: React.RefObject<HTMLElement | null>; value: number } {
  const ref = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState(target);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!enabled || hasAnimated.current) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.unobserve(element);
          setValue(0);

          const start = performance.now();
          const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);
            setValue(Math.round(easedProgress * target));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [target, duration, enabled]);

  return { ref, value };
}
