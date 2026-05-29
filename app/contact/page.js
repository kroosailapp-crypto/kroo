"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setError("");

    // Get user's name and email
    let name = "";
    let email = user?.email || "";
    if (user) {
      const { data: crew } = await supabase
        .from("crew_profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();
      const { data: boat } = await supabase
        .from("boat_profiles")
        .select("skipper_name")
        .eq("id", user.id)
        .maybeSingle();
      name = crew?.name || boat?.skipper_name || "";
    }

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject: subject.trim(), message: message.trim() }),
    });

    setSending(false);
    if (res.ok) {
      setSent(true);
    } else {
      setError("Something went wrong. Please try again.");
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center px-8 gap-4">
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 56, height: 56, backgroundColor: "#111" }}
        >
          <IconCheck size={24} color="white" strokeWidth={2.5} />
        </div>
        <p className="text-base font-semibold text-gray-900 text-center">Message sent!</p>
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          We'll get back to you as soon as possible.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: "#0161F0" }}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "#e8e8e8" }}>
        <button onClick={() => router.back()}>
          <IconArrowLeft size={22} color="#111" />
        </button>
        <p className="text-sm font-semibold text-gray-900">Contact Us</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">
        {/* Subject */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-gray-400">Subject</p>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What's this about?"
            className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400"
            style={{ borderColor: "#e0e0e0" }}
          />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-gray-400">Message</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us how we can help…"
            rows={8}
            className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400 resize-none"
            style={{ borderColor: "#e0e0e0" }}
          />
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <button
          onClick={handleSend}
          disabled={!subject.trim() || !message.trim() || sending}
          className="w-full py-3.5 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: subject.trim() && message.trim() && !sending ? "#0161F0" : "#c0c0c0" }}
        >
          {sending ? "Sending…" : "Send Message"}
        </button>
      </div>
    </div>
  );
}
