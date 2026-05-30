import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { profileType } = await request.json();
  if (!profileType) return Response.json({ error: "Missing profileType" }, { status: 400 });

  const table = profileType === "crew" ? "crew_profiles" : "boat_profiles";
  const otherTable = profileType === "crew" ? "boat_profiles" : "crew_profiles";

  // Delete the profile
  await supabaseAdmin.from(table).delete().eq("id", user.id);

  // Check if other profile exists
  const { data: other } = await supabaseAdmin.from(otherTable).select("id").eq("id", user.id).maybeSingle();

  // If no profiles remain, delete the auth user entirely
  if (!other) {
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    return Response.json({ ok: true, deleteAccount: true });
  }

  return Response.json({ ok: true, deleteAccount: false, redirectTo: profileType === "crew" ? "/boat/profile" : "/crew/profile" });
}
