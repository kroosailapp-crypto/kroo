import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/lib/supabase-admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kroofinder.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

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

    await transporter.sendMail({
      from: `"Kroo Pro" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `You've been invited to join ${team.name} on Kroo Pro`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <img src="${APP_URL}/kroo-finder.svg" alt="Kroo" style="height:24px;margin-bottom:24px;" />
          <h2 style="color:#02123e;font-size:20px;margin-bottom:8px;">You're invited!</h2>
          <p style="color:#444;font-size:15px;line-height:1.6;">
            <strong>${team.name}</strong> has invited you to join their team on Kroo Pro as <strong>${roleLabel}</strong>.
          </p>
          <a href="${inviteUrl}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#0161f0;color:#fff;border-radius:100px;text-decoration:none;font-size:14px;font-weight:600;">
            Accept invitation
          </a>
          <p style="color:#aaa;font-size:12px;margin-top:24px;">
            If you didn't expect this, you can ignore this email.
          </p>
        </div>
      `,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Pro invite error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
