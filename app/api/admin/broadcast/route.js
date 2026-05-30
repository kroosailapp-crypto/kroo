import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function POST(request) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 });

  const { target, message, senderId } = await request.json();
  if (!target || !message || !senderId) return Response.json({ error: "Missing fields" }, { status: 400 });

  const table = target === "crew" ? "crew_profiles" : "boat_profiles";
  const { data: users } = await supabaseAdmin.from(table).select("id");

  if (!users || users.length === 0) return Response.json({ ok: true, sent: 0 });

  const rows = users
    .filter((u) => u.id !== senderId)
    .map((u) => ({
      sender_id: senderId,
      receiver_id: u.id,
      content: message,
    }));

  await supabaseAdmin.from("messages").insert(rows);

  return Response.json({ ok: true, sent: rows.length });
}
