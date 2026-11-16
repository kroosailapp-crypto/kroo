import nodemailer from "nodemailer";
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
    const host = "https://api.push.apple.com";
    const url = `${host}/3/device/${row.token}`;

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
    // Push failure is non-fatal — email still goes out
  }
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kroofinder.com";

function emailHtml(title, body) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <img src="${APP_URL}/kroo-finder.svg" alt="Kroo" style="height:24px;margin-bottom:24px;" />
      <h2 style="color:#111;font-size:18px;margin-bottom:8px;">${title}</h2>
      <div style="color:#444;font-size:15px;line-height:1.6;">${body}</div>
      <hr style="border:none;border-top:1px solid #e8e8e8;margin:24px 0;" />
      <p style="color:#aaa;font-size:12px;">You're receiving this because you have notifications enabled in Kroo. <a href="${APP_URL}/notifications" style="color:#0161F0;">Manage notifications</a></p>
    </div>
  `;
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

    // Check if this notification type is enabled (default true if not set)
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

    let subject, html;

    switch (event) {
      case "new_message":
        subject = `New message from ${data.sender_name}`;
        html = emailHtml(
          `💬 New message from ${data.sender_name}`,
          `<p>${data.sender_name} sent you a message:</p>
           <blockquote style="border-left:3px solid #0161F0;padding-left:12px;color:#555;margin:12px 0;">${data.message_preview}</blockquote>
           <a href="${APP_URL}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#0161F0;color:#fff;border-radius:20px;text-decoration:none;font-size:14px;">Reply</a>`
        );
        sendPush(recipient_id, `New message from ${data.sender_name}`, data.message_preview);
        break;

      case "new_invite":
        subject = `You've been invited to race on ${data.boat_name}`;
        html = emailHtml(
          `⛵ New Regatta Invite`,
          `<p><strong>${data.boat_name}</strong> has invited you to sail as <strong>${data.position_role}</strong> at <strong>${data.regatta_name}</strong>.</p>
           <a href="${APP_URL}/crew/regattas" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#0161F0;color:#fff;border-radius:20px;text-decoration:none;font-size:14px;">View Invite</a>`
        );
        sendPush(recipient_id, `Sail Invite from ${data.boat_name}`, `You've been invited to sail at ${data.regatta_name}`);
        break;

      case "regatta_confirmation":
        subject = `You've been confirmed for ${data.regatta_name}!`;
        html = emailHtml(
          `✅ Regatta Confirmed`,
          `<p>Congratulations! <strong>${data.boat_name}</strong> has confirmed you as <strong>${data.position_role}</strong> for <strong>${data.regatta_name}</strong>.</p>
           <a href="${APP_URL}/crew/regattas" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#0161F0;color:#fff;border-radius:20px;text-decoration:none;font-size:14px;">View Details</a>`
        );
        break;

      case "regatta_cancelled":
        subject = `${data.regatta_name} has been cancelled`;
        html = emailHtml(
          `❌ Regatta Cancelled`,
          `<p>Unfortunately, <strong>${data.regatta_name}</strong> hosted by <strong>${data.boat_name}</strong> has been cancelled.</p>
           <a href="${APP_URL}/crew/feed" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#0161F0;color:#fff;border-radius:20px;text-decoration:none;font-size:14px;">Browse Other Boats</a>`
        );
        break;

      case "new_application":
        subject = `New application from ${data.sailor_name}`;
        html = emailHtml(
          `🙋 New Crew Application`,
          `<p><strong>${data.sailor_name}</strong> has applied for the <strong>${data.position_role}</strong> position on <strong>${data.regatta_name}</strong>.</p>
           <a href="${APP_URL}/boat/regattas" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#0161F0;color:#fff;border-radius:20px;text-decoration:none;font-size:14px;">Review Application</a>`
        );
        break;

      case "crew_cancelled":
        subject = `${data.sailor_name} cancelled their spot on ${data.regatta_name}`;
        html = emailHtml(
          `⚠️ Crew Cancelled`,
          `<p><strong>${data.sailor_name}</strong> has cancelled their confirmed <strong>${data.position_role}</strong> spot on <strong>${data.regatta_name}</strong>. The position is now open again.</p>
           <a href="${APP_URL}/boat/regattas" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#0161F0;color:#fff;border-radius:20px;text-decoration:none;font-size:14px;">View Regatta</a>`
        );
        break;

      default:
        return Response.json({ ok: false, error: "Unknown event" }, { status: 400 });
    }

    await transporter.sendMail({
      from: `"Kroo" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Notify error:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
