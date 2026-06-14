import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

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

  const env = getEnv();
  browserClient = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        // PKCE flow: OAuth providers (Google/Apple) redirect back with a
        // `?code=` param that AuthCallbackPage exchanges via
        // `exchangeCodeForSession`. The supabase-js default is `implicit`,
        // which instead returns tokens in the URL hash and would make the
        // callback's `searchParams.get("code")` always null — silently
        // breaking Google sign-in.
        flowType: "pkce",
        // The callback page exchanges the code explicitly, so disable the
        // automatic URL detection to avoid a double-exchange race that
        // consumes the single-use code before our handler runs.
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );

  return browserClient;
}
