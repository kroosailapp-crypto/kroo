"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTeam } from "../layout";
import { IconPlus, IconX, IconCalendar, IconMapPin, IconChevronDown } from "@tabler/icons-react";

const EVENT_TYPES = ["meeting", "practice", "regatta"];
const TYPE_COLOR = { meeting: "#0161f0", practice: "#39e75f", regatta: "#02123e" };

function NewEventModal({ teamId, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("practice");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setError("");
    setLoading(true);
    const { data, error: err } = await supabase
      .from("pro_events")
      .insert({ team_id: teamId, name, event_type: type, date: date || null, location: location || null, description: description || null, website: website || null })
      .select()
      .single();
    if (err) { setError(err.message); setLoading(false); return; }

    // Create event chat channel
    await supabase.from("pro_chat_channels").insert({ team_id: teamId, name, type: "event", event_id: data.id });

    setLoading(false);
    onCreate?.(data);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md px-5 pt-6 pb-10 flex flex-col gap-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">New event</h3>
          <button onClick={onClose}><IconX size={20} className="text-gray-400" /></button>
        </div>

        <input placeholder="Event name" value={name} onChange={e => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none border bg-white" style={{ borderColor: "#e5e5e5" }} />

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Type</label>
          <div className="flex gap-2">
            {EVENT_TYPES.map(t => (
              <button key={t} onClick={() => setType(t)}
                className="flex-1 py-2 rounded-full text-xs font-semibold capitalize border"
                style={{ backgroundColor: type === t ? TYPE_COLOR[t] : "#fff", color: type === t ? "#fff" : "#555", borderColor: type === t ? TYPE_COLOR[t] : "#e5e5e5" }}
              >{t}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Date & time</label>
          <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none border bg-white" style={{ borderColor: "#e5e5e5" }} />
        </div>

        <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none border bg-white" style={{ borderColor: "#e5e5e5" }} />

        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows={3}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none border bg-white resize-none" style={{ borderColor: "#e5e5e5" }} />

        <input placeholder="Website (optional)" value={website} onChange={e => setWebsite(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none border bg-white" style={{ borderColor: "#e5e5e5" }} />

        {error && <p className="text-xs" style={{ color: "#e00" }}>{error}</p>}
        <button onClick={handleCreate} disabled={!name || loading}
          className="w-full py-3 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: !name || loading ? "#ccc" : "#0161f0" }}>
          {loading ? "Creating…" : "Create event"}
        </button>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { member } = useTeam();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(searchParams.get("new") === "1");
  const [filter, setFilter] = useState("upcoming");

  const isManager = member.role === "owner" || member.role === "manager";

  useEffect(() => {
    supabase.from("pro_events").select("*").eq("team_id", id).order("date", { ascending: true }).then(({ data }) => {
      setEvents(data || []);
      setLoading(false);
    });
  }, [id]);

  const now = new Date().toISOString();
  const filtered = events.filter(ev => {
    if (filter === "upcoming") return !ev.date || ev.date >= now;
    if (filter === "past") return ev.date && ev.date < now;
    if (filter === "regatta") return ev.event_type === "regatta";
    if (filter === "practice") return ev.event_type === "practice";
    if (filter === "meeting") return ev.event_type === "meeting";
    return true;
  });

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl">
      {showNew && isManager && (
        <NewEventModal teamId={id} onClose={() => setShowNew(false)} onCreate={ev => setEvents(es => [ev, ...es])} />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ color: "#02123e" }}>Schedule</h1>
        {isManager && (
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: "#0161f0" }}>
            <IconPlus size={16} /> New event
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {["upcoming","past","regatta","practice","meeting"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 capitalize"
            style={{ backgroundColor: filter === f ? "#0161f0" : "#fff", color: filter === f ? "#fff" : "#555", border: filter === f ? "none" : "1px solid #e5e5e5" }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0161f0", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(ev => (
            <Link key={ev.id} href={`/pro/team/${id}/events/${ev.id}`}
              className="bg-white rounded-xl p-4 border flex gap-3 hover:shadow-sm transition-shadow"
              style={{ borderColor: "#e5e5e5" }}>
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 text-white"
                style={{ backgroundColor: TYPE_COLOR[ev.event_type] || "#888" }}>
                <IconCalendar size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 truncate">{ev.name}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {ev.date && (
                    <p className="text-xs text-gray-400">
                      {new Date(ev.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                  {ev.location && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <IconMapPin size={12} />{ev.location}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs font-medium capitalize px-2 py-0.5 rounded-md h-fit flex-shrink-0 self-start mt-0.5"
                style={{ backgroundColor: `${TYPE_COLOR[ev.event_type]}15`, color: TYPE_COLOR[ev.event_type] }}>
                {ev.event_type}
              </span>
            </Link>
          ))}
          {filtered.length === 0 && <p className="text-sm text-gray-400 text-center py-12">No events found</p>}
        </div>
      )}
    </div>
  );
}
