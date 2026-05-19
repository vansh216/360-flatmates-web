import { useCountUp } from "@/hooks/useCountUp";
import { RevealSection } from "@/components/ui/RevealSection";
import { STATS } from "./landing-data";

function StatItem({
  numericValue,
  suffix,
  label,
}: {
  numericValue: number;
  suffix: string;
  label: string;
}) {
  const { ref, value } = useCountUp(numericValue, { duration: 2500 });

  const formatValue = (val: number, target: number) => {
    if (target === 10000) return `${(val / 1000).toFixed(0)}K+`;
    if (target === 5000) return `${(val / 1000).toFixed(0)}K+`;
    if (target === 86) return `${val}%`;
    if (target === 2) return `${val}`;
    return String(val);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 md:p-8">
      <p className="text-display text-5xl md:text-6xl tabular text-accent font-light tracking-tight leading-none">
        <span ref={ref}>
          {value >= numericValue ? suffix : formatValue(value, numericValue)}
        </span>
      </p>
      <p className="text-label-md text-ink-3 uppercase tracking-widest mt-3.5">{label}</p>
    </div>
  );
}

export function StatsStrip() {
  return (
    <section
      className="relative bg-surface py-16 md:py-24 border-y border-line-low"
      aria-labelledby="stats-heading"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-12">
        <RevealSection className="mb-14 text-center">
          <p id="stats-heading" className="text-eyebrow mb-4">
            By the numbers
          </p>
          <h2 className="text-h1 text-ink text-3xl md:text-4xl">The proof is in the platform</h2>
        </RevealSection>

        {/* Seamless border-delimited stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border border-line-low rounded-3xl bg-paper/40 backdrop-blur-xs divide-y-0 lg:divide-x divide-line-low/50 overflow-hidden shadow-xs hover:border-accent/15 transition-all duration-300">
          {STATS.map((stat, idx) => (
            <div
              key={stat.label}
              className={`
                ${idx % 2 === 1 ? 'border-l border-line-low/50 lg:border-l-0' : ''}
                ${idx >= 2 ? 'border-t border-line-low/50 lg:border-t-0' : ''}
              `}
            >
              <StatItem
                numericValue={stat.numericValue}
                suffix={stat.display}
                label={stat.label}
              />
            </div>
          ))}
        </div>
      </div>

      <ul className="sr-only">
        {STATS.map((stat) => (
          <li key={stat.label}>
            {stat.display} {stat.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

