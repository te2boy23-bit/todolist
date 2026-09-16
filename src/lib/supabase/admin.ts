import { createClient } from "@supabase/supabase-js";

// Vercel環境には通常 SUPABASE_SERVICE_ROLE_KEY が自動で設定されます。
// これを使えば RLS を無視してデータベースを操作できます。
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
