import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function POST(request) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 });

  const { userId, suspend } = await request.json();
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });

  await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: suspend ? "876000h" : "none",
  });

  return Response.json({ ok: true });
}
