import {
  FeatureHighlights,
  HowItWorks,
  AppPreview,
  CitiesShowcase,
  FAQAccordion,
  BottomCTA,
} from "@/components/landing";
import { LandingClientSections } from "@/components/landing/LandingClientSections";
import { FAQ_ITEMS } from "@/components/landing/landing-data";
import { Helmet } from "react-helmet-async";

export function LandingPage() {
  return (
    <>
      <Helmet>
        <title>360 Flatmates — Find Compatible Flatmates & Rooms</title>
        <meta name="description" content="Find compatible flatmates and verified rental listings across India. Compatibility scores, society vibe tags, and visit scheduling built in." />
      </Helmet>
      <main id="main" suppressHydrationWarning>
        <LandingClientSections />
        <FeatureHighlights />
        <HowItWorks />
        <AppPreview />
        <CitiesShowcase />
        <FAQAccordion />
        <BottomCTA />

        {/* Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ_ITEMS.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.answer,
                },
              })),
            }),
          }}
        />
      </main>
    </>
  );
}
