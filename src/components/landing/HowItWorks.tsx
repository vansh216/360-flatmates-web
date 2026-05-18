import { STEPS } from "./landing-data";

export function HowItWorks() {
  return (
    <section
      className="bg-surface py-20 md:py-24"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-12">
        <div className="mb-14">
          <p className="text-eyebrow mb-5">Process</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 id="how-it-works-heading" className="text-display max-w-2xl text-ink">
              A refined path to your next residence
            </h2>
            <p className="max-w-[35ch] text-body-lg text-ink-3">
              We&apos;ve replaced the chaos of public forums with a structured, dignified experience.
            </p>
          </div>
        </div>

        <div className="space-y-10 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-12">
          {STEPS.map((step, i) => (
            <div key={step.number} className="group relative flex flex-col gap-6 py-6 lg:py-0">
              {/* Large decorative number */}
              <span
                className="text-display text-8xl md:text-9xl tabular leading-none text-paper-3 transition-colors duration-500 group-hover:text-accent/10"
              >
                {step.number}
              </span>
              
              <div className="space-y-3">
                <h3 className="text-h1 text-2xl md:text-3xl text-ink">{step.title}</h3>
                <p className="text-body-lg text-ink-3 max-w-[30ch] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Subtle connector line for desktop */}
              {i < STEPS.length - 1 && (
                <div
                  className="absolute top-1/2 -right-8 hidden h-[1px] w-16 bg-line-low lg:block"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
