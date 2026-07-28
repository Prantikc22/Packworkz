import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_REQUEST_TIMEOUT_MS = 8_000;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  global: {
    fetch: async (input, init) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), SUPABASE_REQUEST_TIMEOUT_MS);

      try {
        return await fetch(input, {
          ...init,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
    },
  },
});

console.info("[supabase] server client initialised");
