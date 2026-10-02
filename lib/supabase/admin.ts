import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/** Server-only client. Its secret key bypasses RLS and must never reach a client component. */
export function createAdminSupabaseClient() {
  const url = required("SUPABASE_URL", process.env.SUPABASE_URL);
  const secret = required("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);

  return createClient<Database>(url, secret, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
