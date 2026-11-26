import { supabaseAdmin } from "@/lib/supabase-admin";

// Contact-form fields are typed by users: escape them before they go into HTML
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const CONTACT_INBOX = "contact@kroosail.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kroofinder.com";

export async function POST(request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 1 contact message per user per hour
  const { data: cooldown } = await supabaseAdmin
    .from("notification_cooldowns")
    .select("last_sent_at")
    .eq("recipient_id", user.id)
    .eq("event", "contact")
    .maybeSingle();

  if (cooldown && (Date.now() - new Date(cooldown.last_sent_at).getTime()) < 60 * 60 * 1000) {
    return Response.json({ error: "Please wait before sending another message." }, { status: 429 });
  }

  await supabaseAdmin
    .from("notification_cooldowns")
    .upsert({ recipient_id: user.id, event: "contact", last_sent_at: new Date().toISOString() });

  const { name, email, subject, message } = await request.json();

  if (!subject?.trim() || !message?.trim()) {
    return Response.json({ error: "Subject and message are required." }, { status: 400 });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Contact: ${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:32px 0">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden">

    <!-- Header -->
    <tr><td style="background:#123251 url('https://www.kroosail.com/patterns/windmap-hero.svg') repeat;background-size:1100px auto;padding:32px 40px">
      <img src="https://www.kroosail.com/logos/kroo-logo-white.png" alt="Kroo" height="36" style="display:block">
      <div style="margin-top:16px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#45B589">Contact Form</div>
    </td></tr>

    <!-- Body -->
    <tr><td style="padding:40px 40px 48px">
      <h2 style="margin:0 0 24px;font-size:20px;font-weight:800;color:#123251">${esc(subject)}</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #DBE1E8;font-size:13px;font-weight:700;color:#565E69;width:80px">From</td>
          <td style="padding:10px 0;border-bottom:1px solid #DBE1E8;font-size:14px;color:#3A424D">${esc(name) || "—"}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #DBE1E8;font-size:13px;font-weight:700;color:#565E69">Email</td>
          <td style="padding:10px 0;border-bottom:1px solid #DBE1E8;font-size:14px;color:#3A424D">${esc(email) || "—"}</td>
        </tr>
      </table>
      <div style="font-size:15px;line-height:1.65;color:#3A424D;white-space:pre-wrap">${esc(message)}</div>
    </td></tr>

    <!-- Footer -->
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
      to: [CONTACT_INBOX],
      reply_to: email || undefined,
      subject: `[Contact] ${String(subject).replace(/[\r\n]+/g, " ").slice(0, 150)}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return Response.json({ error: "Failed to send message." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
