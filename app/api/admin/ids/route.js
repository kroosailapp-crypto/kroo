import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data } = await supabaseAdmin.from("admin_users").select("user_id");
  return Response.json({ ids: (data || []).map((r) => r.user_id) });
}
