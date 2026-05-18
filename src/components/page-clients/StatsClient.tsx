import { Link } from "react-router";

import { useCities } from "@/hooks/queries/useCatalogs";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { AsyncView } from "@/components/ui/StateViews";
import { PageHeader } from "@/components/ui/Layout";
import { buttonClasses } from "@/components/ui/Button";
import { useState } from "react";

const HARDCODED_STATS = [
  { label: "Active seekers", value: "2,400+" },
  { label: "Verified listings", value: "1,800+" },
  { label: "Visits scheduled", value: "5,200+" },
  { label: "Matches made", value: "8,600+" },
  { label: "Avg. rent (1BHK)", value: "12,000" },
  { label: "Avg. rent (2BHK)", value: "22,000" },
] as const;

const GROWTH_DATA = [32, 48, 55, 61, 72, 86] as const;

export default function StatsClient() {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const { data: cities, isLoading: citiesLoading } = useCities();

  return (
    <main id="main" className="page-fade mx-auto max-w-7xl px-5 py-8 md:px-6">
      <PageHeader
        eyebrow="City statistics"
        title={`${selectedCity || "Gurugram"} Flatmate Market`}
      />

      <div className="mt-5 flex flex-wrap gap-2">
        <AsyncView
          data={cities ?? null}
          isLoading={citiesLoading}
          loading={
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-full" />
              ))}
            </>
          }
        >
          {(data) =>
            data.map((city) => (
              <Chip
                key={city.id}
                selected={selectedCity === city.name || (!selectedCity && city.id === data[0]?.id)}
                onClick={() => setSelectedCity(city.name)}
              >
                {city.name}
              </Chip>
            ))
          }
        </AsyncView>
      </div>

      <section className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HARDCODED_STATS.map((stat) => (
            <Card key={stat.label} className="p-5 text-center">
              <p className="text-display text-accent">{stat.value}</p>
              <p className="mt-1 text-body-md text-ink-2">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card className="mt-6 p-5">
        <h2 className="text-h2">Seeker growth</h2>
        <div className="mt-6 flex h-72 items-end gap-4">
          {GROWTH_DATA.map((value, index) => (
            <div key={value} className="flex flex-1 flex-col items-center gap-2">
              <span
                className="w-full rounded-t bg-accent"
                style={{ height: `${value * 2.4}px` }}
              />
              <span className="text-caption text-ink-3">M{index + 1}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-8 text-center">
        <Link to="/discover" className={buttonClasses("tertiary")}>
          Browse Listings
        </Link>
      </div>
    </main>
  );
}
