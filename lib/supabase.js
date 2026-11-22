import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Use Capacitor Preferences for native iOS/Android persistent storage,
// fall back to localStorage on web.
async function getCapacitorStorage() {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    return {
      getItem: async (key) => {
        const { value } = await Preferences.get({ key });
        return value;
      },
      setItem: async (key, value) => {
        await Preferences.set({ key, value });
      },
      removeItem: async (key) => {
        await Preferences.remove({ key });
      },
    };
  } catch {
    return typeof window !== "undefined" ? window.localStorage : undefined;
  }
}

function createSupabaseClient(storage) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // needed for password reset and magic links
      storage,
    },
  });
}

// On native (Capacitor), initialise with async Preferences storage.
// On web, initialise immediately with localStorage so SSR/hydration works.
let _supabase;
export let supabaseReady = Promise.resolve();

if (typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.()) {
  // Native app — bootstrap with localStorage first, then upgrade to Preferences.
  // Export supabaseReady so auth-context can wait before calling getSession().
  _supabase = createSupabaseClient(window.localStorage);
  supabaseReady = getCapacitorStorage().then((storage) => {
    _supabase = createSupabaseClient(storage);
  });
} else {
  _supabase = createSupabaseClient(
    typeof window !== "undefined" ? window.localStorage : undefined
  );
}

export const supabase = new Proxy(
  {},
  {
    get(_, prop) {
      return _supabase[prop];
    },
  }
);
