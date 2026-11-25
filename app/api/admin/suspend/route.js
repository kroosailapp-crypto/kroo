import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

// action:
//   "suspend" - user can still log in but only sees their profile with a banner;
//               hidden from everyone else (see supabase/suspension.sql)
//   "ban"     - user can't log in at all, and is hidden from everyone else
//   "restore" - lift a suspension or ban
export async function POST(request) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json();
  const { userId } = body;
  // Older clients send { suspend: boolean }
  const action = body.action || (body.suspend ? "suspend" : "restore");
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });
  if (!["suspend", "ban", "restore"].includes(action)) return Response.json({ error: "Invalid action" }, { status: 400 });
  if (userId === admin.id) return Response.json({ error: "You can't restrict your own account" }, { status: 400 });

  if (action === "restore") {
    const { error } = await supabaseAdmin.from("user_suspensions").delete().eq("user_id", userId);
    if (error) return Response.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabaseAdmin.from("user_suspensions").upsert({
      user_id: userId,
      status: action === "ban" ? "banned" : "suspended",
      suspended_at: new Date().toISOString(),
      suspended_by: admin.id,
    });
    if (error) return Response.json({ error: error.message }, { status: 500 });
  }

  // Only a ban blocks login
  await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: action === "ban" ? "876000h" : "none" });

  return Response.json({ ok: true });
}
