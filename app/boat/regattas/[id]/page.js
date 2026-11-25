"use client";
import { useState, use, useEffect } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconUser,
  IconMessage,
  IconStar,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
import LocationInput from "@/app/components/LocationInput";
import YachtClubInput from "@/app/components/YachtClubInput";
import RegattaNameInput from "@/app/components/RegattaNameInput";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { notify } from "@/lib/notify";
import { MessageLink } from "@/app/components/MessageLink";

const POSITIONS = [
  "Helm", "Tactician", "Navigator", "Mainsail Trimmer",
  "Jib Trimmer", "Spin Trimmer", "Bow", "Foredeck",
  "Pitman", "Grinder", "Mast", "Runner",
];

const LEVELS = ["All levels", "Entry Level", "Mid Level", "Advanced"];

function formatRegattaDate(str) {
  if (!str) return "";
  const [m, d, y] = str.split("/");
  if (!m || !d || !y) return str;
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const month = months[parseInt(m, 10) - 1] || m;
  return `${month} ${parseInt(d, 10)}, ${y}`;
}

function UnselectCrewModal({ crewName, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl px-6 py-7 w-full max-w-[320px] flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-base font-semibold text-gray-900 text-center leading-snug">
          Unselect {crewName ? `"${crewName}"` : "this crew member"}?
        </p>
        <p className="text-xs text-gray-400 text-center -mt-2">The position will reopen and they will be notified.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold border" style={{ color: "#111", borderColor: "#d0d0d0" }}>Keep</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: "#e53e3e" }}>Unselect</button>
        </div>
      </div>
    </div>
  );
}

function DeletePositionModal({ position, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl px-6 py-7 w-full max-w-[320px] flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-base font-semibold text-gray-900 text-center leading-snug">
          Remove "{position.role}" from this regatta?
        </p>
        <p className="text-xs text-gray-400 text-center -mt-2">This will also remove any invitations for this position.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold border" style={{ color: "#111", borderColor: "#d0d0d0" }}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: "#e00" }}>Remove</button>
        </div>
      </div>
    </div>
  );
}

function CancelRegattaModal({ regatta, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl px-6 py-7 w-full max-w-[320px] flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-base font-semibold text-gray-900 text-center leading-snug">Cancel "{regatta.name}"?</p>
        <p className="text-xs text-gray-400 text-center -mt-2">This will notify all confirmed crew members.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold border" style={{ color: "#111", borderColor: "#d0d0d0" }}>Keep</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: "#e53e3e" }}>Cancel Regatta</button>
        </div>
      </div>
    </div>
  );
}

function AddPositionModal({ onAdd, onClose }) {
  const [role, setRole] = useState(null);
  const [level, setLevel] = useState(null);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-[430px] px-5 pt-5 pb-8 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">Add position</p>
          <button onClick={onClose}><IconX size={18} color="#999" /></button>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-2">Position</p>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((p) => (
              <button key={p} onClick={() => setRole(p)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                style={{ backgroundColor: role === p ? "#111" : "#F4F4F4", color: role === p ? "#fff" : "#111", borderColor: role === p ? "#111" : "#F4F4F4" }}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-2">Level</p>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setLevel(l)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                style={{ backgroundColor: level === l ? "#111" : "#F4F4F4", color: level === l ? "#fff" : "#111", borderColor: level === l ? "#111" : "#F4F4F4" }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => role && onAdd({ role, level: level ?? "" })} disabled={!role}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white mt-1"
          style={{ backgroundColor: role ? "#0161F0" : "#c0c0c0" }}>
          Add position
        </button>
      </div>
    </div>
  );
}

function CrewCard({ invite, onSelect, isFavorited, onToggleFavorite, isFilled }) {
  const crew = invite.crew_profiles;
  return (
    <Link href={`/crew/${invite.crew_id}`} className="block rounded-xl px-3 py-3 mb-2" style={{ backgroundColor: isFilled ? "#f0f4ff" : "#fff", border: isFilled ? "none" : "1px solid #f0f0f0" }}>
      <div className="flex gap-3 items-start">
        <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 64, height: 64, backgroundColor: "#d8d8d8" }}>
          {crew?.avatar_url
            ? <img src={crew.avatar_url} alt="" className="w-full h-full object-cover" />
            : <IconUser size={26} color="#aaa" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-0.5">
            <p className="text-[13px] text-gray-400">{crew?.location}</p>
            <button onClick={(e) => { e.preventDefault(); onToggleFavorite?.(invite.crew_id); }} className="flex-shrink-0 ml-2">
              <IconStar size={18} color={isFavorited ? "#f5a623" : "#bbb"} fill={isFavorited ? "#f5a623" : "none"} />
            </button>
          </div>
          <div className="flex items-baseline gap-2 mb-1.5">
            <p className="text-[15px] font-bold text-gray-900">{crew?.name || "—"}</p>
            {crew?.experience_level && <p className="text-[13px] text-gray-400">{crew.experience_level}</p>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {crew?.sex && <span className="text-[12px] px-2.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: "#e0e6f0", color: "#555" }}>{crew.sex}</span>}
            {crew?.weight_lbs && <span className="text-[12px] px-2.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: "#e0e6f0", color: "#555" }}>{crew.weight_lbs} lbs</span>}
            {onSelect && (
              <button onClick={(e) => { e.preventDefault(); onSelect(); }} className="ml-auto px-4 py-1.5 rounded-xl text-[14px] font-semibold border"
                style={{ color: "#0161F0", borderColor: "#0161F0", backgroundColor: "#fff" }}>
                Select
              </button>
            )}
            {!onSelect && (
              <MessageLink toId={invite.crew_id} href={`/boat/messages/${invite.crew_id}`} onClick={(e) => e.stopPropagation()} className="ml-auto flex items-center gap-1.5 text-[14px] font-semibold"
                style={{ color: "#0161F0" }}>
                <IconMessage size={16} /> Message
              </MessageLink>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function RegattaDetail({ params }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [regatta, setRegatta] = useState(null);
  const [positions, setPositions] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [unselectTarget, setUnselectTarget] = useState(null); // { positionId, invitationId, crewName }
  const [collapsedOthers, setCollapsedOthers] = useState({});
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMonth, setEditMonth] = useState("");
  const [editDay, setEditDay] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editYachtClub, setEditYachtClub] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    load();
    function handleVisibility() {
      if (document.visibilityState === "visible") load();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [id]);

  useEffect(() => {
    if (!user) return;
    supabase.from("boat_favorites").select("crew_id").eq("boat_owner_id", user.id)
      .then(({ data }) => setFavorites(new Set((data || []).map(r => r.crew_id))));
  }, [user]);

  async function load() {
    const [{ data: reg }, { data: invs }] = await Promise.all([
      supabase.from("regattas").select("*, regatta_positions(*)").eq("id", id).single(),
      supabase.from("invitations").select("*, crew_profiles(id, name, avatar_url, location, experience_level, sex, weight_lbs)").eq("regatta_id", id),
    ]);
    if (reg) {
      setRegatta(reg);
      setPositions((reg.regatta_positions || []).slice().sort((a, b) => a.role.localeCompare(b.role)));
    }
    setInvitations(invs || []);
    setLoading(false);
    supabase.from("invitations").update({ seen_by_boat: true }).eq("regatta_id", id).eq("status", "applied").eq("seen_by_boat", false).then(() => {});
  }

  async function handleToggleFavorite(crewId) {
    if (!user) return;
    if (favorites.has(crewId)) {
      await supabase.from("boat_favorites").delete().eq("boat_owner_id", user.id).eq("crew_id", crewId);
      setFavorites(prev => { const s = new Set(prev); s.delete(crewId); return s; });
    } else {
      await supabase.from("boat_favorites").insert({ boat_owner_id: user.id, crew_id: crewId });
      setFavorites(prev => new Set([...prev, crewId]));
    }
  }

  async function handleAddPosition({ role, level }) {
    const { data } = await supabase.from("regatta_positions").insert({ regatta_id: id, role, level: level || null, status: "open" }).select().single();
    if (data) setPositions((prev) => [...prev, data].sort((a, b) => a.role.localeCompare(b.role)));
    setShowAddModal(false);
  }

  async function handleDeletePosition(posId) {
    await supabase.from("regatta_positions").delete().eq("id", posId);
    setPositions((prev) => prev.filter((p) => p.id !== posId));
    setInvitations((prev) => prev.filter((inv) => inv.position_id !== posId));
  }

  async function handleUnselectCrew(positionId, invitationId) {
    await Promise.all([
      supabase.from("regatta_positions").update({ status: "open" }).eq("id", positionId),
      supabase.from("invitations").update({ status: "applied" }).eq("id", invitationId),
    ]);
    setPositions((prev) => prev.map((p) => (p.id === positionId ? { ...p, status: "open" } : p)));
    setInvitations((prev) => prev.map((inv) => (inv.id === invitationId ? { ...inv, status: "applied" } : inv)));
    setUnselectTarget(null);
  }

  async function handleSelectCrew(positionId, invitationId) {
    await Promise.all([
      supabase.from("regatta_positions").update({ status: "filled" }).eq("id", positionId),
      supabase.from("invitations").update({ status: "accepted" }).eq("id", invitationId),
    ]);
    setPositions((prev) => prev.map((p) => (p.id === positionId ? { ...p, status: "filled" } : p)));
    setInvitations((prev) => prev.map((inv) => (inv.id === invitationId ? { ...inv, status: "accepted" } : inv)));
    const inv = invitations.find((i) => i.id === invitationId);
    if (inv) {
      notify({
        event: "regatta_confirmation",
        recipient_id: inv.crew_id,
        profile_type: "crew",
        boat_name: "The boat",
        regatta_name: regatta?.name || "the regatta",
        position_role: inv.role,
      });
    }
  }

  async function handleCancelRegatta() {
    const { data: accepted } = await supabase.from("invitations").select("crew_id, role").eq("regatta_id", id).eq("status", "accepted");
    await supabase.from("regattas").delete().eq("id", id);
    for (const inv of accepted || []) {
      notify({ event: "regatta_cancelled", recipient_id: inv.crew_id, profile_type: "crew", boat_name: "The boat", regatta_name: regatta?.name || "the regatta" });
    }
    window.location.href = "/boat/regattas";
  }

  function openEdit() {
    const [m = "", d = "", y = ""] = (regatta.date || "").split("/");
    setEditName(regatta.name || "");
    setEditMonth(m); setEditDay(d); setEditYear(y);
    setEditLocation(regatta.location || "");
    setEditYachtClub(regatta.yacht_club || "");
    setEditing(true);
  }

  async function handleSaveEdit() {
    if (!editName.trim()) return;
    setEditSaving(true);
    const date = [editMonth, editDay, editYear].filter(Boolean).join("/") || null;
    const { data: updated } = await supabase.from("regattas").update({ name: editName.trim(), date, location: editLocation.trim() || null, yacht_club: editYachtClub.trim() || null }).eq("id", id).select().single();
    if (updated) setRegatta(updated);
    setEditSaving(false);
    setEditing(false);
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-sm text-gray-400">Loading…</p></div>;

  const regattaDate = regatta?.date ? (() => { const [m,d,y] = regatta.date.split("/"); return new Date(`${y}-${m?.padStart(2,"0")}-${d?.padStart(2,"0")}`); })() : null;
  const isPast = regattaDate && regattaDate < new Date();

  if (!regatta) return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      <div className="sticky top-0 z-20 bg-white flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "#e8e8e8" }}>
        <Link href="/boat/regattas"><IconArrowLeft size={22} color="#111" /></Link>
      </div>
      <div className="flex-1 flex items-center justify-center"><p className="text-sm text-gray-400">Regatta not found.</p></div>
      <BoatNavFooter active="My Regattas" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ backgroundColor: "#f5f5f5" }}>
      {showAddModal && <AddPositionModal onAdd={handleAddPosition} onClose={() => setShowAddModal(false)} />}
      {deleteTarget && (
        <DeletePositionModal position={deleteTarget}
          onConfirm={() => { handleDeletePosition(deleteTarget.id); setDeleteTarget(null); }}
          onClose={() => setDeleteTarget(null)} />
      )}
      {showCancelModal && (
        <CancelRegattaModal regatta={regatta} onConfirm={handleCancelRegatta} onClose={() => setShowCancelModal(false)} />
      )}
      {unselectTarget && (
        <UnselectCrewModal
          crewName={unselectTarget.crewName}
          onConfirm={() => handleUnselectCrew(unselectTarget.positionId, unselectTarget.invitationId)}
          onClose={() => setUnselectTarget(null)}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white flex items-center gap-3 px-4 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid #e8e8e8" }}>
        <Link href="/boat/regattas" className="flex items-center gap-2 text-sm font-medium text-gray-800">
          <IconArrowLeft size={20} color="#111" /> Back to My Regattas
        </Link>
      </div>

      <div className="overflow-y-auto flex-1">
        <div className="px-3 pt-4 pb-4 flex flex-col gap-3 max-w-[800px] mx-auto w-full">
        {/* Regatta info card */}
        <div className="bg-white rounded-2xl px-4 pt-4 pb-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          {editing ? (
            <div className="flex flex-col gap-2">
              <RegattaNameInput value={editName} onChange={setEditName} placeholder="Regatta name"
                className="w-full px-4 py-2.5 rounded-2xl text-sm font-semibold text-gray-900 border outline-none" style={{ borderColor: "#e0e0e0" }} />
              <LocationInput value={editLocation} onChange={setEditLocation} placeholder="Location"
                className="w-full px-4 py-2.5 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
              <YachtClubInput value={editYachtClub} onChange={setEditYachtClub} placeholder="Yacht Club"
                className="w-full px-4 py-2.5 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
              <div className="flex gap-2">
                {[{ val: editMonth, set: setEditMonth, ph: "MM", max: 2, w: "w-14" },
                  { val: editDay, set: setEditDay, ph: "DD", max: 2, w: "w-14" },
                  { val: editYear, set: setEditYear, ph: "YYYY", max: 4, w: "w-20" }].map(({ val, set, ph, max, w }) => (
                  <input key={ph} value={val} onChange={(e) => set(e.target.value.replace(/\D/g, ""))} placeholder={ph} maxLength={max} inputMode="numeric"
                    className={`${w} px-2 py-2.5 rounded-2xl text-sm text-center text-gray-900 border outline-none placeholder-gray-400`} style={{ borderColor: "#e0e0e0" }} />
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-2xl text-sm font-semibold border" style={{ color: "#666", borderColor: "#e0e0e0" }}>Cancel</button>
                <button onClick={handleSaveEdit} disabled={!editName.trim() || editSaving}
                  className="flex-1 py-2 rounded-2xl text-sm font-semibold text-white"
                  style={{ backgroundColor: editName.trim() && !editSaving ? "#0161F0" : "#c0c0c0" }}>
                  {editSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-0.5">
                {regatta.date
                  ? <p className="text-[13px] text-gray-400">{formatRegattaDate(regatta.date)}</p>
                  : <span />}
                {!isPast && <button onClick={openEdit} className="text-[15px] font-semibold flex-shrink-0 ml-2" style={{ color: "#0161F0" }}>Edit</button>}
              </div>
              <p className="text-[22px] font-bold text-gray-900 leading-tight mb-0.5">{regatta.name}</p>
              {(regatta.location || regatta.yacht_club) && (
                <p className="text-[14px] text-gray-400">{[regatta.location, regatta.yacht_club].filter(Boolean).join(" • ")}</p>
              )}
            </>
          )}
        </div>

        {/* Position sections */}
        {positions.map((pos) => {
          const accepted = invitations.find(inv => inv.position_id === pos.id && inv.status === "accepted");
          const appliedInvites = invitations.filter(inv => inv.position_id === pos.id && inv.status === "applied");
          const pendingInvites = invitations.filter(inv => inv.position_id === pos.id && inv.status === "pending");
          const declinedInvites = invitations.filter(inv => inv.position_id === pos.id && inv.status === "declined");
          const cancelledInvites = invitations.filter(inv => inv.position_id === pos.id && inv.status === "cancelled");
          const isFilled = pos.status === "filled";
          const othersCollapsed = collapsedOthers[pos.id] ?? true;
          const otherInvites = invitations.filter(inv => inv.position_id === pos.id && inv.status !== "accepted");

          return (
            <div key={pos.id} className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
              {/* Position header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[13px] px-2.5 py-1 rounded-lg font-semibold flex-shrink-0" style={{ backgroundColor: "#E8EDF8", color: "#111" }}>
                  {pos.role}
                </span>
                {!isFilled && appliedInvites.length > 0 && (
                  <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 22, height: 22, backgroundColor: "#e53e3e" }}>
                    <span className="text-[11px] font-bold text-white">{appliedInvites.length}</span>
                  </div>
                )}
                {!isFilled && (
                  <p className="text-[14px] text-gray-400 flex-1">{pos.level || "All levels"}</p>
                )}
                {isFilled ? (
                  <button
                    className="flex items-center gap-1.5 ml-auto"
                    onClick={() => accepted && setUnselectTarget({ positionId: pos.id, invitationId: accepted.id, crewName: accepted.crew_profiles?.name })}
                  >
                    <p className="text-[14px] font-semibold text-gray-900">Selected</p>
                    <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 24, height: 24, backgroundColor: "#111" }}>
                      <IconCheck size={13} color="white" strokeWidth={2.5} />
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-[13px] font-medium px-2.5 py-0.5 rounded-md border" style={{ color: "#888", borderColor: "#d0d0d0" }}>Active</span>
                    <button onClick={() => setDeleteTarget(pos)}><IconX size={16} color="#bbb" /></button>
                  </div>
                )}
              </div>

              {/* Filled: confirmed crew card */}
              {isFilled && accepted && (
                <CrewCard invite={accepted} isFavorited={favorites.has(accepted.crew_id)} onToggleFavorite={handleToggleFavorite} isFilled />
              )}

              {/* Filled: others toggle */}
              {isFilled && otherInvites.length > 0 && (
                <>
                  <button onClick={() => setCollapsedOthers(prev => ({ ...prev, [pos.id]: !prev[pos.id] }))}
                    className="flex items-center gap-1 text-xs text-gray-400 mt-1 mb-1">
                    Others interested ({otherInvites.length})
                    {othersCollapsed ? <IconChevronDown size={13} /> : <IconChevronUp size={13} />}
                  </button>
                  {!othersCollapsed && otherInvites.map(inv => (
                    <CrewCard key={inv.id} invite={inv} isFavorited={favorites.has(inv.crew_id)} onToggleFavorite={handleToggleFavorite}
                      onSelect={inv.status === "applied" ? () => handleSelectCrew(pos.id, inv.id) : undefined} />
                  ))}
                </>
              )}

              {/* Open: applicants */}
              {!isFilled && appliedInvites.map(inv => (
                <CrewCard key={inv.id} invite={inv} isFavorited={favorites.has(inv.crew_id)} onToggleFavorite={handleToggleFavorite}
                  onSelect={() => handleSelectCrew(pos.id, inv.id)} />
              ))}

              {/* Open: pending invites */}
              {!isFilled && pendingInvites.map(inv => (
                <div key={inv.id} className="rounded-xl px-3 py-3 mb-2 flex items-center gap-3" style={{ backgroundColor: "#fff", border: "1px solid #f0f0f0" }}>
                  <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 40, height: 40, backgroundColor: "#d8d8d8" }}>
                    {inv.crew_profiles?.avatar_url ? <img src={inv.crew_profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <IconUser size={18} color="#aaa" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900 truncate">{inv.crew_profiles?.name || "—"}</p>
                    <p className="text-[12px] text-gray-400">{inv.crew_profiles?.location || ""}</p>
                  </div>
                  <span className="text-[12px] font-semibold px-2.5 py-1 rounded-md flex-shrink-0" style={{ backgroundColor: "#f0f0f0", color: "#888" }}>Invited</span>
                </div>
              ))}

              {/* Open: declined */}
              {!isFilled && declinedInvites.map(inv => (
                <div key={inv.id} className="rounded-xl px-3 py-3 mb-2 flex items-center gap-3" style={{ backgroundColor: "#fff", border: "1px solid #f0f0f0" }}>
                  <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 40, height: 40, backgroundColor: "#d8d8d8" }}>
                    {inv.crew_profiles?.avatar_url ? <img src={inv.crew_profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <IconUser size={18} color="#aaa" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900 truncate">{inv.crew_profiles?.name || "—"}</p>
                  </div>
                  <span className="text-[12px] font-semibold px-2.5 py-1 rounded-md flex-shrink-0" style={{ backgroundColor: "#fff0f0", color: "#e00" }}>Declined</span>
                </div>
              ))}

              {/* Open: cancelled */}
              {cancelledInvites.map(inv => (
                <div key={inv.id} className="rounded-xl px-3 py-3 mb-2 flex items-center gap-3" style={{ backgroundColor: "#fff", border: "1px solid #f0f0f0" }}>
                  <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 40, height: 40, backgroundColor: "#d8d8d8" }}>
                    {inv.crew_profiles?.avatar_url ? <img src={inv.crew_profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <IconUser size={18} color="#aaa" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900 truncate">{inv.crew_profiles?.name || "—"}</p>
                  </div>
                  <span className="text-[12px] font-semibold px-2.5 py-1 rounded-md flex-shrink-0" style={{ backgroundColor: "#fff0f0", color: "#e00" }}>Cancelled</span>
                </div>
              ))}

              {/* Open: no applicants */}
              {!isFilled && appliedInvites.length === 0 && pendingInvites.length === 0 && cancelledInvites.length === 0 && declinedInvites.length === 0 && (
                <div>
                  <p className="text-[14px] text-gray-400 mb-3">No Applicant</p>
                  <Link href="/boat/feed"
                    className="flex items-center justify-center py-3 rounded-xl text-[15px] font-semibold border"
                    style={{ color: "#0161F0", borderColor: "#0161F0" }}>
                    Browse and Invite Sailors
                  </Link>
                </div>
              )}
            </div>
          );
        })}

        {positions.length === 0 && (
          <div className="bg-white rounded-2xl px-4 py-8 flex items-center justify-center" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <p className="text-[14px] text-gray-400">No positions added yet.</p>
          </div>
        )}

        {/* Footer actions */}
        {!isPast && (
          <div className="flex items-center justify-between px-1">
            <button onClick={() => setShowAddModal(true)} className="text-[15px] font-semibold" style={{ color: "#0161F0" }}>
              Add Position
            </button>
            <button onClick={() => setShowCancelModal(true)} className="text-[15px] font-semibold" style={{ color: "#e53e3e" }}>
              Cancel Regatta
            </button>
          </div>
        )}
        </div>
      </div>

      <BoatNavFooter active="My Regattas" />
    </div>
  );
}
