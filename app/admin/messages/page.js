"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function AdminMessagesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [token, setToken] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [target, setTarget] = useState("crew");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null); // { count }

  useEffect(() => {
    if (!user) return;
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      const t = session?.access_token;
      setToken(t);
      const { data: isAdmin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
      if (!isAdmin) { router.push("/"); return; }
      setAuthorized(true);
    }
    init();
  }, [user]);

  async function handleSend() {
    if (!message.trim() || sending) return;
    if (!confirm(`Send this message to all ${target} users?`)) return;
    setSending(true);
    const res = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ target, message: message.trim(), senderId: user.id }),
    });
    const data = await res.json();
    setSending(false);
    if (data.ok) {
      setSent({ count: data.sent });
      setMessage("");
    }
  }

  if (!authorized) return <div className="flex items-center justify-center min-h-screen"><p className="text-sm text-gray-400">Loading…</p></div>;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "#e8e8e8" }}>
        <Link href="/admin"><IconArrowLeft size={22} color="#111" /></Link>
        <p className="text-sm font-semibold text-gray-900 flex-1">Message Center</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">
        {sent && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ backgroundColor: "#f0fdf4" }}>
            <IconCheck size={18} color="#22c55e" />
            <p className="text-sm text-green-700 font-medium">Message sent to {sent.count} users.</p>
          </div>
        )}

        {/* Target selector */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Send to</p>
          <div className="flex gap-3">
            {["crew", "boats"].map((t) => (
              <button
                key={t}
                onClick={() => { setTarget(t); setSent(null); }}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold border"
                style={{
                  backgroundColor: target === t ? "#0161F0" : "#fff",
                  color: target === t ? "#fff" : "#666",
                  borderColor: target === t ? "#0161F0" : "#e0e0e0",
                }}
              >
                All {t === "crew" ? "Crew" : "Boat"} Users
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-gray-400">Message</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Write a message to all ${target} users…`}
            rows={8}
            className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400 resize-none"
            style={{ borderColor: "#e0e0e0" }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="w-full py-3.5 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: message.trim() && !sending ? "#0161F0" : "#c0c0c0" }}
        >
          {sending ? "Sending…" : `Send to All ${target === "crew" ? "Crew" : "Boat"} Users`}
        </button>

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          This message will appear in each user's inbox as a direct message from your account.
        </p>
      </div>
    </div>
  );
}
