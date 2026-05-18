import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";

import ListingDetailClient from "@/components/page-clients/ListingDetailClient";
import { formatLocation, formatRent } from "@/lib/utils";

const BASE_URL = import.meta.env.VITE_APP_URL ?? "https://360ghar.com";
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.360ghar.com/app/v1";

interface PropertyData {
  id: number;
  title: string;
  description?: string;
  city: string;
  locality: string;
  monthly_rent: number;
  main_image_url?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  features?: string[];
}

async function fetchProperty(id: number): Promise<PropertyData | null> {
  try {
    const res = await fetch(`${API_BASE}/properties/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const propertyId = Number(id);

  const { data: property } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => fetchProperty(propertyId),
    enabled: !isNaN(propertyId),
  });

  const url = `${BASE_URL}/discover/${id}`;

  // Determine meta values
  const metaTitle = property?.title ?? "Listing Details";
  const metaDescription = property
    ? [
        property.title,
        formatLocation(property.locality, property.city),
        formatRent(property.monthly_rent),
        property.bedrooms ? `${property.bedrooms} bed` : undefined,
        property.area_sqft ? `${property.area_sqft} sq ft` : undefined,
      ]
        .filter(Boolean)
        .join(" — ") + ". Verified listing on 360 Flatmates."
    : "View verified room and flatmate listings on 360 Flatmates with compatibility scores, society vibe tags, and visit scheduling.";

  // BreadcrumbList JSON-LD
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
        name: "Discover",
        item: `${BASE_URL}/discover`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: property?.title ?? "Listing",
        item: url,
      },
    ],
  };

  // RealEstateListing JSON-LD
  const listingLd = property
    ? {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: property.title,
        description: property.description ?? `Verified listing in ${property.locality}, ${property.city}`,
        url,
        ...(property.main_image_url ? { image: property.main_image_url } : {}),
        offers: {
          "@type": "Offer",
          price: property.monthly_rent,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: property.locality,
          addressRegion: property.city,
          addressCountry: "IN",
        },
      }
    : null;

  return (
    <>
      <Helmet>
        <title>{metaTitle} | 360 Flatmates</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={url} />
        {property?.main_image_url && (
          <meta property="og:image" content={property.main_image_url} />
        )}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="360 Flatmates" />
      </Helmet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd),
        }}
      />
      {listingLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(listingLd),
          }}
        />
      )}
      <ListingDetailClient />
    </>
  );
}
