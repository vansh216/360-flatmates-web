import type { ReactNode } from "react";

import { useInView } from "@/hooks/useInView";

export function RevealSection({
  children,
  className,
  staggerIndex,
}: {
  children: ReactNode;
  className?: string;
  staggerIndex?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const stagger = staggerIndex != null ? `stagger-${staggerIndex}` : "";

  return (
    <div
      ref={ref}
      className={`reveal ${stagger} ${inView ? "in-view" : ""} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
