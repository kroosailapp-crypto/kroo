import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/lib/supabase-admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kroofinder.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

export async function POST(request) {
  try {
    const { teamId, surveyId } = await request.json();

    const { data: team } = await supabaseAdmin.from("pro_teams").select("name").eq("id", teamId).single();
    const { data: survey } = await supabaseAdmin.from("pro_surveys").select("title").eq("id", surveyId).single();
    const { data: members } = await supabaseAdmin.from("pro_team_members").select("email").eq("team_id", teamId);

    if (!team || !survey || !members?.length) return Response.json({ ok: true });

    const surveyUrl = `${APP_URL}/pro/team/${teamId}/surveys`;
    const emails = members.map(m => m.email).filter(Boolean);

    await transporter.sendMail({
      from: `"${team.name}" <${process.env.GMAIL_USER}>`,
      bcc: emails,
      subject: `New survey from ${team.name}: ${survey.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <p style="font-size:12px;color:#aaa;margin-bottom:8px;">${team.name} · Kroo Pro</p>
          <h2 style="color:#02123e;font-size:18px;margin-bottom:8px;">New survey: ${survey.title}</h2>
          <p style="color:#444;font-size:15px;line-height:1.6;">Your team manager has sent a new survey. It only takes a moment to complete.</p>
          <a href="${surveyUrl}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#0161f0;color:#fff;border-radius:100px;text-decoration:none;font-size:14px;font-weight:600;">
            Take the survey
          </a>
          <hr style="border:none;border-top:1px solid #e8e8e8;margin:24px 0;" />
          <p style="color:#aaa;font-size:12px;">Sent via Kroo Pro by ${team.name}.</p>
        </div>
      `,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Pro survey notify error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
