import { Link } from "react-router";
import { TriangleAlert } from "lucide-react";

import { buttonClasses } from "@/components/ui/Button";

export function ErrorPage() {
  return (
    <main id="main" className="grid min-h-screen place-items-center px-5 text-center">
      <section className="max-w-md">
        <div className="mx-auto grid size-28 place-items-center rounded-2xl bg-warning-soft text-warning">
          <TriangleAlert aria-hidden className="size-12" />
        </div>
        <h1 className="mt-6 text-h1">Something went wrong</h1>
        <p className="mt-3 text-body-md text-ink-2">
          We are having trouble loading this page. Please try again.
        </p>
        <Link to="/" className={buttonClasses("primary", "default", false) + " mt-6"}>
          Try Again
        </Link>
      </section>
    </main>
  );
}
