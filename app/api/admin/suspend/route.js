import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

// Suspending doesn't block login: the user can still sign in and sees a banner
// on their profile, while their profile is hidden from everyone else
// (see supabase/suspension.sql).
export async function POST(request) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 });

  const { userId, suspend } = await request.json();
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });

  if (suspend) {
    const { error } = await supabaseAdmin
      .from("user_suspensions")
      .upsert({ user_id: userId, suspended_at: new Date().toISOString(), suspended_by: admin.id });
    if (error) return Response.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabaseAdmin.from("user_suspensions").delete().eq("user_id", userId);
    if (error) return Response.json({ error: error.message }, { status: 500 });
  }

  // Clear any legacy login ban so the user can always sign in
  await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: "none" });

  return Response.json({ ok: true });
}
