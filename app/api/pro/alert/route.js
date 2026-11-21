import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  try {
    const { teamId, title, description } = await request.json();

    const { data: team } = await supabaseAdmin.from("pro_teams").select("name").eq("id", teamId).single();
    const { data: members } = await supabaseAdmin
      .from("pro_team_members")
      .select("email, user_id")
      .eq("team_id", teamId);

    if (!team || !members?.length) return Response.json({ ok: true });

    const emails = members.map(m => m.email).filter(Boolean);

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:32px 0">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden">
    <tr><td style="background:#123251 url('https://www.kroosail.com/patterns/windmap-hero.svg') repeat;background-size:1100px auto;padding:32px 40px">
      <img src="https://www.kroosail.com/logos/kroo-finder-white.png" alt="Kroo Finder" height="32" style="display:block">
      <div style="margin-top:16px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#45B589">${team.name} · Kroo Pro</div>
    </td></tr>
    <tr><td style="padding:40px 40px 48px">
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#123251">${title}</h2>
      ${description ? `<p style="margin:0;font-size:15px;line-height:1.65;color:#3A424D">${description}</p>` : ""}
    </td></tr>
    <tr><td style="background:#F4F7FA;padding:24px 40px 32px">
      <p style="margin:0;font-size:13px;color:#565E69">This alert was sent by your team manager via Kroo Pro.</p>
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
        bcc: emails,
        subject: `${team.name}: ${title}`,
        html,
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Pro alert error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
