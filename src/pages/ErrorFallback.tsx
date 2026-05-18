import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ErrorFallback({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="grid min-h-screen place-items-center bg-paper px-6 text-ink">
      <section className="fade-slide-up max-w-md text-center">
        <div className="mx-auto mb-5 grid size-28 place-items-center rounded-2xl bg-warning-soft text-warning">
          <TriangleAlert aria-hidden className="size-12" />
        </div>
        <h1 className="text-h1">Something went wrong</h1>
        <p className="mt-3 text-body-md text-ink-2">We are having trouble loading this page. Please try again.</p>
        <Button
          onClick={reset}
          leadingIcon={<RotateCcw aria-hidden className="size-4" />}
          className="mt-6"
        >
          Try Again
        </Button>
      </section>
    </main>
  );
}
