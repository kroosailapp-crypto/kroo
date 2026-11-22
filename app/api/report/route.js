import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { reported_id, reported_name, profile_type, reason: rawReason } = await request.json();
  const reason = String(rawReason || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  if (!reported_id || !reason?.trim()) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  const profileLabel = profile_type === "crew" ? "Sailor" : "Boat";

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:32px 0">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden">
    <tr><td style="background:#7B1D1D;padding:32px 40px">
      <img src="https://www.kroosail.com/logos/kroo-logo-white.png" alt="Kroo" height="36" style="display:block">
      <div style="margin-top:16px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#FCA5A5">User Report</div>
    </td></tr>
    <tr><td style="padding:40px 40px 48px">
      <h2 style="margin:0 0 24px;font-size:20px;font-weight:800;color:#123251">${profileLabel}: ${reported_name}</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #DBE1E8;font-size:13px;font-weight:700;color:#565E69;width:130px">Reported by</td>
          <td style="padding:10px 0;border-bottom:1px solid #DBE1E8;font-size:14px;color:#3A424D">${user.email}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #DBE1E8;font-size:13px;font-weight:700;color:#565E69">Reporter ID</td>
          <td style="padding:10px 0;border-bottom:1px solid #DBE1E8;font-size:13px;color:#565E69;font-family:monospace">${user.id}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #DBE1E8;font-size:13px;font-weight:700;color:#565E69">Reported user</td>
          <td style="padding:10px 0;border-bottom:1px solid #DBE1E8;font-size:14px;color:#3A424D">${reported_name}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #DBE1E8;font-size:13px;font-weight:700;color:#565E69">Reported ID</td>
          <td style="padding:10px 0;border-bottom:1px solid #DBE1E8;font-size:13px;color:#565E69;font-family:monospace">${reported_id}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;font-size:13px;font-weight:700;color:#565E69">Profile type</td>
          <td style="padding:10px 0;font-size:14px;color:#3A424D">${profileLabel}</td>
        </tr>
      </table>
      <div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#565E69;margin-bottom:8px">Reason</div>
      <div style="font-size:15px;line-height:1.65;color:#3A424D;white-space:pre-wrap">${reason}</div>
    </td></tr>
    <tr><td style="background:#F4F7FA;padding:24px 40px 32px">
      <p style="margin:0;font-size:13px;color:#565E69">Kroo Finder · kroosail.com</p>
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
      to: ["kroosailapp@gmail.com"],
      subject: `[Report] ${profileLabel}: ${reported_name}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return Response.json({ error: "Failed to send report." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
