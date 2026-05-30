import { supabaseAdmin } from "./supabase-admin";

export async function verifyAdmin(request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return null;
  const { data } = await supabaseAdmin.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? user : null;
}
