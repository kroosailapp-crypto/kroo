import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSign } from "crypto";

// APNs JWT token (cached for up to 55 minutes)
let _apnsToken = null;
let _apnsTokenAt = 0;

function getApnsJwt() {
  const now = Math.floor(Date.now() / 1000);
  if (_apnsToken && now - _apnsTokenAt < 55 * 60) return _apnsToken;

  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const privateKey = (process.env.APNS_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (!keyId || !teamId || !privateKey) return null;

  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid: keyId })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ iss: teamId, iat: now })).toString("base64url");
  const unsigned = `${header}.${payload}`;
  const sign = createSign("SHA256");
  sign.update(unsigned);
  const sig = sign.sign({ key: privateKey, dsaEncoding: "ieee-p1363" }, "base64url");
  _apnsToken = `${unsigned}.${sig}`;
  _apnsTokenAt = now;
  return _apnsToken;
}

async function sendPush(userId, title, body) {
  try {
    const { data: row } = await supabaseAdmin
      .from("push_tokens")
      .select("token, platform")
      .eq("user_id", userId)
      .maybeSingle();
    if (!row) return;

    const jwt = getApnsJwt();
    if (!jwt) return;

    const bundleId = process.env.APNS_BUNDLE_ID || "app.kroo.sail";
    const url = `https://api.push.apple.com/3/device/${row.token}`;

    await fetch(url, {
      method: "POST",
      headers: {
        authorization: `bearer ${jwt}`,
        "apns-topic": bundleId,
        "apns-push-type": "alert",
        "apns-priority": "10",
        "content-type": "application/json",
      },
      body: JSON.stringify({ aps: { alert: { title, body }, sound: "default", badge: 1 } }),
    });
  } catch {
    // Push failure is non-fatal
  }
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kroofinder.com";

function emailHtml({ label, heading, body, ctaText, ctaUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:32px 0">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden">

    <!-- Header -->
    <tr><td style="background:#123251 url('https://www.kroosail.com/patterns/windmap-hero.svg') repeat;background-size:1100px auto;padding:32px 40px">
      <img src="https://www.kroosail.com/logos/kroo-logo-white.png" alt="Kroo" height="36" style="display:block">
      <div style="margin-top:16px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#45B589">${label}</div>
    </td></tr>

    <!-- Body -->
    <tr><td style="padding:40px 40px 48px">
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:800;line-height:1.2;color:#123251">${heading}</h2>
      <div style="font-size:15px;line-height:1.65;color:#3A424D">${body}</div>
      ${ctaText ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:24px;padding:12px 24px;border-radius:10px;background:#14764F;color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none">${ctaText}</a>` : ""}
    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#F4F7FA;padding:24px 40px 32px">
      <p style="margin:0;font-size:13px;line-height:1.6;color:#565E69">
        You're receiving this because you have notifications enabled in Kroo Finder.
        <a href="${APP_URL}/notifications" style="color:#14764F;text-decoration:none">Manage notifications</a>
      </p>
      <p style="margin:8px 0 0;font-size:13px;color:#565E69">Kroo Finder · kroosail.com</p>
    </td></tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;
}

async function sendEmail(to, subject, templateArgs) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Kroo Finder <hello@updates.kroosail.com>",
      to: [to],
      subject,
      html: emailHtml(templateArgs),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
}

async function getEmail(userId) {
  const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
  return user?.email || null;
}

async function getPrefs(userId, profileType) {
  const table = profileType === "boat" ? "boat_profiles" : "crew_profiles";
  const { data } = await supabaseAdmin.from(table).select("notification_prefs").eq("id", userId).maybeSingle();
  return data?.notification_prefs || {};
}

export async function POST(request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
    if (!caller) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { event, recipient_id, profile_type = "crew", ...data } = body;

    const [email, prefs] = await Promise.all([
      getEmail(recipient_id),
      getPrefs(recipient_id, profile_type),
    ]);

    if (!email) return Response.json({ ok: false, error: "No email found" });

    const prefKey = {
      new_message: "new_message",
      new_invite: "new_invite",
      regatta_confirmation: "regatta_confirmation",
      regatta_cancelled: "regatta_cancelled",
      new_application: "new_application",
      crew_cancelled: "crew_cancelled",
    }[event];

    if (prefs[prefKey] === false) {
      return Response.json({ ok: true, skipped: true });
    }

    // Cooldown: max 1 notification per event per recipient per hour
    const { data: cooldown } = await supabaseAdmin
      .from("notification_cooldowns")
      .select("last_sent_at")
      .eq("recipient_id", recipient_id)
      .eq("event", event)
      .maybeSingle();

    if (cooldown && (Date.now() - new Date(cooldown.last_sent_at).getTime()) < 60 * 60 * 1000) {
      return Response.json({ ok: true, skipped: true, reason: "cooldown" });
    }

    await supabaseAdmin
      .from("notification_cooldowns")
      .upsert({ recipient_id, event, last_sent_at: new Date().toISOString() });

    switch (event) {
      case "new_message":
        await sendEmail(email, `New message from ${data.sender_name}`, {
          label: "New Message",
          heading: `${data.sender_name} sent you a message`,
          body: `<blockquote style="border-left:3px solid #14764F;padding-left:16px;color:#565E69;margin:0 0 16px;font-style:italic">${data.message_preview}</blockquote>`,
          ctaText: "Reply",
          ctaUrl: APP_URL,
        });
        sendPush(recipient_id, `New message from ${data.sender_name}`, data.message_preview);
        break;

      case "new_invite":
        await sendEmail(email, `You've been invited to race on ${data.boat_name}`, {
          label: "Regatta Invite",
          heading: `Invite to sail on ${data.boat_name}`,
          body: `<p style="margin:0"><strong>${data.boat_name}</strong> has invited you to sail as <strong>${data.position_role}</strong> at <strong>${data.regatta_name}</strong>.</p>`,
          ctaText: "View Invite",
          ctaUrl: `${APP_URL}/crew/regattas`,
        });
        sendPush(recipient_id, `Sail Invite from ${data.boat_name}`, `You've been invited to sail at ${data.regatta_name}`);
        break;

      case "regatta_confirmation":
        await sendEmail(email, `You've been confirmed for ${data.regatta_name}!`, {
          label: "Confirmed",
          heading: `You're on the crew for ${data.regatta_name}`,
          body: `<p style="margin:0"><strong>${data.boat_name}</strong> has confirmed you as <strong>${data.position_role}</strong> for <strong>${data.regatta_name}</strong>. Fair winds!</p>`,
          ctaText: "View Details",
          ctaUrl: `${APP_URL}/crew/regattas`,
        });
        break;

      case "regatta_cancelled":
        await sendEmail(email, `${data.regatta_name} has been cancelled`, {
          label: "Regatta Cancelled",
          heading: `${data.regatta_name} has been cancelled`,
          body: `<p style="margin:0">Unfortunately, <strong>${data.regatta_name}</strong> hosted by <strong>${data.boat_name}</strong> has been cancelled.</p>`,
          ctaText: "Browse Other Boats",
          ctaUrl: `${APP_URL}/crew/feed`,
        });
        break;

      case "new_application":
        await sendEmail(email, `New application from ${data.sailor_name}`, {
          label: "New Application",
          heading: `${data.sailor_name} applied for ${data.position_role}`,
          body: `<p style="margin:0"><strong>${data.sailor_name}</strong> has applied for the <strong>${data.position_role}</strong> position on <strong>${data.regatta_name}</strong>.</p>`,
          ctaText: "Review Application",
          ctaUrl: `${APP_URL}/boat/regattas`,
        });
        break;

      case "crew_cancelled":
        await sendEmail(email, `${data.sailor_name} cancelled their spot on ${data.regatta_name}`, {
          label: "Crew Cancelled",
          heading: `${data.sailor_name} cancelled their spot`,
          body: `<p style="margin:0"><strong>${data.sailor_name}</strong> has cancelled their confirmed <strong>${data.position_role}</strong> spot on <strong>${data.regatta_name}</strong>. The position is now open again.</p>`,
          ctaText: "View Regatta",
          ctaUrl: `${APP_URL}/boat/regattas`,
        });
        break;

      default:
        return Response.json({ ok: false, error: "Unknown event" }, { status: 400 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Notify error:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
