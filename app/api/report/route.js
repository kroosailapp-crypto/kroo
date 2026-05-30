import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { reported_id, reported_name, profile_type, reason } = await request.json();

  if (!reported_id || !reason?.trim()) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Kroo App" <${process.env.GMAIL_USER}>`,
    to: "kroosailapp@gmail.com",
    subject: `[Kroo Report] ${profile_type === "crew" ? "Sailor" : "Boat"}: ${reported_name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #e53e3e;">User Report</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #888; width: 140px;">Reported by</td>
            <td style="padding: 8px 0; font-weight: 600;">${user.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Reporter ID</td>
            <td style="padding: 8px 0;">${user.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Reported user</td>
            <td style="padding: 8px 0; font-weight: 600;">${reported_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Reported ID</td>
            <td style="padding: 8px 0;">${reported_id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Profile type</td>
            <td style="padding: 8px 0;">${profile_type}</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e8e8e8; margin: 16px 0;" />
        <p style="color: #888; font-size: 12px; margin-bottom: 4px;">Reason</p>
        <p style="color: #333; white-space: pre-wrap; line-height: 1.6;">${reason}</p>
      </div>
    `,
  });

  return Response.json({ ok: true });
}
