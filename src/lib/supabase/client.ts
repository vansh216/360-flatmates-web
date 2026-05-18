import { createClient } from "@supabase/supabase-js";

/**
 * Singleton browser Supabase client.
 *
 * Uses `createClient` from `@supabase/supabase-js` which manages auth
 * automatically in the browser. The singleton pattern ensures one
 * client instance across the app.
 */
let browserClient: ReturnType<typeof createClient> | undefined;

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!
  );

  return browserClient;
}
