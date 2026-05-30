import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 });

  const [
    { count: crewCount },
    { count: boatCount },
    { count: regattaCount },
    { count: openCount },
    { count: filledCount },
  ] = await Promise.all([
    supabaseAdmin.from("crew_profiles").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("boat_profiles").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("regattas").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("regatta_positions").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabaseAdmin.from("regatta_positions").select("*", { count: "exact", head: true }).eq("status", "filled"),
  ]);

  return Response.json({ crewCount, boatCount, regattaCount, openCount, filledCount });
}
