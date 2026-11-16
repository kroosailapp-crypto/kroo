"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTeam } from "../layout";
import { IconPlus, IconX, IconBell, IconExternalLink } from "@tabler/icons-react";

function SendAlertModal({ teamId, userId, onClose, onSend }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setLoading(true);
    const { data } = await supabase.from("pro_alerts")
      .insert({ team_id: teamId, title, description: description || null, cta_label: ctaLabel || null, cta_url: ctaUrl || null, created_by: userId })
      .select().single();

    // Notify via API
    await fetch("/api/pro/alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, title, description }),
    });

    onSend(data);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md px-5 pt-6 pb-10 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Send alert</h3>
          <button onClick={onClose}><IconX size={20} className="text-gray-400" /></button>
        </div>
        <input placeholder="Title *" value={title} onChange={e => setTitle(e.target.value)} className="border rounded-xl px-4 py-3 text-sm outline-none" style={{ borderColor: "#e5e5e5" }} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="border rounded-xl px-4 py-3 text-sm outline-none resize-none" style={{ borderColor: "#e5e5e5" }} />
        <div className="border rounded-2xl p-4 flex flex-col gap-3" style={{ borderColor: "#e5e5e5" }}>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Call to action (optional)</p>
          <input placeholder="Button label, e.g. View schedule" value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} className="border rounded-xl px-4 py-2.5 text-sm outline-none" style={{ borderColor: "#e5e5e5" }} />
          <input placeholder="URL" value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} className="border rounded-xl px-4 py-2.5 text-sm outline-none" style={{ borderColor: "#e5e5e5" }} />
        </div>
        <button onClick={handleSend} disabled={!title || loading} className="w-full py-3 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: !title || loading ? "#ccc" : "#0161f0" }}>
          {loading ? "Sending…" : "Send to all members"}
        </button>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const { id } = useParams();
  const { member } = useTeam();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSend, setShowSend] = useState(false);
  const [userId, setUserId] = useState(null);

  const isManager = member.role === "owner" || member.role === "manager";

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id));
    supabase.from("pro_alerts").select("*").eq("team_id", id).order("created_at", { ascending: false }).then(({ data }) => {
      setAlerts(data || []);
      setLoading(false);
    });
  }, [id]);

  async function handleDelete(alertId) {
    await supabase.from("pro_alerts").delete().eq("id", alertId);
    setAlerts(as => as.filter(a => a.id !== alertId));
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl">
      {showSend && <SendAlertModal teamId={id} userId={userId} onClose={() => setShowSend(false)} onSend={alert => setAlerts(as => [alert, ...as])} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ color: "#02123e" }}>Alerts & reminders</h1>
        {isManager && (
          <button onClick={() => setShowSend(true)} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: "#0161f0" }}>
            <IconPlus size={16} /> Send alert
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0161f0", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-white rounded-xl p-4 border" style={{ borderColor: "#e5e5e5" }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#eff6ff" }}>
                  <IconBell size={16} style={{ color: "#0161f0" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{alert.title}</p>
                  {alert.description && <p className="text-sm text-gray-500 mt-1">{alert.description}</p>}
                  {alert.cta_label && alert.cta_url && (
                    <a href={alert.cta_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: "#0161f0" }}>
                      {alert.cta_label} <IconExternalLink size={12} />
                    </a>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(alert.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {isManager && (
                  <button onClick={() => handleDelete(alert.id)} className="flex-shrink-0">
                    <IconX size={16} className="text-gray-300 hover:text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {alerts.length === 0 && <p className="text-sm text-gray-400 text-center py-12">No alerts sent yet</p>}
        </div>
      )}
    </div>
  );
}
