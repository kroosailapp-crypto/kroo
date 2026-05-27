"use client";
import { useState, use, useEffect } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconAnchor,
  IconUser,
  IconMessage,
  IconChevronDown,
  IconChevronUp,
  IconPencil,
} from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
import LocationInput from "@/app/components/LocationInput";
import YachtClubInput from "@/app/components/YachtClubInput";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

const POSITIONS = [
  "Helm", "Tactician", "Navigator", "Mainsail Trimmer",
  "Jib Trimmer", "Spin Trimmer", "Bow", "Foredeck",
  "Pitman", "Grinder", "Mast", "Runner",
];

const LEVELS = [
  "All levels",
  "Entry Level",
  "Mid Level – 2–5 years",
  "Advanced",
];

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
}

function Tag({ label }) {
  return (
    <span
      className="px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap"
      style={{ backgroundColor: "#E8EDF8", color: "#111" }}
    >
      {label}
    </span>
  );
}

function DeletePositionModal({ position, onConfirm, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-8"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl px-6 py-7 w-full max-w-[320px] flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-semibold text-gray-900 text-center leading-snug">
          Remove <span>"{position.role}"</span> from this regatta?
        </p>
        <p className="text-xs text-gray-400 text-center -mt-2">This will also remove any invitations for this position.</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold border"
            style={{ color: "#111", borderColor: "#d0d0d0" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "#e00" }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function AddPositionModal({ onAdd, onClose }) {
  const [role, setRole] = useState(null);
  const [level, setLevel] = useState(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl w-full max-w-[430px] px-5 pt-5 pb-8 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">Add position</p>
          <button onClick={onClose}>
            <IconX size={18} color="#999" />
          </button>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2">Position</p>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((p) => (
              <button
                key={p}
                onClick={() => setRole(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                style={{
                  backgroundColor: role === p ? "#111" : "#F4F4F4",
                  color: role === p ? "#fff" : "#111",
                  borderColor: role === p ? "#111" : "#F4F4F4",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2">Level</p>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                style={{
                  backgroundColor: level === l ? "#111" : "#F4F4F4",
                  color: level === l ? "#fff" : "#111",
                  borderColor: level === l ? "#111" : "#F4F4F4",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => role && onAdd({ role, level: level ?? "" })}
          disabled={!role}
          className="w-full py-3.5 rounded-full text-sm font-semibold text-white mt-1"
          style={{ backgroundColor: role ? "#0161F0" : "#c0c0c0" }}
        >
          Add position
        </button>
      </div>
    </div>
  );
}

function CrewRow({ invite, action }) {
  const crew = invite.crew_profiles;
  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ width: 40, height: 40, backgroundColor: "#d8d8d8" }}
      >
        {crew?.avatar_url ? (
          <img src={crew.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <IconUser size={18} color="#aaa" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{crew?.name || "—"}</p>
        <p className="text-xs text-gray-400">{crew?.location || ""}</p>
      </div>
      {action}
    </div>
  );
}

export default function RegattaDetail({ params }) {
  const { id } = use(params);
  const { boatProfile } = useAuth();
  const [regatta, setRegatta] = useState(null);
  const [positions, setPositions] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [collapsedOthers, setCollapsedOthers] = useState({});
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMonth, setEditMonth] = useState("");
  const [editDay, setEditDay] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editYachtClub, setEditYachtClub] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    load();

    // Reload when the tab becomes visible again (e.g. after a sailor cancels on their side)
    function handleVisibility() {
      if (document.visibilityState === "visible") load();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [id]);

  async function load() {
    const [{ data: reg }, { data: invs }] = await Promise.all([
      supabase
        .from("regattas")
        .select("*, regatta_positions(*)")
        .eq("id", id)
        .single(),
      supabase
        .from("invitations")
        .select("*, crew_profiles(id, name, avatar_url, location, experience_level)")
        .eq("regatta_id", id),
    ]);
    if (reg) {
      setRegatta(reg);
      setPositions(reg.regatta_positions || []);
    }
    setInvitations(invs || []);
    setLoading(false);

    // Mark all unseen applicants for this regatta as seen
    supabase
      .from("invitations")
      .update({ seen_by_boat: true })
      .eq("regatta_id", id)
      .eq("status", "applied")
      .eq("seen_by_boat", false)
      .then(() => {});
  }

  function getInvites(positionId) {
    return invitations.filter((inv) => inv.position_id === positionId);
  }

  function getAccepted(positionId) {
    return invitations.find(
      (inv) => inv.position_id === positionId && inv.status === "accepted"
    );
  }

  // Sailors who applied — boat can Select them
  function getApplied(positionId) {
    return invitations.filter(
      (inv) => inv.position_id === positionId && inv.status === "applied"
    );
  }

  // Sailors invited but haven't responded yet
  function getPendingOnly(positionId) {
    return invitations.filter(
      (inv) => inv.position_id === positionId && inv.status === "pending"
    );
  }

  // Sailors who were invited and declined
  function getDeclined(positionId) {
    return invitations.filter(
      (inv) => inv.position_id === positionId && inv.status === "declined"
    );
  }

  // Sailors who were confirmed but then cancelled
  function getCancelled(positionId) {
    return invitations.filter(
      (inv) => inv.position_id === positionId && inv.status === "cancelled"
    );
  }

  function toggleOthers(posId) {
    setCollapsedOthers((prev) => ({ ...prev, [posId]: !prev[posId] }));
  }

  async function handleAddPosition({ role, level }) {
    const { data } = await supabase
      .from("regatta_positions")
      .insert({ regatta_id: id, role, level: level || null, status: "open" })
      .select()
      .single();
    if (data) setPositions((prev) => [...prev, data]);
    setShowModal(false);
  }

  async function handleDeletePosition(posId) {
    await supabase.from("regatta_positions").delete().eq("id", posId);
    setPositions((prev) => prev.filter((p) => p.id !== posId));
    setInvitations((prev) => prev.filter((inv) => inv.position_id !== posId));
  }

  async function handleSelectCrew(positionId, invitationId) {
    await Promise.all([
      supabase.from("regatta_positions").update({ status: "filled" }).eq("id", positionId),
      supabase.from("invitations").update({ status: "accepted" }).eq("id", invitationId),
    ]);
    setPositions((prev) =>
      prev.map((p) => (p.id === positionId ? { ...p, status: "filled" } : p))
    );
    setInvitations((prev) =>
      prev.map((inv) => (inv.id === invitationId ? { ...inv, status: "accepted" } : inv))
    );
    localStorage.setItem("kroo_crew_regatta_notif", "1");
  }

  function openEdit() {
    const [m = "", d = "", y = ""] = (regatta.date || "").split("/");
    setEditName(regatta.name || "");
    setEditMonth(m);
    setEditDay(d);
    setEditYear(y);
    setEditLocation(regatta.location || "");
    setEditYachtClub(regatta.yacht_club || "");
    setEditing(true);
  }

  async function handleSaveEdit() {
    if (!editName.trim()) return;
    setEditSaving(true);
    const date = [editMonth, editDay, editYear].filter(Boolean).join("/") || null;
    const { data: updated } = await supabase
      .from("regattas")
      .update({ name: editName.trim(), date, location: editLocation.trim() || null, yacht_club: editYachtClub.trim() || null })
      .eq("id", id)
      .select()
      .single();
    if (updated) setRegatta(updated);
    setEditSaving(false);
    setEditing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!regatta) {
    return (
      <div className="flex flex-col min-h-screen bg-white pb-20">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <Link href="/boat/regattas">
            <IconArrowLeft size={22} color="#111" />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Regatta not found.</p>
        </div>
        <BoatNavFooter active="Regattas" />
      </div>
    );
  }

  const filled = positions.filter((p) => p.status === "filled").length;
  const open = positions.filter((p) => p.status === "open").length;
  const invited = invitations.filter((inv) => inv.status === "pending").length;
  const applied = invitations.filter((inv) => inv.status === "applied").length;

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {showModal && (
        <AddPositionModal
          onAdd={handleAddPosition}
          onClose={() => setShowModal(false)}
        />
      )}

      {deleteTarget && (
        <DeletePositionModal
          position={deleteTarget}
          onConfirm={() => { handleDeletePosition(deleteTarget.id); setDeleteTarget(null); }}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link href="/boat/regattas">
          <IconArrowLeft size={22} color="#111" />
        </Link>
        <p className="text-sm font-medium text-gray-800">
          {boatProfile?.boat_name || "My Boat"}
        </p>
      </div>

      <div className="overflow-y-auto flex-1">
        {/* Boat identifier */}
        <div className="flex items-center gap-3 px-4 pb-3">
          <div
            className="rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{ width: 36, height: 36, backgroundColor: "#e0e0e0" }}
          >
            {boatProfile?.photo_url ? (
              <img src={boatProfile.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <IconAnchor size={16} color="#ccc" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {boatProfile?.boat_name || "My Boat"}
            </p>
            <p className="text-xs text-gray-400">{boatProfile?.home_port || ""}</p>
          </div>
        </div>

        <Divider />

        {/* Regatta name + date */}
        <div className="px-4 pt-4 pb-3">
          {editing ? (
            <div className="flex flex-col gap-2 mb-4">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Regatta name"
                className="w-full px-4 py-2.5 rounded-2xl text-sm font-semibold text-gray-900 border outline-none"
                style={{ borderColor: "#e0e0e0" }}
              />
              <LocationInput
                value={editLocation}
                onChange={setEditLocation}
                placeholder="Location"
                className="w-full px-4 py-2.5 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400"
                style={{ borderColor: "#e0e0e0" }}
              />
              <YachtClubInput
                value={editYachtClub}
                onChange={setEditYachtClub}
                placeholder="Yacht Club"
                className="w-full px-4 py-2.5 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400"
                style={{ borderColor: "#e0e0e0" }}
              />
              <div className="flex gap-2">
                <input
                  value={editMonth}
                  onChange={(e) => setEditMonth(e.target.value.replace(/\D/g, ""))}
                  placeholder="MM"
                  maxLength={2}
                  inputMode="numeric"
                  className="w-14 px-2 py-2.5 rounded-2xl text-sm text-center text-gray-900 border outline-none placeholder-gray-400"
                  style={{ borderColor: "#e0e0e0" }}
                />
                <input
                  value={editDay}
                  onChange={(e) => setEditDay(e.target.value.replace(/\D/g, ""))}
                  placeholder="DD"
                  maxLength={2}
                  inputMode="numeric"
                  className="w-14 px-2 py-2.5 rounded-2xl text-sm text-center text-gray-900 border outline-none placeholder-gray-400"
                  style={{ borderColor: "#e0e0e0" }}
                />
                <input
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value.replace(/\D/g, ""))}
                  placeholder="YYYY"
                  maxLength={4}
                  inputMode="numeric"
                  className="w-20 px-2 py-2.5 rounded-2xl text-sm text-center text-gray-900 border outline-none placeholder-gray-400"
                  style={{ borderColor: "#e0e0e0" }}
                />
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2 rounded-full text-sm font-semibold border"
                  style={{ color: "#666", borderColor: "#e0e0e0" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editName.trim() || editSaving}
                  className="flex-1 py-2 rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: editName.trim() && !editSaving ? "#0161F0" : "#c0c0c0" }}
                >
                  {editSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              {(regatta.date || regatta.location || regatta.yacht_club) && (
                <p className="text-xs text-gray-400 mb-0.5">
                  {[regatta.date, regatta.location, regatta.yacht_club].filter(Boolean).join(" · ")}
                </p>
              )}
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-900">{regatta.name}</p>
                <button onClick={openEdit} className="flex-shrink-0 mt-0.5">
                  <IconPencil size={15} color="#aaa" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-5">
            <div>
              <p className="text-base font-semibold text-gray-900">{positions.length}</p>
              <p className="text-[11px] text-gray-500">Positions</p>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{filled}</p>
              <p className="text-[11px] text-gray-500">Filled</p>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{open}</p>
              <p className="text-[11px] text-gray-500">Open</p>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{invited}</p>
              <p className="text-[11px] text-gray-500">Invited</p>
            </div>
            {applied > 0 && (
              <div>
                <p className="text-base font-semibold" style={{ color: "#0161F0" }}>{applied}</p>
                <p className="text-[11px] text-gray-500">Applied</p>
              </div>
            )}
          </div>
        </div>

        <Divider />

        {/* Positions */}
        {positions.map((pos) => {
          const accepted = getAccepted(pos.id);
          const appliedInvites = getApplied(pos.id);
          const pendingInvites = getPendingOnly(pos.id);
          const declinedInvites = getDeclined(pos.id);
          const cancelledInvites = getCancelled(pos.id);
          const allInvites = getInvites(pos.id);
          const othersCollapsed = collapsedOthers[pos.id] ?? true;
          const hasActivity =
            appliedInvites.length > 0 ||
            pendingInvites.length > 0 ||
            declinedInvites.length > 0 ||
            cancelledInvites.length > 0;

          return (
            <div key={pos.id}>
              {/* Position header row */}
              <div className="flex items-center gap-2 px-4 py-3">
                <Tag label={pos.role} />
                <span className="text-xs text-gray-500 flex-1">{pos.level}</span>
                {pos.status === "filled" && (
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{ width: 22, height: 22, backgroundColor: "#111" }}
                  >
                    <IconCheck size={13} color="white" strokeWidth={2.5} />
                  </div>
                )}
                <button
                  onClick={() => setDeleteTarget(pos)}
                  className="flex-shrink-0 ml-1"
                >
                  <IconX size={16} color="#bbb" />
                </button>
              </div>

              {/* FILLED: show confirmed crew card */}
              {pos.status === "filled" && accepted && (
                <div className="mx-4 mb-3 p-3 rounded-xl" style={{ backgroundColor: "#f5f5f5" }}>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div
                      className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ width: 48, height: 48, backgroundColor: "#d8d8d8" }}
                    >
                      {accepted.crew_profiles?.avatar_url ? (
                        <img
                          src={accepted.crew_profiles.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <IconUser size={22} color="#aaa" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {accepted.crew_profiles?.name || "—"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {accepted.crew_profiles?.location || ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-lg text-white"
                      style={{ backgroundColor: "#111" }}
                    >
                      Confirmed
                    </span>
                    <Link
                      href={`/boat/messages/${accepted.crew_id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: "#024BB9" }}
                    >
                      <IconMessage size={13} color="white" /> Message
                    </Link>
                  </div>
                </div>
              )}

              {/* FILLED: others (applied / pending, non-accepted) */}
              {pos.status === "filled" && allInvites.filter(inv => inv.status !== "accepted").length > 0 && (
                <>
                  <button
                    onClick={() => toggleOthers(pos.id)}
                    className="flex items-center gap-1 px-4 pb-2 text-xs text-gray-400"
                  >
                    Others interested ({allInvites.filter(inv => inv.status !== "accepted").length})
                    {othersCollapsed
                      ? <IconChevronDown size={13} />
                      : <IconChevronUp size={13} />}
                  </button>
                  {!othersCollapsed &&
                    allInvites
                      .filter((inv) => inv.status !== "accepted")
                      .map((inv) => (
                        <CrewRow key={inv.id} invite={inv} />
                      ))}
                </>
              )}

              {/* OPEN: sailors who applied — show Select button */}
              {pos.status === "open" && appliedInvites.length > 0 && (
                <div>
                  {appliedInvites.map((inv) => (
                    <CrewRow
                      key={inv.id}
                      invite={inv}
                      action={
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleSelectCrew(pos.id, inv.id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                            style={{ backgroundColor: "#111" }}
                          >
                            Select
                          </button>
                          <Link
                            href={`/boat/messages/${inv.crew_id}`}
                            className="flex items-center justify-center rounded-full flex-shrink-0"
                            style={{ width: 30, height: 30, backgroundColor: "#024BB9" }}
                          >
                            <IconMessage size={13} color="white" />
                          </Link>
                        </div>
                      }
                    />
                  ))}
                </div>
              )}

              {/* OPEN: sailors invited but haven't responded — gray Invited tag */}
              {pos.status === "open" && pendingInvites.length > 0 && (
                <div>
                  {pendingInvites.map((inv) => (
                    <CrewRow
                      key={inv.id}
                      invite={inv}
                      action={
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: "#F0F0F0", color: "#888" }}
                          >
                            Invited
                          </span>
                          <Link
                            href={`/boat/messages/${inv.crew_id}`}
                            className="flex items-center justify-center rounded-full flex-shrink-0"
                            style={{ width: 30, height: 30, backgroundColor: "#024BB9" }}
                          >
                            <IconMessage size={13} color="white" />
                          </Link>
                        </div>
                      }
                    />
                  ))}
                </div>
              )}

              {/* OPEN: sailors who cancelled after confirmation */}
              {cancelledInvites.length > 0 && (
                <div>
                  {cancelledInvites.map((inv) => (
                    <CrewRow
                      key={inv.id}
                      invite={inv}
                      action={
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[11px] text-gray-400 font-medium">Confirmed</span>
                          <span className="text-[11px] text-gray-400">→</span>
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: "#FFF0F0", color: "#e00" }}
                          >
                            Cancelled
                          </span>
                        </div>
                      }
                    />
                  ))}
                </div>
              )}

              {/* OPEN: sailors who were invited and declined */}
              {declinedInvites.length > 0 && (
                <div>
                  {declinedInvites.map((inv) => (
                    <CrewRow
                      key={inv.id}
                      invite={inv}
                      action={
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[11px] text-gray-400 font-medium">Invited</span>
                          <span className="text-[11px] text-gray-400">→</span>
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: "#F4F4F4", color: "#888" }}
                          >
                            Rejected
                          </span>
                        </div>
                      }
                    />
                  ))}
                </div>
              )}

              {/* OPEN: no active applicants — prompt boat to browse crew */}
              {pos.status === "open" && appliedInvites.length === 0 && pendingInvites.length === 0 && (
                <div className="px-4 pb-3 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {hasActivity ? "No other applicants" : "No sailors invited yet"}
                  </p>
                  <Link
                    href="/boat/feed"
                    className="text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: "#EEF4FF", color: "#0161f0" }}
                  >
                    Browse Crew →
                  </Link>
                </div>
              )}

              <Divider />
            </div>
          );
        })}

        {positions.length === 0 && (
          <>
            <p className="text-xs text-gray-400 px-4 py-4">No positions added yet.</p>
            <Divider />
          </>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 px-4 py-4 pb-8">
          <button
            onClick={() => setShowModal(true)}
            className="text-xs font-medium px-3 py-1.5 rounded-full border"
            style={{ color: "#0161f0", borderColor: "#0161f0" }}
          >
            + Add Position
          </button>
        </div>
      </div>

      <BoatNavFooter active="Regattas" />
    </div>
  );
}
