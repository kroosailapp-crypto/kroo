"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import { IconSearch, IconX, IconUser, IconStar, IconSend } from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { notify } from "@/lib/notify";
import { MessageLink, MessageHint } from "@/app/components/MessageLink";

function formatRegattaDate(str) {
  if (!str) return "";
  const [m, d, y] = str.split("/");
  if (!m || !d || !y) return str;
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${months[parseInt(m,10)-1] || m} ${parseInt(d,10)}, ${y}`;
}

function RaceInviteModal({ crew, regattas, onClose }) {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!selectedPosition || !crew) return;
    setSending(true);
    const existing = await supabase
      .from("invitations")
      .select("id")
      .eq("regatta_id", selectedPosition.regattaId)
      .eq("position_id", selectedPosition.id)
      .eq("crew_id", crew.id)
      .maybeSingle();

    if (!existing.data) {
      await supabase.from("invitations").insert({
        regatta_id: selectedPosition.regattaId,
        position_id: selectedPosition.id,
        crew_id: crew.id,
        status: "pending",
        seen_by_boat: true,
      });
      notify({
        event: "race_invite",
        recipient_id: crew.id,
        profile_type: "crew",
        regatta_name: selectedPosition.regattaName,
        position_role: selectedPosition.role,
      });
    }
    setSending(false);
    setSent(true);
  }

  const openPositions = regattas.flatMap((r) =>
    (r.regatta_positions || [])
      .filter((p) => p.status === "open")
      .map((p) => ({ ...p, regattaId: r.id, regattaName: r.name, regattaDate: r.date }))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-[430px] px-5 pt-5 pb-10 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-gray-900">Race Invite</p>
            {crew && <p className="text-sm text-gray-400 mt-0.5">Invite {crew.name} to a regatta</p>}
          </div>
          <button onClick={onClose}><IconX size={18} color="#999" /></button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, backgroundColor: "#e8f5e9" }}>
              <IconSend size={24} color="#2e7d32" />
            </div>
            <p className="text-base font-semibold text-gray-900">Invite sent!</p>
            <p className="text-sm text-gray-400 text-center">
              {crew?.name} has been invited to {selectedPosition?.regattaName} as {selectedPosition?.role}.
            </p>
            <button onClick={onClose} className="mt-2 w-full py-3.5 rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: "#0161F0" }}>
              Done
            </button>
          </div>
        ) : openPositions.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <p className="text-sm text-gray-400 text-center">No open positions across your regattas.</p>
            <Link href="/boat/regattas/new" onClick={onClose} className="text-sm font-semibold" style={{ color: "#0161F0" }}>
              Add a regatta →
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {openPositions.map((pos) => {
                const isSelected = selectedPosition?.id === pos.id && selectedPosition?.regattaId === pos.regattaId;
                return (
                  <button key={`${pos.regattaId}-${pos.id}`} onClick={() => setSelectedPosition(pos)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left border"
                    style={{ borderColor: isSelected ? "#0161F0" : "#e8e8e8", backgroundColor: isSelected ? "#f0f4ff" : "#fff" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-gray-900 truncate">{pos.regattaName}</p>
                      {pos.regattaDate && <p className="text-[12px] text-gray-400">{formatRegattaDate(pos.regattaDate)}</p>}
                    </div>
                    <span className="text-[13px] px-2.5 py-1 rounded-lg font-semibold flex-shrink-0" style={{ backgroundColor: "#E8EDF8", color: "#111" }}>
                      {pos.role}
                    </span>
                  </button>
                );
              })}
            </div>
            <button onClick={handleSend} disabled={!selectedPosition || sending}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white"
              style={{ backgroundColor: selectedPosition && !sending ? "#0161F0" : "#c0c0c0" }}>
              {sending ? "Sending…" : "Send Invite"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CrewCard({ member, onUnfavorite, onInvite }) {
  const positions = member.positions || [];
  const visible = positions.slice(0, 3);
  const overflow = positions.length - visible.length;

  return (
    <div className="bg-white mx-3 rounded-2xl px-4 pt-4 pb-3" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
      <div className="flex gap-4 items-start mb-3">
        <Link href={`/crew/${member.id}`}>
          <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 90, height: 90, backgroundColor: "#d8d8d8" }}>
            {member.avatar_url
              ? <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
              : <IconUser size={32} color="#aaa" />}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <p className="text-[13px] text-gray-400 mb-0.5">{member.location}</p>
            <button onClick={() => onUnfavorite(member.id)} className="flex-shrink-0 ml-2 -mt-0.5">
              <IconStar size={22} color="#f5a623" fill="#f5a623" />
            </button>
          </div>
          <div className="flex items-baseline gap-2 mb-2 flex-wrap">
            <p className="text-[17px] font-bold text-gray-900">{member.name}</p>
            {member.experience_level && <p className="text-[13px] text-gray-400">{member.experience_level}</p>}
          </div>
          {(member.sex || member.weight_lbs) && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {member.sex && <span className="text-[13px] px-3 py-1 rounded-md font-medium" style={{ backgroundColor: "#f0f2f5", color: "#444" }}>{member.sex}</span>}
              {member.weight_lbs && <span className="text-[13px] px-3 py-1 rounded-md font-medium" style={{ backgroundColor: "#f0f2f5", color: "#444" }}>{member.weight_lbs} lbs</span>}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {visible.map((pos) => (
              <span key={pos} className="text-[13px] px-3 py-1 rounded-md font-semibold" style={{ backgroundColor: "#111", color: "#fff" }}>{pos}</span>
            ))}
            {overflow > 0 && (
              <span className="text-[13px] px-3 py-1 rounded-md font-semibold" style={{ backgroundColor: "#e8e8e8", color: "#555" }}>+{overflow}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <MessageLink toId={member.id} href={`/boat/messages/${member.id}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[15px] font-semibold border"
          style={{ color: "#0161F0", borderColor: "#0161F0" }}>
          Message
        </MessageLink>
        <button onClick={() => onInvite(member)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[15px] font-semibold text-white"
          style={{ backgroundColor: "#0161F0" }}>
          <IconSend size={16} color="white" /> Race Invite
        </button>
      </div>
      <MessageHint toId={member.id} className="mt-2 text-center">You can message {member.name?.split(" ")[0] || "this sailor"} once they apply to one of your regattas.</MessageHint>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24">
      <IconStar size={40} color="#e0e0e0" />
      <p className="text-sm font-medium text-gray-400 text-center mt-4">No favorites yet</p>
      <p className="text-xs text-gray-400 text-center mt-1">Crew you favorite will appear here.</p>
      <Link href="/boat/feed" className="mt-5 text-xs font-medium" style={{ color: "#0161f0" }}>Browse crew →</Link>
    </div>
  );
}

export default function BoatFavoritesPage() {
  const { user } = useAuth();
  const [crew, setCrew] = useState([]);
  const [regattas, setRegattas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [inviteTarget, setInviteTarget] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [user]);

  async function loadAll() {
    const [{ data: favs }, { data: regs }] = await Promise.all([
      supabase.from("boat_favorites").select("crew_id, crew_profiles(*)").eq("boat_owner_id", user.id).order("created_at", { ascending: false }),
      supabase.from("regattas").select("*, regatta_positions(*)").eq("boat_id", user.id),
    ]);
    setCrew((favs || []).map((r) => r.crew_profiles).filter(Boolean));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const future = (regs || []).filter((r) => {
      if (!r.date) return true;
      const [m, d, y] = r.date.split("/");
      if (!m || !d || !y) return true;
      return new Date(`${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`) >= now;
    });
    setRegattas(future);
    setLoading(false);
  }

  async function handleUnfavorite(crewId) {
    await supabase.from("boat_favorites").delete().eq("boat_owner_id", user.id).eq("crew_id", crewId);
    setCrew((prev) => prev.filter((m) => m.id !== crewId));
  }

  const q = query.toLowerCase().trim();
  const filtered = q
    ? crew.filter((m) => m.name?.toLowerCase().includes(q) || m.location?.toLowerCase().includes(q) || (m.positions || []).some((p) => p.toLowerCase().includes(q)))
    : crew;

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ backgroundColor: "#f5f5f5" }}>
      {inviteTarget && (
        <RaceInviteModal crew={inviteTarget} regattas={regattas} onClose={() => setInviteTarget(null)} />
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0" style={{ borderBottom: "1px solid #e8e8e8" }}>
        <ProfileSwitcher className="lg:hidden" />
        <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: "#f0f0f0" }} onClick={() => inputRef.current?.focus()}>
          <IconSearch size={14} color="#aaa" className="flex-shrink-0" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, position or location…"
            className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder-gray-400 min-w-0" />
          {query && <button onClick={() => setQuery("")}><IconX size={13} color="#aaa" /></button>}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[800px] mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-24"><p className="text-sm text-gray-400">Loading…</p></div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-3 pt-3 pb-4">
            {filtered.map((member) => (
              <CrewCard key={member.id} member={member} onUnfavorite={handleUnfavorite} onInvite={setInviteTarget} />
            ))}
          </div>
        )}
        </div>
      </main>

      <BoatNavFooter active="Favorites" />
    </div>
  );
}
