import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client. Bypasses RLS. Use ONLY from server-only code:
// - Webhook handlers from trusted external sources (Rappi, PedidosYa, WhatsApp Cloud).
// - Background jobs / pg_cron-driven HTTP triggers.
// Never expose to the client.
export function createAdminClient() {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRole) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY missing. Set it in .env.local for admin operations.",
    );
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRole,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
