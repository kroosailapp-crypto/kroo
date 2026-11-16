import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/lib/supabase-admin";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

export async function POST(request) {
  try {
    const { teamId, title, description } = await request.json();

    const { data: team } = await supabaseAdmin.from("pro_teams").select("name").eq("id", teamId).single();
    const { data: members } = await supabaseAdmin
      .from("pro_team_members")
      .select("email, user_id")
      .eq("team_id", teamId);

    if (!team || !members?.length) return Response.json({ ok: true });

    // Get emails for members who have user accounts
    const emails = members.map(m => m.email).filter(Boolean);

    await transporter.sendMail({
      from: `"${team.name}" <${process.env.GMAIL_USER}>`,
      bcc: emails,
      subject: `${team.name}: ${title}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <p style="font-size:12px;color:#aaa;margin-bottom:8px;">${team.name} · Kroo Pro</p>
          <h2 style="color:#02123e;font-size:18px;margin-bottom:8px;">${title}</h2>
          ${description ? `<p style="color:#444;font-size:15px;line-height:1.6;">${description}</p>` : ""}
          <hr style="border:none;border-top:1px solid #e8e8e8;margin:24px 0;" />
          <p style="color:#aaa;font-size:12px;">This alert was sent by your team manager via Kroo Pro.</p>
        </div>
      `,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Pro alert error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
