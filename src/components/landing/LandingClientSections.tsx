import { lazy, Suspense } from "react";
import { HeroSection } from "./HeroSection";

const StatsMarquee = lazy(() =>
  import("./StatsMarquee").then((m) => ({ default: m.StatsMarquee }))
);

const TestimonialsSection = lazy(() =>
  import("./TestimonialsSection").then((m) => ({ default: m.TestimonialsSection }))
);

function StatsMarqueeFallback() {
  return (
    <section className="relative bg-surface py-20 md:py-24 border-y border-line-low">
      <div className="mx-auto max-w-7xl px-5 md:px-12 text-center">
        <p className="text-eyebrow mb-5">Scale & Impact</p>
        <h2 className="text-display text-4xl md:text-5xl text-ink">Trusted in premier neighborhoods</h2>
      </div>
    </section>
  );
}

function TestimonialsFallback() {
  return (
    <section className="bg-surface py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-12">
        <p className="text-eyebrow mb-5">Testimonials</p>
        <h2 className="text-h1 text-ink">Hear from our curated community</h2>
      </div>
    </section>
  );
}

export function LandingClientSections() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<StatsMarqueeFallback />}>
        <StatsMarquee />
      </Suspense>
      <Suspense fallback={<TestimonialsFallback />}>
        <TestimonialsSection />
      </Suspense>
    </>
  );
}
