import { Link } from "react-router";
import { Settings } from "lucide-react";

import { buttonClasses } from "@/components/ui/Button";

export function MaintenancePage() {
  return (
    <main id="main" className="grid min-h-screen place-items-center px-5 text-center">
      <section className="max-w-md">
        <div className="mx-auto grid size-28 place-items-center rounded-2xl bg-warning-soft text-warning">
          <Settings aria-hidden className="size-12" />
        </div>
        <h1 className="mt-6 text-h1">We will be back soon</h1>
        <p className="mt-3 text-body-md text-ink-2">
          We are making some improvements. Estimated downtime: 30 minutes.
        </p>
        <Link to="/stats" className={buttonClasses("tertiary", "default", false) + " mt-6"}>
          Check Status
        </Link>
      </section>
    </main>
  );
}
