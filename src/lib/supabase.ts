/**
 * Browser-side Supabase client — used exclusively for Realtime subscriptions.
 * All DB mutations go through Next.js API routes (Drizzle + pg), not this client.
 *
 * IMPORTANT: Only import this in "use client" components.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !anonKey) {
    throw new Error("Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  _client = createClient(url, anonKey, {
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  });

  return _client;
}
