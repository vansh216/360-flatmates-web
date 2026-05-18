import { RevealSection } from "@/components/ui/RevealSection";
import { DIMENSIONS, FEATURES } from "./landing-data";

export function FeatureHighlights() {
  return (
    <section
      className="bg-paper overflow-hidden"
      aria-labelledby="features-heading"
    >
      {/* Introduction */}
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-12 md:py-28">
        <RevealSection className="text-center lg:text-left">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-eyebrow mb-5">Why 360 Flatmates</p>
              <h2 id="features-heading" className="text-h1 text-ink">
                Compatibility is more than budget and location
              </h2>
            </div>
            <p className="max-w-[40ch] text-body-lg text-ink-3 lg:mb-2">
              We match on six lifestyle dimensions that actually matter when sharing a home in a premium environment.
            </p>
          </div>
        </RevealSection>
      </div>

      {/* Main Editorial Feature - Compatibility dimensions */}
      <div className="mx-auto max-w-7xl px-5 pb-20 md:px-12 md:pb-28">
        <RevealSection>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-16 items-center">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&q=80"
                alt="Sophisticated shared living space"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-ink/10" />
            </div>

            <div className="space-y-10">
              <div className="space-y-5">
                <h3 className="text-h1 text-ink">{FEATURES[0].title}</h3>
                <p className="text-body-lg text-ink-3">
                  {FEATURES[0].description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {DIMENSIONS.map((dim) => {
                  const DimIcon = dim.icon;
                  return (
                    <div
                      key={dim.label}
                      className="group flex flex-col gap-3 rounded-2xl border border-line-low bg-surface p-5 transition-all duration-300 hover:border-accent/30 hover:shadow-md"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${dim.tint}`}>
                        <DimIcon className="h-5 w-5" />
                      </div>
                      <span className="text-h3 text-ink group-hover:text-accent transition-colors">{dim.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </RevealSection>
      </div>

      {/* Secondary Features - Alternating Layout */}
      <div className="bg-surface py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-12 space-y-24">
          {/* Feature 1: Verified Profiles */}
          <RevealSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="order-2 lg:order-1 space-y-8">
                <p className="text-eyebrow">Trust & Security</p>
                <h3 className="text-display text-3xl md:text-5xl text-ink leading-tight">{FEATURES[1].title}</h3>
                <p className="text-body-lg text-ink-3 max-w-[45ch]">
                  {FEATURES[1].description}
                </p>
                <div className="pt-4">
                  <div className="flex items-center gap-4 text-ink">
                    <div className="h-10 w-10 rounded-full bg-success-soft flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-success" />
                    </div>
                    <span className="text-h3">ID Verified Communities</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative aspect-square max-w-md mx-auto lg:mx-0 lg:max-w-none w-full overflow-hidden rounded-2xl bg-paper-2 flex items-center justify-center p-12">
                <div className="relative w-full h-full border border-line-low rounded-xl bg-surface shadow-sm overflow-hidden flex flex-col items-center justify-center text-center p-8 space-y-6 animate-float-subtle">
                  <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center">
                    <img
                      src="https://i.pravatar.cc/150?img=11"
                      alt="Verified User"
                      width={80}
                      height={80}
                      className="rounded-full"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-h3">Arjun Malhotra</p>
                    <p className="text-caption">Software Engineer @ Google</p>
                  </div>
                  <div className="flex gap-2">
                    {["Verified ID", "Background Check", "Premium Member"].map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-1 rounded bg-accent-soft text-accent uppercase font-bold tracking-wider">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="absolute top-8 left-8 h-4 w-4 rounded-full bg-accent/20" />
                <div className="absolute bottom-12 right-12 h-8 w-8 rounded-full bg-accent/10" />
              </div>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}
