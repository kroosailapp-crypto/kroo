import { supabaseAdmin } from "@/lib/supabase-admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kroofinder.com";

export async function POST(request) {
  try {
    const { teamId, email, role } = await request.json();

    const { data: inv } = await supabaseAdmin
      .from("pro_invitations")
      .select("token")
      .eq("team_id", teamId)
      .eq("email", email)
      .is("accepted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const { data: team } = await supabaseAdmin.from("pro_teams").select("name").eq("id", teamId).single();

    if (!inv || !team) return Response.json({ error: "Not found" }, { status: 404 });

    const inviteUrl = `${APP_URL}/pro/invite/${inv.token}`;
    const roleLabel = { manager: "Manager", sailor: "Sailor", shore_crew: "Shore Crew" }[role] || role;

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:32px 0">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden">
    <tr><td style="background:#123251 url('https://www.kroosail.com/patterns/windmap-hero.svg') repeat;background-size:1100px auto;padding:32px 40px">
      <img src="https://www.kroosail.com/logos/kroo-logo-white.png" alt="Kroo" height="36" style="display:block">
      <div style="margin-top:16px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#45B589">Team Invitation</div>
    </td></tr>
    <tr><td style="padding:40px 40px 48px">
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#123251">You're invited to join ${team.name}</h2>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#3A424D">
        <strong>${team.name}</strong> has invited you to join their team on Kroo Pro as <strong>${roleLabel}</strong>.
      </p>
      <a href="${inviteUrl}" style="display:inline-block;padding:12px 24px;border-radius:10px;background:#14764F;color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none">Accept Invitation</a>
    </td></tr>
    <tr><td style="background:#F4F7FA;padding:24px 40px 32px">
      <p style="margin:0;font-size:13px;color:#565E69">If you didn't expect this invitation, you can safely ignore this email.</p>
      <p style="margin:8px 0 0;font-size:13px;color:#565E69">Kroo Finder · kroosail.com</p>
    </td></tr>
  </table>
  </td></tr>
</table>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Kroo Finder <hello@updates.kroosail.com>",
        to: [email],
        subject: `You've been invited to join ${team.name} on Kroo Pro`,
        html,
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Pro invite error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
