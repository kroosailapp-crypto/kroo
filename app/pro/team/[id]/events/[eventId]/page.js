"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTeam } from "../../layout";
import {
  IconArrowLeft, IconCalendar, IconMapPin, IconLink, IconPlus,
  IconX, IconPaperclip, IconSailboat, IconUserPlus, IconTrash,
} from "@tabler/icons-react";

const TYPE_COLOR = { meeting: "#0161f0", practice: "#39e75f", regatta: "#02123e" };

export default function EventDetailPage() {
  const { id, eventId } = useParams();
  const router = useRouter();
  const { member } = useTeam();
  const [event, setEvent] = useState(null);
  const [docs, setDocs] = useState([]);
  const [sails, setSails] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSail, setNewSail] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);

  const isManager = member.role === "owner" || member.role === "manager";

  useEffect(() => {
    async function load() {
      const [
        { data: ev },
        { data: d },
        { data: s },
        { data: em },
        { data: am },
      ] = await Promise.all([
        supabase.from("pro_events").select("*").eq("id", eventId).single(),
        supabase.from("pro_event_documents").select("*").eq("event_id", eventId),
        supabase.from("pro_event_sails").select("*").eq("event_id", eventId),
        supabase.from("pro_event_members").select("*, pro_team_members(name, email, photo_url, position, role)").eq("event_id", eventId),
        supabase.from("pro_team_members").select("*").eq("team_id", id),
      ]);
      setEvent(ev);
      setDocs(d || []);
      setSails(s || []);
      setAssignedMembers(em || []);
      setAllMembers(am || []);
      setLoading(false);
    }
    load();
  }, [eventId]);

  async function handleAddSail() {
    if (!newSail.trim()) return;
    const { data } = await supabase.from("pro_event_sails").insert({ event_id: eventId, name: newSail.trim() }).select().single();
    setSails(s => [...s, data]);
    setNewSail("");
  }

  async function handleRemoveSail(sailId) {
    await supabase.from("pro_event_sails").delete().eq("id", sailId);
    setSails(s => s.filter(x => x.id !== sailId));
  }

  async function handleAddMember(memberId) {
    const { data } = await supabase
      .from("pro_event_members")
      .insert({ event_id: eventId, member_id: memberId })
      .select("*, pro_team_members(name, email, photo_url, position, role)")
      .single();
    setAssignedMembers(ms => [...ms, data]);
    setShowAddMember(false);
  }

  async function handleWithdraw() {
    const myMember = allMembers.find(m => m.user_id === member.user_id);
    if (!myMember) return;
    await supabase.from("pro_event_members").update({ status: "withdrawn" }).eq("event_id", eventId).eq("member_id", myMember.id);
    router.push(`/pro/team/${id}/events`);
  }

  async function handleDocUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    const type = ext === "pdf" ? "pdf" : ["jpg","jpeg","png","gif","webp"].includes(ext) ? "image" : "video";
    const path = `pro-events/${eventId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("profiles").upload(path, file);
    if (error) return;
    const { data: urlData } = supabase.storage.from("profiles").getPublicUrl(path);
    const { data } = await supabase.from("pro_event_documents").insert({ event_id: eventId, name: file.name, url: urlData.publicUrl, type }).select().single();
    setDocs(d => [...d, data]);
  }

  async function handleDeleteEvent() {
    if (!confirm("Delete this event?")) return;
    await supabase.from("pro_events").delete().eq("id", eventId);
    router.push(`/pro/team/${id}/events`);
  }

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0161f0", borderTopColor: "transparent" }} />
    </div>
  );

  if (!event) return <div className="px-4 py-6"><p className="text-gray-400">Event not found.</p></div>;

  const assignedIds = new Set(assignedMembers.map(m => m.member_id));
  const unassigned = allMembers.filter(m => !assignedIds.has(m.id));

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/pro/team/${id}/events`} className="text-gray-400 hover:text-gray-600">
          <IconArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate" style={{ color: "#02123e" }}>{event.name}</h1>
          <span className="text-xs font-medium capitalize px-2 py-0.5 rounded-md" style={{ backgroundColor: `${TYPE_COLOR[event.event_type]}15`, color: TYPE_COLOR[event.event_type] }}>{event.event_type}</span>
        </div>
        {isManager && (
          <button onClick={handleDeleteEvent} className="p-2 rounded-xl" style={{ backgroundColor: "#fee2e2" }}>
            <IconTrash size={16} style={{ color: "#ef4444" }} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 mb-6 text-sm text-gray-600">
        {event.date && (
          <div className="flex items-center gap-2">
            <IconCalendar size={16} className="text-gray-400" />
            {new Date(event.date).toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
        {event.location && <div className="flex items-center gap-2"><IconMapPin size={16} className="text-gray-400" />{event.location}</div>}
        {event.website && (
          <a href={event.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2" style={{ color: "#0161f0" }}>
            <IconLink size={16} />{event.website}
          </a>
        )}
      </div>

      {event.description && (
        <p className="text-sm text-gray-600 bg-white rounded-xl p-4 border mb-6" style={{ borderColor: "#e5e5e5" }}>{event.description}</p>
      )}

      {/* Sections */}
      <div className="flex flex-col gap-6">
        {/* Sail inventory */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><IconSailboat size={18} />Sail inventory</h2>
          </div>
          <div className="flex flex-col gap-2">
            {sails.map(s => (
              <div key={s.id} className="bg-white rounded-xl px-4 py-2.5 border flex items-center justify-between" style={{ borderColor: "#e5e5e5" }}>
                <span className="text-sm text-gray-800">{s.name}</span>
                {isManager && <button onClick={() => handleRemoveSail(s.id)}><IconX size={16} className="text-gray-400" /></button>}
              </div>
            ))}
            {isManager && (
              <div className="flex gap-2">
                <input value={newSail} onChange={e => setNewSail(e.target.value)} placeholder="Add sail…" onKeyDown={e => e.key === "Enter" && handleAddSail()}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border bg-white" style={{ borderColor: "#e5e5e5" }} />
                <button onClick={handleAddSail} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#0161f0" }}>Add</button>
              </div>
            )}
          </div>
        </section>

        {/* Assigned sailors */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Sailors ({assignedMembers.length})</h2>
            {isManager && (
              <button onClick={() => setShowAddMember(v => !v)} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#0161f0" }}>
                <IconUserPlus size={14} /> Add
              </button>
            )}
          </div>
          {showAddMember && (
            <div className="bg-white rounded-xl border mb-3 max-h-48 overflow-y-auto" style={{ borderColor: "#e5e5e5" }}>
              {unassigned.map(m => (
                <button key={m.id} onClick={() => handleAddMember(m.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left border-b last:border-0" style={{ borderColor: "#f0f0f0" }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#0161f0" }}>{(m.name || m.email)[0].toUpperCase()}</div>
                  <span className="text-sm text-gray-800">{m.name || m.email}</span>
                  <span className="ml-auto text-xs text-gray-400 capitalize">{m.role.replace("_"," ")}</span>
                </button>
              ))}
              {unassigned.length === 0 && <p className="text-sm text-gray-400 p-4">All members added</p>}
            </div>
          )}
          <div className="flex flex-col gap-2">
            {assignedMembers.map(em => {
              const m = em.pro_team_members;
              return (
                <div key={em.id} className="bg-white rounded-xl px-4 py-2.5 border flex items-center gap-3" style={{ borderColor: "#e5e5e5" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#0161f0" }}>
                    {(m?.name || m?.email || "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m?.name || m?.email}</p>
                    <p className="text-xs text-gray-400">{m?.position || ""}</p>
                  </div>
                  <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-md ${em.status === "withdrawn" ? "line-through" : ""}`}
                    style={{ backgroundColor: em.status === "confirmed" ? "#dcfce7" : em.status === "withdrawn" ? "#f0f0f0" : "#eff6ff", color: em.status === "confirmed" ? "#166534" : em.status === "withdrawn" ? "#aaa" : "#1d4ed8" }}>
                    {em.status}
                  </span>
                </div>
              );
            })}
            {assignedMembers.length === 0 && <p className="text-sm text-gray-400">No sailors assigned yet</p>}
          </div>
          {!isManager && (
            <button onClick={handleWithdraw} className="mt-3 text-sm font-medium" style={{ color: "#ef4444" }}>
              Withdraw from event
            </button>
          )}
        </section>

        {/* Documents */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><IconPaperclip size={18} />Documents</h2>
            {isManager && (
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer" style={{ color: "#0161f0" }}>
                <IconPlus size={14} /> Attach
                <input type="file" accept="image/*,video/*,.pdf" className="hidden" onChange={handleDocUpload} />
              </label>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {docs.map(doc => (
              <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-xl px-4 py-2.5 border flex items-center gap-3 hover:shadow-sm transition-shadow" style={{ borderColor: "#e5e5e5" }}>
                <span className="text-lg">{doc.type === "pdf" ? "📄" : doc.type === "image" ? "🖼️" : "🎥"}</span>
                <span className="text-sm text-gray-800 truncate">{doc.name}</span>
              </a>
            ))}
            {docs.length === 0 && <p className="text-sm text-gray-400">No documents attached</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
