import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase().trim() || "";

  const [{ data: crew }, { data: boats }, { data: authUsers }] = await Promise.all([
    supabaseAdmin.from("crew_profiles").select("id, name, location, experience_level, avatar_url"),
    supabaseAdmin.from("boat_profiles").select("id, boat_name, home_port, skipper_name, photo_url"),
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const emailMap = {};
  const bannedMap = {};
  for (const u of authUsers?.users || []) {
    emailMap[u.id] = u.email;
    bannedMap[u.id] = !!u.banned_until;
  }

  const crewResults = (crew || [])
    .map((c) => ({ ...c, type: "crew", email: emailMap[c.id] || "", banned: bannedMap[c.id] || false }))
    .filter((c) => !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q));

  const boatResults = (boats || [])
    .map((b) => ({ ...b, type: "boat", email: emailMap[b.id] || "", banned: bannedMap[b.id] || false }))
    .filter((b) => !q || b.boat_name?.toLowerCase().includes(q) || b.email?.toLowerCase().includes(q) || b.skipper_name?.toLowerCase().includes(q));

  return Response.json({ crew: crewResults, boats: boatResults });
}
