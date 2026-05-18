import { Helmet } from "react-helmet-async";

import SemanticSearchClient from "@/components/page-clients/SemanticSearchClient";

const BASE_URL = import.meta.env.VITE_APP_URL ?? "https://360ghar.com";

export function SemanticSearchPage() {
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
        name: "Search",
        item: `${BASE_URL}/search`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Semantic Search",
        item: `${BASE_URL}/search/semantic`,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Semantic Search — Find Your Ideal Home | 360 Flatmates</title>
        <meta name="description" content="Describe your ideal home in plain language and let 360 Flatmates find the best matches. Search by vibe, budget, amenities, and lifestyle preferences." />
        <link rel="canonical" href={`${BASE_URL}/search/semantic`} />
        <meta property="og:title" content="Semantic Search — Find Your Ideal Home" />
        <meta property="og:description" content="Describe your ideal home in plain language and let 360 Flatmates find the best matches." />
        <meta property="og:url" content={`${BASE_URL}/search/semantic`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="360 Flatmates" />
      </Helmet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd),
        }}
      />
      <SemanticSearchClient />
    </>
  );
}
