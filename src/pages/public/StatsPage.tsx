import { Helmet } from "react-helmet-async";

import StatsClient from "@/components/page-clients/StatsClient";

const BASE_URL = import.meta.env.VITE_APP_URL ?? "https://360ghar.com";

export function StatsPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "City Stats",
        item: `${BASE_URL}/stats`,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>City Stats — Flatmate Market Data | 360 Flatmates</title>
        <meta name="description" content="Explore flatmate market statistics across Indian cities. Active seekers, verified listings, average rents, and growth trends on 360 Flatmates." />
        <link rel="canonical" href={`${BASE_URL}/stats`} />
        <meta property="og:title" content="City Stats — Flatmate Market Data" />
        <meta property="og:description" content="Explore flatmate market statistics across Indian cities. Active seekers, verified listings, average rents, and growth trends." />
        <meta property="og:url" content={`${BASE_URL}/stats`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="360 Flatmates" />
      </Helmet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd),
        }}
      />
      <StatsClient />
    </>
  );
}
