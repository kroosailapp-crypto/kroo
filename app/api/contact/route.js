import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, subject, message } = await request.json();

  if (!subject?.trim() || !message?.trim()) {
    return Response.json({ error: "Subject and message are required." }, { status: 400 });
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
    subject: `[Kroo Contact] ${subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #0161F0;">New Contact Message</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #888; width: 100px;">Name</td>
            <td style="padding: 8px 0; font-weight: 600;">${name || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Email</td>
            <td style="padding: 8px 0;">${email || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Subject</td>
            <td style="padding: 8px 0; font-weight: 600;">${subject}</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e8e8e8; margin: 16px 0;" />
        <p style="color: #333; white-space: pre-wrap; line-height: 1.6;">${message}</p>
      </div>
    `,
  });

  return Response.json({ ok: true });
}
