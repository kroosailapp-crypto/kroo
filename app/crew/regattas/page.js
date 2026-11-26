"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import {
  IconSearch, IconX, IconCalendar, IconAnchor, IconCheck, IconUser,
} from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { notify } from "@/lib/notify";
import { MessageLink } from "@/app/components/MessageLink";

function parseDate(str) {
  if (!str) return null;
  const [m, d, y] = str.split("/");
  if (!m || !d || !y) return null;
  return new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function groupByMonth(invitations) {
  const groups = [];
  const seen = {};
  for (const inv of invitations) {
    const date = parseDate(inv.regattas?.date);
    const key = date ? `${date.getFullYear()}-${date.getMonth()}` : "no-date";
    const label = date ? MONTHS[date.getMonth()] : "No Date";
    if (!seen[key]) {
      seen[key] = { label, items: [] };
      groups.push(seen[key]);
    }
    seen[key].items.push(inv);
  }
  return groups;
}

function WithdrawModal({ invitation, onConfirm, onClose }) {
  const regatta = invitation.regattas;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl px-6 py-7 w-full max-w-[320px] flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-base font-semibold text-gray-900 text-center leading-snug">
          Withdraw from "{regatta?.name}"?
        </p>
        <p className="text-xs text-gray-400 text-center -mt-2">This will remove your application and cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold border" style={{ color: "#111", borderColor: "#d0d0d0" }}>Keep</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: "#e00" }}>Withdraw</button>
        </div>
      </div>
    </div>
  );
}

function InvitationCard({ invitation, onApply, onDecline, onWithdraw, onDismiss }) {
  const regatta = invitation.regattas;
  const boat = regatta?.boat_profiles;
  const date = parseDate(regatta?.date);
  const day = date ? date.getDate() : null;
  const isPending = invitation.status === "pending";
  const isApplied = invitation.status === "applied";
  const isAccepted = invitation.status === "accepted";
  const isCancelled = invitation.status === "cancelled";
  const isDeclined = invitation.status === "declined";
  const isPast = date && date < new Date();

  // Find level from regatta_positions
  const posLevel = (regatta?.regatta_positions || []).find(p => p.id === invitation.position_id)?.level;

  return (
    <div className="rounded-2xl px-4 pt-4 pb-4 mx-3" style={{ backgroundColor: isPast ? "#efefef" : "#fff", boxShadow: isPast ? "none" : "0 1px 6px rgba(0,0,0,0.07)" }}>
      {/* Date + regatta name row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 flex items-center justify-center rounded-xl" style={{ width: 52, height: 52, backgroundColor: "#799FD8" }}>
          {day
            ? <span className="text-[22px] font-bold text-white leading-none">{day}</span>
            : <IconCalendar size={22} color="white" />}
        </div>
        <div className="flex-1 min-w-0">
          {regatta?.location && <p className="text-[13px] text-gray-400 leading-tight">{regatta.location}</p>}
          <p className="text-[20px] font-bold text-gray-900 leading-tight">{regatta?.name}</p>
        </div>
        {isCancelled && (
          <button onClick={() => onDismiss(invitation.id)} className="flex-shrink-0 -mt-0.5 ml-1">
            <IconX size={20} color="#aaa" />
          </button>
        )}
      </div>

      {/* Boat section */}
      <div className="flex items-center gap-3 mb-3">
        <Link href={`/boat/${regatta?.boat_id}`} className="rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 72, height: 72, backgroundColor: "#e8e8e8" }}>
          {boat?.photo_url
            ? <img src={boat.photo_url} alt="" className="w-full h-full object-cover" />
            : <IconAnchor size={24} color="#ccc" />}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-[16px] font-bold text-gray-900">{boat?.boat_name}</p>
            {boat?.boat_class && (
              <span className="text-[12px] px-2 py-0.5 rounded-lg font-semibold flex-shrink-0" style={{ backgroundColor: "#E8EDF8", color: "#111" }}>
                {boat.boat_class}
              </span>
            )}
          </div>
          {boat?.home_port && <p className="text-[13px] text-gray-400 mb-1">{boat.home_port}</p>}
          {boat?.skipper_name && (
            <div className="flex items-center gap-1.5">
              <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 22, height: 22, backgroundColor: "#d8d8d8" }}>
                {boat.skipper_photo_url
                  ? <img src={boat.skipper_photo_url} alt="" className="w-full h-full object-cover" />
                  : <IconUser size={12} color="#aaa" />}
              </div>
              <p className="text-[13px] font-semibold text-gray-700">{boat.skipper_name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Position + level + status */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[13px] px-2.5 py-1 rounded-lg font-semibold flex-shrink-0" style={{ backgroundColor: "#E8EDF8", color: "#111" }}>
          {invitation.role}
        </span>
        <p className="text-[14px] text-gray-400 flex-1">{posLevel || "All levels"}</p>
        {isApplied && (
          <span className="text-[13px] font-semibold px-2.5 py-1 rounded-md border flex-shrink-0" style={{ color: "#0161F0", borderColor: "#0161F0" }}>Applied</span>
        )}
        {isAccepted && (
          <span className="flex items-center gap-1 text-[13px] font-semibold px-2.5 py-1 rounded-md text-white flex-shrink-0" style={{ backgroundColor: "#111" }}>
            <IconCheck size={12} strokeWidth={2.5} /> Confirmed
          </span>
        )}
        {isCancelled && (
          <span className="text-[13px] font-semibold px-2.5 py-1 rounded-md text-white flex-shrink-0" style={{ backgroundColor: "#e53e3e" }}>Cancelled</span>
        )}
        {isDeclined && (
          <span className="text-[13px] font-semibold px-2.5 py-1 rounded-md flex-shrink-0" style={{ backgroundColor: "#f4f4f4", color: "#aaa" }}>Declined</span>
        )}
      </div>

      {/* Pending invite: Apply / Decline */}
      {isPending && (
        <div className="flex gap-2">
          <button onClick={() => onApply(invitation.id)} className="flex-1 py-2.5 rounded-2xl text-[15px] font-semibold text-white" style={{ backgroundColor: "#0161F0" }}>Apply</button>
          <button onClick={() => onDecline(invitation.id)} className="flex-1 py-2.5 rounded-2xl text-[15px] font-semibold border" style={{ color: "#666", borderColor: "#e0e0e0" }}>Decline</button>
          <MessageLink toId={regatta?.boat_id} href={`/crew/messages/${regatta?.boat_id}`} className="flex-1 flex items-center justify-center py-2.5 rounded-2xl text-[15px] font-semibold border" style={{ color: "#0161F0", borderColor: "#0161F0" }}>Message</MessageLink>
        </div>
      )}

      {/* Applied: Cancel Application */}
      {isApplied && !isPast && (
        <button onClick={() => onWithdraw(invitation)} className="w-full py-2.5 rounded-2xl text-[15px] font-semibold border" style={{ color: "#e53e3e", borderColor: "#e53e3e" }}>
          Cancel Application
        </button>
      )}

      {/* Accepted: Message (+ Cancel if upcoming) */}
      {isAccepted && (
        <div className="flex gap-2">
          <Link href={`/crew/messages/${regatta?.boat_id}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[15px] font-semibold text-white" style={{ backgroundColor: "#0161F0" }}>
            Message
          </Link>
          {!isPast && (
            <button onClick={() => onWithdraw(invitation)} className="flex-1 py-2.5 rounded-2xl text-[15px] font-semibold border" style={{ color: "#e53e3e", borderColor: "#e53e3e" }}>
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24">
      <IconCalendar size={40} color="#e0e0e0" />
      <p className="text-sm font-medium text-gray-400 text-center mt-4">No invitations yet</p>
      <p className="text-xs text-gray-400 text-center mt-1">When a boat invites you to race, it will appear here.</p>
      <Link href="/crew/feed" className="mt-5 text-xs font-medium" style={{ color: "#0161f0" }}>Browse boats →</Link>
    </div>
  );
}

export default function CrewRegattas() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const inputRef = useRef(null);


  useEffect(() => {
    if (!user) return;
    loadInvitations();
  }, [user]);

  function sortByRegattaDate(list) {
    const now = new Date();
    return [...list].sort((a, b) => {
      const da = parseDate(a.regattas?.date);
      const db = parseDate(b.regattas?.date);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      const aUp = da >= now, bUp = db >= now;
      if (aUp && !bUp) return -1;
      if (!aUp && bUp) return 1;
      return aUp ? da - db : db - da;
    });
  }

  async function loadInvitations() {
    const { data } = await supabase
      .from("invitations")
      .select(`*, regattas(id, name, date, location, yacht_club, boat_id, boat_profiles(boat_name, photo_url, boat_class, home_port, skipper_name, skipper_photo_url), regatta_positions(id, level))`)
      .eq("crew_id", user.id)
      .in("status", ["pending", "applied", "accepted", "declined", "cancelled"]);
    // Regattas of suspended boats are hidden, so drop their invitations too
    setInvitations(sortByRegattaDate((data || []).filter((i) => i.regattas)));
    setLoading(false);
  }

  async function handleApply(invId) {
    await supabase.from("invitations").update({ status: "applied" }).eq("id", invId);
    setInvitations((prev) => prev.map((inv) => (inv.id === invId ? { ...inv, status: "applied" } : inv)));
  }

  async function handleDecline(invId) {
    await supabase.from("invitations").update({ status: "declined" }).eq("id", invId);
    setInvitations((prev) => prev.map((inv) => (inv.id === invId ? { ...inv, status: "declined" } : inv)));
  }

  async function handleWithdraw(inv) {
    const wasAccepted = inv.status === "accepted";
    if (wasAccepted) {
      await supabase.from("invitations").update({ status: "cancelled" }).eq("id", inv.id);
      setInvitations((prev) => prev.map((i) => (i.id === inv.id ? { ...i, status: "cancelled" } : i)));
      notify({ event: "crew_cancelled", invitation_id: inv.id });
    } else {
      await supabase.from("invitations").delete().eq("id", inv.id);
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
    }
    setWithdrawTarget(null);
  }

  function handleDismiss(invId) {
    setDismissed((prev) => new Set([...prev, invId]));
  }

  const q = query.toLowerCase().trim();
  const filtered = invitations.filter((inv) => {
    if (dismissed.has(inv.id)) return false;
    if (!q) return true;
    return (
      inv.regattas?.name?.toLowerCase().includes(q) ||
      inv.regattas?.location?.toLowerCase().includes(q) ||
      inv.regattas?.boat_profiles?.boat_name?.toLowerCase().includes(q) ||
      inv.role?.toLowerCase().includes(q)
    );
  });

  const groups = groupByMonth(filtered);

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ backgroundColor: "#f5f5f5" }}>
      {withdrawTarget && (
        <WithdrawModal invitation={withdrawTarget} onConfirm={() => handleWithdraw(withdrawTarget)} onClose={() => setWithdrawTarget(null)} />
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0" style={{ borderBottom: "1px solid #e8e8e8" }}>
        <ProfileSwitcher className="lg:hidden" />
        <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: "#f0f0f0" }} onClick={() => inputRef.current?.focus()}>
          <IconSearch size={14} color="#aaa" className="flex-shrink-0" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Regatta, boat or position…"
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
          <div className="flex flex-col pt-3 pb-4">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="text-[22px] font-bold text-gray-900 px-4 mb-2">{group.label}</p>
                <div className="flex flex-col gap-3 mb-4">
                  {group.items.map((inv) => (
                    <InvitationCard
                      key={inv.id}
                      invitation={inv}
                      onApply={handleApply}
                      onDecline={handleDecline}
                      onWithdraw={setWithdrawTarget}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </main>

      <CrewNavFooter active="My Regattas" />
    </div>
  );
}
