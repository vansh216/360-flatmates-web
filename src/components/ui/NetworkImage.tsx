import type { ImgHTMLAttributes, ReactNode } from "react";
import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "./component-utils";

export interface NetworkImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  alt: string;
  wrapperClassName?: string;
  fallback?: ReactNode;
}

function NetworkImageInner({
  src,
  alt,
  wrapperClassName,
  fallback,
  className,
  ...props
}: Omit<NetworkImageProps, "src"> & { src: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-label={alt}
        role="img"
        className={cn("flex h-full w-full items-center justify-center bg-paper-2 text-ink-3", wrapperClassName)}
      >
        {fallback ?? <ImageIcon aria-hidden="true" className="h-6 w-6" />}
      </div>
    );
  }

  return (
    <span className={cn("relative block h-full w-full overflow-hidden bg-paper-2", wrapperClassName)}>
      <img
        alt={alt}
        className={cn("object-cover absolute inset-0 h-full w-full", className)}
        src={src}
        onError={() => setFailed(true)}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </span>
  );
}

export function NetworkImage({
  src,
  alt,
  wrapperClassName,
  fallback,
  className,
  ...props
}: NetworkImageProps) {
  if (!src) {
    return (
      <div
        aria-label={alt}
        role="img"
        className={cn("flex h-full w-full items-center justify-center bg-paper-2 text-ink-3", wrapperClassName)}
      >
        {fallback ?? <ImageIcon aria-hidden="true" className="h-6 w-6" />}
      </div>
    );
  }

  // Using src as key ensures the inner component remounts when src changes,
  // resetting the failed state so a new image can attempt loading.
  return (
    <NetworkImageInner
      key={src}
      src={src}
      alt={alt}
      wrapperClassName={wrapperClassName}
      fallback={fallback}
      className={className}
      {...props}
    />
  );
}
