import { RevealSection } from "@/components/ui/RevealSection";
import { STEPS } from "./landing-data";

export function HowItWorks() {
  return (
    <section
      className="bg-paper py-20 md:py-28 border-b border-line-low"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-12">
        <RevealSection className="mb-16 text-center">
          <p className="text-eyebrow mb-5">How it works</p>
          <h2 id="how-it-works-heading" className="text-display max-w-xl mx-auto text-ink text-4xl md:text-5xl">
            Three steps to your <span className="text-serif-italic text-accent italic font-normal text-5xl md:text-6xl">next home</span>
          </h2>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
          {STEPS.map((step) => {
            const StepIcon = step.icon;
            return (
              <RevealSection
                key={step.number}
                className="flex flex-col gap-6 relative md:pl-8 md:border-l border-line-low/60 first:border-l-0"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-display text-6xl md:text-7xl lg:text-8xl text-accent/25 font-extralight tracking-tighter select-none font-serif-italic italic">
                    {step.number}
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent border border-accent/10 shadow-xs">
                    <StepIcon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-h1 text-2xl text-ink mb-3 leading-snug">{step.title}</h3>
                  <p className="text-body-lg text-ink-3 leading-relaxed">{step.description}</p>
                </div>
              </RevealSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

