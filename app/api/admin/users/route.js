import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase().trim() || "";

  const [{ data: crew }, { data: boats }, { data: authUsers }, { data: proMembers }, { data: proTeams }, { data: suspensions }] = await Promise.all([
    supabaseAdmin.from("crew_profiles").select("id, name, location, experience_level, avatar_url"),
    supabaseAdmin.from("boat_profiles").select("id, boat_name, home_port, skipper_name, photo_url"),
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    supabaseAdmin.from("pro_team_members").select("user_id"),
    supabaseAdmin.from("pro_teams").select("owner_id"),
    supabaseAdmin.from("user_suspensions").select("user_id, status"),
  ]);
  const restrictionMap = Object.fromEntries((suspensions || []).map((s) => [s.user_id, s.status]));

  // Users who also have a Kroo Pro account (team member or team owner)
  const proIds = new Set([
    ...(proMembers || []).map((m) => m.user_id),
    ...(proTeams || []).map((t) => t.owner_id),
  ]);

  const emailMap = {};
  const bannedMap = {};
  for (const u of authUsers?.users || []) {
    emailMap[u.id] = u.email;
    bannedMap[u.id] = restrictionMap[u.id] || null; // 'suspended' | 'banned' | null
  }

  const crewResults = (crew || [])
    .map((c) => ({ ...c, type: "crew", email: emailMap[c.id] || "", restriction: bannedMap[c.id] || null, pro: proIds.has(c.id) }))
    .filter((c) => !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q));

  const boatResults = (boats || [])
    .map((b) => ({ ...b, type: "boat", email: emailMap[b.id] || "", restriction: bannedMap[b.id] || null, pro: proIds.has(b.id) }))
    .filter((b) => !q || b.boat_name?.toLowerCase().includes(q) || b.email?.toLowerCase().includes(q) || b.skipper_name?.toLowerCase().includes(q));

  return Response.json({ crew: crewResults, boats: boatResults });
}
