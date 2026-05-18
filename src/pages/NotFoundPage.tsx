import { Link } from "react-router";
import { Search } from "lucide-react";
import { focusRing } from "@/components/ui/component-utils";

export function NotFoundPage() {
  return (
    <main id="main" className="grid min-h-screen place-items-center bg-paper px-6 text-ink">
      <section className="fade-slide-up max-w-md text-center">
        <div className="mx-auto mb-5 grid size-28 place-items-center rounded-2xl bg-accent-soft text-accent">
          <Search aria-hidden className="size-12" />
        </div>
        <h1 className="text-h1">Page not found</h1>
        <p className="mt-3 text-body-md text-ink-2">The page you are looking for does not exist or has been moved.</p>
        <Link
          to="/home"
          className={`mt-6 inline-flex h-12 items-center justify-center rounded-[10px] bg-accent px-6 text-label-lg text-white shadow-cta ${focusRing}`}
        >
          Go Home
        </Link>
      </section>
    </main>
  );
}
