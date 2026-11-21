import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

function buildEmailHtml(firstName: string): string {
  const name = firstName || "there";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Welcome to Kroo Finder</title>
</head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:32px 0">
  <tr><td align="center">
  <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden">

    <!-- Header -->
    <tr><td style="background:#123251 url('https://www.kroosail.com/patterns/windmap-hero.svg') repeat;background-size:1100px auto;padding:40px 48px">
      <img src="https://www.kroosail.com/logos/kroo-finder-white.png" alt="Kroo Finder" height="40" style="display:block">
      <div style="margin-top:20px;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#45B589">Welcome aboard</div>
    </td></tr>

    <!-- Greeting -->
    <tr><td style="padding:48px 48px 8px">
      <p style="margin:0 0 16px;font-size:18px;line-height:1.5;color:#123251;font-weight:700">Hi ${name},</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#3A424D">You're in. Kroo Finder connects boat owners with experienced crew, for day races, offshore regattas and everything in between.</p>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:#3A424D">You can set up a crew account, a boat account, or both. Create one first, then add the other. Finish your profile before you start browsing. Complete profiles get noticed first.</p>
      <a href="https://app.kroofinder.com/" style="display:inline-block;padding:14px 28px;border-radius:10px;background:#14764F;color:#FFFFFF;font-size:16px;font-weight:700;text-decoration:none">Open Kroo Finder</a>
    </td></tr>

    <!-- Get started cards -->
    <tr><td style="padding:40px 48px 8px">
      <div style="font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#565E69;margin-bottom:16px">Get started</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="background:#F4F7FA;border-radius:10px;padding:24px;vertical-align:top">
          <div style="font-weight:800;font-size:20px;color:#123251;margin-bottom:12px">Crew</div>
          <div style="font-size:15px;line-height:1.55;color:#3A424D">Build your sailor profile. Browse open crew positions. Save the ones you like and apply in seconds.</div>
        </td></tr>
        <tr><td height="12"></td></tr>
        <tr><td style="background:#F4F7FA;border-radius:10px;padding:24px;vertical-align:top">
          <div style="font-weight:800;font-size:20px;color:#123251;margin-bottom:12px">Boat owners</div>
          <div style="font-size:15px;line-height:1.55;color:#3A424D">List your boat. Set your requirements. Browse verified sailor profiles and message candidates directly.</div>
        </td></tr>
      </table>
    </td></tr>

    <!-- Tips -->
    <tr><td style="padding:40px 48px 48px">
      <div style="font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#14764F;margin-bottom:8px">Tips from the tutorial</div>
      <h2 style="margin:0 0 24px;font-weight:900;font-size:26px;line-height:1.1;color:#123251">Four ways to get results faster.</h2>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:20px 0;border-top:1px solid #DBE1E8">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="48" style="font-weight:700;font-size:18px;color:#14764F;vertical-align:top;font-family:monospace">01</td>
            <td style="vertical-align:top">
              <div style="font-size:16px;font-weight:800;color:#123251;margin-bottom:4px">Be specific about experience.</div>
              <div style="font-size:15px;line-height:1.55;color:#3A424D">Name the classes and positions you have sailed rather than saying "experienced."</div>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:20px 0;border-top:1px solid #DBE1E8">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="48" style="font-weight:700;font-size:18px;color:#14764F;vertical-align:top;font-family:monospace">02</td>
            <td style="vertical-align:top">
              <div style="font-size:16px;font-weight:800;color:#123251;margin-bottom:4px">Check the live feed often.</div>
              <div style="font-size:15px;line-height:1.55;color:#3A424D">Good crew positions fill quickly, especially before the season starts.</div>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:20px 0;border-top:1px solid #DBE1E8">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="48" style="font-weight:700;font-size:18px;color:#14764F;vertical-align:top;font-family:monospace">03</td>
            <td style="vertical-align:top">
              <div style="font-size:16px;font-weight:800;color:#123251;margin-bottom:4px">Owners: state requirements clearly.</div>
              <div style="font-size:15px;line-height:1.55;color:#3A424D">A clear list of position, experience and dates saves you reading unsuitable applications.</div>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:20px 0;border-top:1px solid #DBE1E8;border-bottom:1px solid #DBE1E8">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="48" style="font-weight:700;font-size:18px;color:#14764F;vertical-align:top;font-family:monospace">04</td>
            <td style="vertical-align:top">
              <div style="font-size:16px;font-weight:800;color:#123251;margin-bottom:4px">Use favorites.</div>
              <div style="font-size:15px;line-height:1.55;color:#3A424D">Save candidates and positions as you browse, then compare them in one pass.</div>
            </td>
          </tr></table>
        </td></tr>
      </table>
    </td></tr>

    <!-- CTA band -->
    <tr><td style="background:#123251 url('https://www.kroosail.com/patterns/windmap-hero.svg') repeat;background-size:1100px auto;padding:48px">
      <h2 style="margin:0 0 12px;font-weight:900;font-size:28px;line-height:1.1;color:#FFFFFF">Race day is ready.</h2>
      <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#DEEAFB">Finish your profile and see who is looking for you.</p>
      <a href="https://app.kroofinder.com/" style="display:inline-block;padding:14px 28px;border-radius:10px;background:#FFFFFF;color:#123251;font-size:16px;font-weight:700;text-decoration:none">Open Kroo Finder</a>
    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#F4F7FA;padding:32px 48px 40px">
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#3A424D">Fair winds,<br><strong style="color:#123251">The Kroo team</strong></p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#565E69">Kroo Finder · kroosail.com</p>
    </td></tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;
}

serve(async (req) => {
  try {
    const payload = await req.json();

    // Supabase auth webhook sends user data under record
    const user = payload?.record ?? payload?.user;
    if (!user?.email) {
      return new Response("No email found", { status: 400 });
    }

    const demoPatterns = ["@krooracing.demo", "@demo.kroopro.com", "@example.com", "@kroo-pro.vercel.app"];
    if (demoPatterns.some((p) => user.email.endsWith(p))) {
      return new Response("Skipped demo account", { status: 200 });
    }

    const firstName = user.user_metadata?.full_name?.split(" ")[0]
      ?? user.user_metadata?.name?.split(" ")[0]
      ?? "";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Kroo Finder <hello@updates.kroosail.com>",
        to: [user.email],
        subject: "Welcome to Kroo Finder",
        html: buildEmailHtml(firstName),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return new Response("Email send failed", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("Internal error", { status: 500 });
  }
});
