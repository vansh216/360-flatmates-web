import { ProgressRing } from "@/components/ui/ProgressRing";
import { APP_PREVIEW_STEPS, ICON_MAP } from "./landing-data";

function PreferencesMockup() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-3">
        <div className="h-2.5 w-20 rounded-full bg-purple-soft/50" />
        <div className="h-1.5 w-16 rounded-full bg-line-low" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2.5 w-24 rounded-full bg-blue-soft/50" />
        <div className="h-1.5 w-12 rounded-full bg-line-low" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2.5 w-16 rounded-full bg-green-soft/50" />
        <div className="h-1.5 w-20 rounded-full bg-line-low" />
      </div>
    </div>
  );
}

function MatchesMockup() {
  return (
    <div className="flex items-center gap-4 p-4">
      <ProgressRing value={86} size="lg" label="Match" />
      <div className="flex-1 space-y-2">
        <div className="h-2.5 w-3/4 rounded-full bg-teal-soft/50" />
        <div className="h-1.5 w-1/2 rounded-full bg-line-low" />
        <div className="h-1.5 w-1/3 rounded-full bg-line-low" />
      </div>
    </div>
  );
}

function ChatMockup() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-accent-soft px-3 py-2">
          <div className="h-2 w-24 rounded-full bg-accent/20" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-line-low px-3 py-2">
          <div className="h-2 w-20 rounded-full bg-ink-3/20" />
        </div>
      </div>
    </div>
  );
}

const MOCKUPS = [PreferencesMockup, MatchesMockup, ChatMockup];

export function AppPreview() {
  return (
    <section className="bg-paper py-20 md:py-24" aria-labelledby="app-preview-heading">
      <div className="mx-auto max-w-7xl px-5 md:px-12">
        <div className="text-center mb-14">
          <p className="text-eyebrow mb-5">Experience</p>
          <h2
            id="app-preview-heading"
            className="text-display max-w-3xl mx-auto text-ink"
          >
            Sophisticated tools for your housing search
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-body-lg text-ink-3">
            Every interaction is designed for clarity and ease, ensuring a premium experience from first login to move-in.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          {APP_PREVIEW_STEPS.map((step, i) => {
            const StepIcon = ICON_MAP[step.icon];
            const MockupComponent = MOCKUPS[i];
            return (
              <div key={step.title} className="group flex flex-col h-full bg-surface rounded-3xl overflow-hidden border border-line-low transition-all duration-500 hover:shadow-lg hover:-translate-y-1">
                <div className="p-6 pb-3">
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${step.tint}`}
                  >
                    <StepIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-h1 text-2xl text-ink mb-2">{step.title}</h3>
                  <p className="text-body-md text-ink-3 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                <div className="mt-auto px-6 pb-6">
                  <div className="rounded-2xl bg-paper border border-line-low overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                    <MockupComponent />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
