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

// Everything that goes into an email is escaped: names and message text are
// written by users.
function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
// Subjects are plain text; just keep them on one line.
const oneLine = (v) => String(v ?? "").replace(/[\r\n]+/g, " ").slice(0, 150);

async function getEmail(userId) {
  const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
  return user?.email || null;
}

async function getPrefs(userId, profileType) {
  const table = profileType === "boat" ? "boat_profiles" : "crew_profiles";
  const { data } = await supabaseAdmin.from(table).select("notification_prefs").eq("id", userId).maybeSingle();
  return data?.notification_prefs || {};
}

async function isRestricted(userId) {
  const { data } = await supabaseAdmin.from("user_suspensions").select("user_id").eq("user_id", userId).maybeSingle();
  return !!data;
}

async function boatName(id) {
  const { data } = await supabaseAdmin.from("boat_profiles").select("boat_name, skipper_name").eq("id", id).maybeSingle();
  return data ? data.boat_name || data.skipper_name || "A boat" : null;
}

async function crewName(id) {
  const { data } = await supabaseAdmin.from("crew_profiles").select("name").eq("id", id).maybeSingle();
  return data ? data.name || "A sailor" : null;
}

class Reject extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

const HOUR = 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const need = (v) => {
  if (typeof v !== "string" || !UUID.test(v)) throw new Reject("Invalid id");
  return v;
};

// Work out WHO gets WHICH email from the database, never from the request.
// The request only says what happened (and points at the row); we verify that
// the caller really did it, so nobody can use this endpoint to email people
// arbitrary text. Returns a list of jobs: {recipientId, profileType, prefKey,
// key (de-duplication), subject, mail, push}.
async function resolveJobs(event, caller, body) {
  switch (event) {
    case "new_message": {
      const recipientId = need(body.recipient_id);
      const profileType = body.profile_type === "boat" ? "boat" : "crew";
      if (recipientId === caller.id) throw new Reject("Invalid recipient");
      // The sender must have just written to the recipient. The preview is
      // taken from that stored message.
      const { data: msg } = await supabaseAdmin
        .from("messages")
        .select("content, created_at")
        .eq("sender_id", caller.id)
        .eq("receiver_id", recipientId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!msg || Date.now() - new Date(msg.created_at).getTime() > 5 * 60 * 1000) throw new Reject("No recent message");
      // A boat writes to a sailor and a sailor writes to a boat
      const sender = profileType === "crew" ? await boatName(caller.id) : await crewName(caller.id);
      if (!sender) throw new Reject("No sender profile");
      const preview = msg.content.slice(0, 200);
      return [{
        recipientId, profileType, prefKey: "new_message",
        key: `new_message:${caller.id}`, // one email per sender per hour
        subject: `New message from ${oneLine(sender)}`,
        mail: {
          label: "New Message",
          heading: `${esc(sender)} sent you a message`,
          body: `<blockquote style="border-left:3px solid #14764F;padding-left:16px;color:#565E69;margin:0 0 16px;font-style:italic">${esc(preview)}</blockquote>`,
          ctaText: "Reply", ctaUrl: APP_URL,
        },
        push: [`New message from ${sender}`, preview],
      }];
    }

    case "new_invite":
    case "race_invite": { // "race_invite" was the old name used by the Favorites page
      const recipientId = need(body.recipient_id);
      const position_id = need(body.position_id);
      const { data: inv } = await supabaseAdmin
        .from("invitations")
        .select("id, role, regattas(name, boat_id)")
        .eq("position_id", position_id)
        .eq("crew_id", recipientId)
        .eq("initiated_by", "boat")
        .eq("status", "pending")
        .maybeSingle();
      if (!inv || inv.regattas?.boat_id !== caller.id) throw new Reject("No such invitation");
      const boat = (await boatName(caller.id)) || "A boat";
      return [{
        recipientId, profileType: "crew", prefKey: "new_invite",
        key: `new_invite:${position_id}`,
        subject: `You've been invited to race on ${oneLine(boat)}`,
        mail: {
          label: "Regatta Invite",
          heading: `Invite to sail on ${esc(boat)}`,
          body: `<p style="margin:0"><strong>${esc(boat)}</strong> has invited you to sail as <strong>${esc(inv.role)}</strong> at <strong>${esc(inv.regattas.name)}</strong>.</p>`,
          ctaText: "View Invite", ctaUrl: `${APP_URL}/crew/regattas`,
        },
        push: [`Sail Invite from ${boat}`, `You've been invited to sail at ${inv.regattas.name}`],
      }];
    }

    case "regatta_confirmation": {
      const { data: inv } = await supabaseAdmin
        .from("invitations")
        .select("id, crew_id, role, status, regattas(name, boat_id)")
        .eq("id", need(body.invitation_id))
        .maybeSingle();
      if (!inv || inv.status !== "accepted" || inv.regattas?.boat_id !== caller.id) throw new Reject("No such confirmation");
      const boat = (await boatName(caller.id)) || "The boat";
      return [{
        recipientId: inv.crew_id, profileType: "crew", prefKey: "regatta_confirmation",
        key: `regatta_confirmation:${inv.id}`,
        subject: `You've been confirmed for ${oneLine(inv.regattas.name)}!`,
        mail: {
          label: "Confirmed",
          heading: `You're on the crew for ${esc(inv.regattas.name)}`,
          body: `<p style="margin:0"><strong>${esc(boat)}</strong> has confirmed you as <strong>${esc(inv.role)}</strong> for <strong>${esc(inv.regattas.name)}</strong>. Fair winds!</p>`,
          ctaText: "View Details", ctaUrl: `${APP_URL}/crew/regattas`,
        },
      }];
    }

    case "regatta_cancelled": {
      // Called just BEFORE the regatta is deleted, so the confirmed crew can
      // still be looked up here.
      const { data: regatta } = await supabaseAdmin
        .from("regattas")
        .select("id, name, boat_id, invitations(crew_id, status)")
        .eq("id", need(body.regatta_id))
        .maybeSingle();
      if (!regatta || regatta.boat_id !== caller.id) throw new Reject("No such regatta");
      const boat = (await boatName(caller.id)) || "The boat";
      return (regatta.invitations || [])
        .filter((i) => i.status === "accepted")
        .map((i) => ({
          recipientId: i.crew_id, profileType: "crew", prefKey: "regatta_cancelled",
          key: `regatta_cancelled:${regatta.id}`,
          subject: `${oneLine(regatta.name)} has been cancelled`,
          mail: {
            label: "Regatta Cancelled",
            heading: `${esc(regatta.name)} has been cancelled`,
            body: `<p style="margin:0">Unfortunately, <strong>${esc(regatta.name)}</strong> hosted by <strong>${esc(boat)}</strong> has been cancelled.</p>`,
            ctaText: "Browse Other Boats", ctaUrl: `${APP_URL}/crew/feed`,
          },
        }));
    }

    case "new_application": {
      const { data: inv } = await supabaseAdmin
        .from("invitations")
        .select("id, role, status, regattas(name, boat_id)")
        .eq("position_id", need(body.position_id))
        .eq("crew_id", caller.id)
        .maybeSingle();
      if (!inv || !["applied", "accepted"].includes(inv.status) || !inv.regattas) throw new Reject("No such application");
      const sailor = (await crewName(caller.id)) || "A sailor";
      return [{
        recipientId: inv.regattas.boat_id, profileType: "boat", prefKey: "new_application",
        key: `new_application:${body.position_id}:${caller.id}`,
        subject: `New application from ${oneLine(sailor)}`,
        mail: {
          label: "New Application",
          heading: `${esc(sailor)} applied for ${esc(inv.role)}`,
          body: `<p style="margin:0"><strong>${esc(sailor)}</strong> has applied for the <strong>${esc(inv.role)}</strong> position on <strong>${esc(inv.regattas.name)}</strong>.</p>`,
          ctaText: "Review Application", ctaUrl: `${APP_URL}/boat/regattas`,
        },
      }];
    }

    case "crew_cancelled": {
      const { data: inv } = await supabaseAdmin
        .from("invitations")
        .select("id, role, status, crew_id, regattas(name, boat_id)")
        .eq("id", need(body.invitation_id))
        .maybeSingle();
      if (!inv || inv.crew_id !== caller.id || inv.status !== "cancelled" || !inv.regattas) throw new Reject("No such cancellation");
      const sailor = (await crewName(caller.id)) || "A sailor";
      return [{
        recipientId: inv.regattas.boat_id, profileType: "boat", prefKey: "crew_cancelled",
        key: `crew_cancelled:${inv.id}`,
        subject: `${oneLine(sailor)} cancelled their spot on ${oneLine(inv.regattas.name)}`,
        mail: {
          label: "Crew Cancelled",
          heading: `${esc(sailor)} cancelled their spot`,
          body: `<p style="margin:0"><strong>${esc(sailor)}</strong> has cancelled their confirmed <strong>${esc(inv.role)}</strong> spot on <strong>${esc(inv.regattas.name)}</strong>. The position is now open again.</p>`,
          ctaText: "View Regatta", ctaUrl: `${APP_URL}/boat/regattas`,
        },
      }];
    }

    default:
      throw new Reject("Unknown event");
  }
}

// Returns "sent" | "skipped" for one recipient.
async function deliver(job) {
  const { recipientId, profileType, prefKey, key } = job;
  if (!recipientId || (await isRestricted(recipientId))) return "skipped";

  const prefs = await getPrefs(recipientId, profileType);
  if (prefs[prefKey] === false) return "skipped";

  const email = await getEmail(recipientId);
  if (!email) return "skipped";

  // De-duplicate: the same thing (same sender / invitation / position) is only
  // emailed once an hour. The slot is claimed first so double-clicks can't send
  // two, and released again if the send fails so it isn't used up for nothing.
  const { data: cooldown } = await supabaseAdmin
    .from("notification_cooldowns")
    .select("last_sent_at")
    .eq("recipient_id", recipientId)
    .eq("event", key)
    .maybeSingle();
  if (cooldown && Date.now() - new Date(cooldown.last_sent_at).getTime() < HOUR) return "skipped";
  await supabaseAdmin.from("notification_cooldowns").upsert({ recipient_id: recipientId, event: key, last_sent_at: new Date().toISOString() });

  try {
    await sendEmail(email, job.subject, job.mail);
  } catch (err) {
    await supabaseAdmin.from("notification_cooldowns").delete().eq("recipient_id", recipientId).eq("event", key);
    throw err;
  }
  if (job.push) sendPush(recipientId, job.push[0], job.push[1]);
  return "sent";
}

export async function POST(request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
    if (!caller) return Response.json({ error: "Unauthorized" }, { status: 401 });
    // Suspended and banned accounts can't trigger emails to anyone
    if (await isRestricted(caller.id)) return Response.json({ error: "Account restricted" }, { status: 403 });

    const body = await request.json();
    const jobs = await resolveJobs(body.event, caller, body);

    let sent = 0;
    let failed = 0;
    for (const job of jobs) {
      try {
        if ((await deliver(job)) === "sent") sent++;
      } catch (err) {
        failed++;
        console.error("Notify send error:", err);
      }
    }
    return Response.json({ ok: failed === 0, sent, skipped: jobs.length - sent - failed });
  } catch (err) {
    if (err instanceof Reject) return Response.json({ ok: false, error: err.message }, { status: err.status });
    console.error("Notify error:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
