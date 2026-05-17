import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  "https://tmvbjbmudxyvimdnhrmw.supabase.co";

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdmJqYm11ZHh5dmltZG5ocm13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgwNzc2OCwiZXhwIjoyMDkxMzgzNzY4fQ.fT65Gil3YTnGYgtcUwiM2MQoRP9wQB4KJtxwq2qGjr0";

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

console.info("[supabase] client initialised →", SUPABASE_URL);
