import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ ids: [] }, { status: 401 });
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return Response.json({ ids: [] }, { status: 401 });

  const { data } = await supabaseAdmin.from("admin_users").select("user_id");
  return Response.json({ ids: (data || []).map((r) => r.user_id) });
}
