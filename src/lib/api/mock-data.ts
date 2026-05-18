import {
  FLATMATE_MODE_OPTIONS,
  LIFESTYLE_DIMENSIONS,
  LISTING_SHARING_TYPE_OPTIONS,
  MOVE_IN_TIMELINE_OPTIONS,
  NON_NEGOTIABLE_OPTIONS
} from "@/lib/data";
import { calculateCompatibility, toApiCompatibilityBreakdown } from "@/lib/compatibility";
import type {
  CatalogEntry,
  CityStats,
  CompatibilityBreakdown,
  FlatmatesBootstrap,
  FlatmatesPeer,
  FlatmatesProfile,
  Property,
  SavedSearch,
  SearchAlert,
  WebSearchResponse
} from "./types";

const now = "2026-05-16T09:00:00.000Z";

export const mockCurrentProfile = {
  id: 101,
  full_name: "Priya Nair",
  email: "priya@example.com",
  phone: "+919876543210",
  profile_image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  mode: "co_hunter",
  profile_status: "active",
  onboarding_completed: true,
  onboarding_current_step: 7,
  bio: "Software engineer relocating to Gurugram. Quiet at home, tidy, and looking for a compatible flatshare.",
  age: 26,
  profession: "Software Engineer",
  budget_min: 18000,
  budget_max: 32000,
  move_in_timeline: "this_month",
  city: "Gurugram",
  locality: "DLF Phase 1",
  sleep_schedule: "early_bird",
  cleanliness: "tidy",
  food_habits: "vegetarian",
  smoking_drinking: "neither",
  guests_policy: "occasional_ok",
  work_style: "wfh_mostly",
  gender: "female",
  gender_preference: "any",
  preferences: {
    non_negotiables: ["food_veg_only", "no_smoking", "min_tidy"]
  },
  last_active_at: now
} as const satisfies FlatmatesProfile;

export const mockPeers = [
  {
    id: 202,
    full_name: "Aditi Rao",
    profile_image_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    mode: "open_to_both",
    city: "Bangalore",
    locality: "HSR Layout",
    age: 27,
    profession: "Product Designer",
    bio: "WFH most days, prefers a calm home and an early routine.",
    budget_min: 20000,
    budget_max: 34000,
    move_in_timeline: "this_month",
    sleep_schedule: "early_bird",
    cleanliness: "tidy",
    food_habits: "vegetarian",
    smoking_drinking: "neither",
    guests_policy: "occasional_ok",
    work_style: "wfh_mostly",
    gender: "female",
    gender_preference: "any",
    non_negotiables: ["no_smoking", "min_tidy"],
    has_pets: false,
    match_percentage: 100
  },
  {
    id: 203,
    full_name: "Rohan Mehta",
    profile_image_url:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    mode: "room_poster",
    city: "Bangalore",
    locality: "Indiranagar",
    age: 29,
    profession: "Growth Manager",
    bio: "Has a room in a 3BHK, social on weekends, office mostly.",
    budget_min: 25000,
    budget_max: 38000,
    move_in_timeline: "next_month",
    sleep_schedule: "night_owl",
    cleanliness: "minimal",
    food_habits: "non_vegetarian",
    smoking_drinking: "smoke_outside",
    guests_policy: "open_house",
    work_style: "office_mostly",
    gender: "male",
    gender_preference: "any",
    non_negotiables: [],
    has_pets: true,
    match_percentage: 10
  },
  {
    id: 204,
    full_name: "Meera Shah",
    profile_image_url:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    mode: "co_hunter",
    city: "Bangalore",
    locality: "Koramangala",
    age: 24,
    profession: "Data Analyst",
    bio: "Flexible schedule, vegetarian, and looking near Koramangala.",
    budget_min: 16000,
    budget_max: 28000,
    move_in_timeline: "flexible",
    sleep_schedule: "flexible",
    cleanliness: "spotless",
    food_habits: "vegetarian",
    smoking_drinking: "neither",
    guests_policy: "no_overnight",
    work_style: "mixed",
    gender: "female",
    gender_preference: "female",
    non_negotiables: ["food_veg_only", "no_smoking"],
    has_pets: false,
    match_percentage: 73
  }
] as const satisfies readonly FlatmatesPeer[];

export const mockListings = [
  {
    id: 301,
    owner_id: 203,
    property_type: "flatmate",
    purpose: "rent",
    title: "Sunny private room in Indiranagar 3BHK",
    description:
      "A private room in a lived-in 3BHK near the metro. Good light, calm weekdays, social weekends.",
    city: "Bangalore",
    state: "Karnataka",
    locality: "Indiranagar",
    sub_locality: "Defence Colony",
    latitude: 12.9719,
    longitude: 77.6412,
    monthly_rent: 28500,
    main_image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    image_urls: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
    ],
    area_sqft: 1250,
    bedrooms: 3,
    bathrooms: 2,
    features: ["balcony", "wifi", "washing_machine"],
    tags: ["metro_nearby", "pet_friendly"],
    owner_name: "Rohan Mehta",
    available_from: "2026-06-01",
    gender_preference: "any",
    sharing_type: "private_room",
    security_deposit: 57000,
    maintenance_charges: 2500,
    interest_count: 18,
    view_count: 240,
    like_count: 36,
    is_available: true,
    created_at: "2026-05-10T10:30:00.000Z",
    preferences: {
      society_type: "gated",
      society_vibe_tags: ["quiet", "young_professionals"]
    },
    status: "active",
    property_status: "approved",
    expires_at: "2026-08-10T10:30:00.000Z",
    distance_km: 2.8,
    liked: false,
    user_has_scheduled_visit: false,
    user_scheduled_visit_count: 0,
    owner: {
      id: 203,
      full_name: "Rohan Mehta",
      profile_image_url:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      phone: "+919812345678"
    }
  },
  {
    id: 302,
    owner_id: 205,
    property_type: "flatmate",
    purpose: "rent",
    title: "Quiet master bedroom near HSR cafes",
    description:
      "Master bedroom in a tidy 2BHK. Ideal for someone who works from home and likes a calm routine.",
    city: "Bangalore",
    state: "Karnataka",
    locality: "HSR Layout",
    latitude: 12.9121,
    longitude: 77.6446,
    monthly_rent: 24500,
    main_image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    image_urls: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"],
    area_sqft: 980,
    bedrooms: 2,
    bathrooms: 2,
    features: ["wifi", "power_backup", "desk_space"],
    tags: ["quiet", "wfh_friendly"],
    owner_name: "Aditi Rao",
    available_from: "2026-05-25",
    gender_preference: "female",
    sharing_type: "master_bedroom",
    security_deposit: 49000,
    maintenance_charges: 2000,
    interest_count: 12,
    view_count: 180,
    like_count: 28,
    is_available: true,
    created_at: "2026-05-12T08:00:00.000Z",
    preferences: {
      society_type: "independent",
      society_vibe_tags: ["quiet", "wfh_friendly"]
    },
    status: "active",
    property_status: "approved",
    expires_at: "2026-08-12T08:00:00.000Z",
    distance_km: 1.4,
    liked: true,
    user_has_scheduled_visit: true,
    user_scheduled_visit_count: 1,
    user_next_visit_date: "2026-05-20T12:30:00.000Z",
    owner: {
      id: 202,
      full_name: "Aditi Rao",
      profile_image_url:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
    }
  }
] as const satisfies readonly Property[];

export const mockCatalogs = [
  {
    key: "flatmate_modes",
    version: 1,
    payload: { options: FLATMATE_MODE_OPTIONS }
  },
  {
    key: "move_in_timelines",
    version: 1,
    payload: { options: MOVE_IN_TIMELINE_OPTIONS }
  },
  {
    key: "quiz_dimensions",
    version: 1,
    payload: { dimensions: LIFESTYLE_DIMENSIONS }
  },
  {
    key: "room_types",
    version: 1,
    payload: { options: LISTING_SHARING_TYPE_OPTIONS }
  },
  {
    key: "non_negotiables",
    version: 1,
    payload: { options: NON_NEGOTIABLE_OPTIONS }
  }
] as const satisfies readonly CatalogEntry[];

export const mockBootstrap = {
  profile: mockCurrentProfile,
  catalogs: [...mockCatalogs],
  active_listing_count: 1,
  conversation_count: 2,
  unread_message_count: 1
} satisfies FlatmatesBootstrap;

export const mockSavedSearches = [
  {
    id: 401,
    user_id: 101,
    name: "Koramangala under 32k",
    filters: {
      q: "Koramangala",
      search_type: "listings",
      city: "Bangalore",
      locality: "Koramangala",
      price_max: 32000,
      property_type: ["flatmate"],
      purpose: "rent",
      sort_by: "match_percentage",
      radius: 5,
      page: 1,
      limit: 20
    },
    alert_enabled: true,
    alert_frequency: "daily",
    alert_channels: ["email", "in_app"],
    last_run_at: now,
    new_results_count: 2,
    created_at: "2026-05-10T08:00:00.000Z",
    updated_at: now
  }
] as const satisfies readonly SavedSearch[];

export const mockSearchAlerts = [
  {
    id: 501,
    user_id: 101,
    name: "HSR quiet rooms",
    filters: {
      q: "quiet HSR",
      search_type: "listings",
      city: "Bangalore",
      locality: "HSR Layout",
      price_max: 30000,
      property_type: ["flatmate"],
      purpose: "rent",
      radius: 5,
      page: 1,
      limit: 20
    },
    frequency: "daily",
    channels: ["in_app"],
    enabled: true,
    last_sent_at: now,
    results_sent_count: 1,
    created_at: "2026-05-11T08:00:00.000Z"
  }
] as const satisfies readonly SearchAlert[];

export const mockCityStats = [
  {
    city: "Gurugram",
    active_users: 980,
    total_listings: 256,
    new_listings_7d: 34,
    total_matches_7d: 142,
    match_rate: 22.8,
    is_waitlist: false
  },
  {
    city: "Bangalore",
    active_users: 1240,
    total_listings: 318,
    new_listings_7d: 42,
    total_matches_7d: 168,
    match_rate: 24.6,
    is_waitlist: false
  },
  {
    city: "Mumbai",
    active_users: 820,
    total_listings: 144,
    new_listings_7d: 18,
    total_matches_7d: 76,
    match_rate: 19.2,
    is_waitlist: false
  }
] as const satisfies readonly CityStats[];

export function createMockCompatibility(
  peerId: number
): CompatibilityBreakdown {
  const peer = mockPeers.find((candidate) => candidate.id === peerId) ?? mockPeers[0];
  return toApiCompatibilityBreakdown(
    calculateCompatibility(mockCurrentProfile, peer)
  );
}

export function createMockWebSearchResponse(
  searchType: "listings" | "profiles" | "all" = "listings"
): WebSearchResponse {
  const results =
    searchType === "profiles"
      ? [...mockPeers]
      : searchType === "all"
        ? [...mockListings, ...mockPeers]
        : [...mockListings];

  return {
    results,
    total: results.length,
    page: 1,
    limit: 20,
    total_pages: 1,
    search_type: searchType,
    filters_applied: {
      property_type: ["flatmate"],
      purpose: "rent"
    },
    search_center: {
      latitude: 12.9352,
      longitude: 77.6245
    }
  };
}

