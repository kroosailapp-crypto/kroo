"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import {
  IconSearch,
  IconX,
  IconCalendar,
  IconAnchor,
  IconCheck,
  IconMessage,
} from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

function Tag({ label, color }) {
  return (
    <span
      className="px-2.5 py-1 rounded-lg text-xs font-bold"
      style={{ backgroundColor: color ?? "#E8EDF8", color: "#111" }}
    >
      {label}
    </span>
  );
}

function StatusBadge({ status }) {
  if (status === "applied") {
    return (
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ backgroundColor: "#EFF6FF", color: "#0161F0" }}
      >
        Applied
      </span>
    );
  }
  if (status === "accepted") {
    return (
      <span
        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
        style={{ backgroundColor: "#111" }}
      >
        <IconCheck size={12} strokeWidth={2.5} /> Confirmed
      </span>
    );
  }
  if (status === "declined") {
    return (
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ backgroundColor: "#F4F4F4", color: "#aaa" }}
      >
        Declined
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ backgroundColor: "#FFF0F0", color: "#e00" }}
      >
        Cancelled
      </span>
    );
  }
  return null;
}

function WithdrawModal({ invitation, onConfirm, onClose }) {
  const regatta = invitation.regattas;
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
          Withdraw from <span>"{regatta?.name}"</span>?
        </p>
        <p className="text-xs text-gray-400 text-center -mt-2">
          This will remove your application and cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold border"
            style={{ color: "#111", borderColor: "#d0d0d0" }}
          >
            Keep
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "#e00" }}
          >
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}

function InvitationCard({ invitation, onApply, onDecline, onWithdraw }) {
  const regatta = invitation.regattas;
  const boat = regatta?.boat_profiles;
  const isPending = invitation.status === "pending";
  const isDeclined = invitation.status === "declined";
  const isCancelled = invitation.status === "cancelled";

  return (
    <div className="px-4 py-4">
      {/* Boat + Regatta info */}
      <div className="flex items-center gap-3 mb-3">
        <Link
          href={`/boat/${regatta?.boat_id}`}
          className="rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{ width: 44, height: 44, backgroundColor: "#e0e0e0" }}
        >
          {boat?.photo_url ? (
            <img src={boat.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <IconAnchor size={18} color="#ccc" />
          )}
        </Link>
        <Link href={`/boat/${regatta?.boat_id}`} className="flex-1 min-w-0">
          <p className="text-[14px] text-gray-400 truncate">
            {[boat?.boat_name, regatta?.date].filter(Boolean).join(" / ")}
          </p>
          <p className="text-[15px] font-semibold truncate" style={{ color: "#000000" }}>
            {regatta?.name}
          </p>
          {(regatta?.location || regatta?.yacht_club) && (
            <p className="text-[13px] text-gray-400 truncate">
              {[regatta.location, regatta.yacht_club].filter(Boolean).join(" / ")}
            </p>
          )}
        </Link>
        <Link
          href={`/crew/messages/${regatta?.boat_id}`}
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{ width: 32, height: 32, backgroundColor: "#024BB9" }}
        >
          <IconMessage size={14} color="white" />
        </Link>
      </div>

      {/* Position + status + cancel row */}
      <div className="flex items-center gap-2">
        <Tag label={invitation.role} />
        {!isPending && <StatusBadge status={invitation.status} />}

        {!isDeclined && !isCancelled && (
          <button
            onClick={() => onWithdraw(invitation)}
            className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: "#F4F4F4", color: "#e00" }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Actions for pending */}
      {isPending && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onApply(invitation.id)}
            className="flex-1 py-2 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "#0161F0" }}
          >
            Apply
          </button>
          <button
            onClick={() => onDecline(invitation.id)}
            className="flex-1 py-2 rounded-full text-sm font-semibold border"
            style={{ color: "#666", borderColor: "#e0e0e0" }}
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24">
      <IconCalendar size={40} color="#e0e0e0" />
      <p className="text-sm font-medium text-gray-400 text-center mt-4">No invitations yet</p>
      <p className="text-xs text-gray-400 text-center mt-1">
        When a boat invites you to race, it will appear here.
      </p>
      <Link href="/crew/feed" className="mt-5 text-xs font-medium" style={{ color: "#0161f0" }}>
        Browse boats →
      </Link>
    </div>
  );
}

export default function CrewRegattas() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.removeItem("kroo_crew_regatta_notif");
  }, []);

  useEffect(() => {
    if (!user) return;
    loadInvitations();
  }, [user]);

  function parseDate(str) {
    if (!str) return null;
    const [m, d, y] = str.split("/");
    if (!m || !d || !y) return null;
    return new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
  }

  function sortByRegattaDate(list) {
    const now = new Date();
    return [...list].sort((a, b) => {
      const da = parseDate(a.regattas?.date);
      const db = parseDate(b.regattas?.date);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      const aUpcoming = da >= now;
      const bUpcoming = db >= now;
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      if (aUpcoming && bUpcoming) return da - db;
      return db - da;
    });
  }

  async function loadInvitations() {
    const { data } = await supabase
      .from("invitations")
      .select(`
        *,
        regattas(id, name, date, location, yacht_club, boat_id, boat_profiles(boat_name, photo_url))
      `)
      .eq("crew_id", user.id)
      .in("status", ["pending", "applied", "accepted", "declined", "cancelled"]);
    setInvitations(sortByRegattaDate(data || []));
    setLoading(false);
  }

  async function handleApply(invId) {
    await supabase.from("invitations").update({ status: "applied" }).eq("id", invId);
    setInvitations((prev) =>
      prev.map((inv) => (inv.id === invId ? { ...inv, status: "applied" } : inv))
    );
  }

  async function handleDecline(invId) {
    await supabase.from("invitations").update({ status: "declined" }).eq("id", invId);
    setInvitations((prev) =>
      prev.map((inv) => (inv.id === invId ? { ...inv, status: "declined" } : inv))
    );
  }

  async function handleWithdraw(inv) {
    const wasAccepted = inv.status === "accepted";

    if (wasAccepted) {
      // Confirmed spot — mark as cancelled so it stays visible on both sides
      const { error: invErr } = await supabase
        .from("invitations")
        .update({ status: "cancelled" })
        .eq("id", inv.id);
      if (invErr) { console.error("Cancel failed:", invErr.message); return; }

      // DB trigger "trigger_reopen_position_on_cancel" reopens the position automatically
      setInvitations((prev) =>
        prev.map((i) => (i.id === inv.id ? { ...i, status: "cancelled" } : i))
      );
    } else {
      // Not yet confirmed — just delete the row cleanly
      const { error: invErr } = await supabase
        .from("invitations")
        .delete()
        .eq("id", inv.id);
      if (invErr) { console.error("Withdraw failed:", invErr.message); return; }

      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
    }

    setWithdrawTarget(null);
  }

  // Filter by query
  const q = query.toLowerCase().trim();
  const matchedInvitations = q
    ? invitations.filter(
        (inv) =>
          inv.regattas?.name?.toLowerCase().includes(q) ||
          inv.regattas?.location?.toLowerCase().includes(q) ||
          inv.regattas?.boat_profiles?.boat_name?.toLowerCase().includes(q) ||
          inv.role?.toLowerCase().includes(q)
      )
    : invitations;

  // Separate active from inactive (declined / cancelled) for visual grouping
  const inactive = ["declined", "cancelled"];
  const active = matchedInvitations.filter((inv) => !inactive.includes(inv.status));
  const past = matchedInvitations.filter((inv) => inactive.includes(inv.status));
  const visible = [...active, ...past];

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {withdrawTarget && (
        <WithdrawModal
          invitation={withdrawTarget}
          onConfirm={() => handleWithdraw(withdrawTarget)}
          onClose={() => setWithdrawTarget(null)}
        />
      )}

      <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0">
        <ProfileSwitcher />
        <div
          className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "#f0f0f0" }}
          onClick={() => inputRef.current?.focus()}
        >
          <IconSearch size={14} color="#aaa" className="flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Regatta, boat or position…"
            className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder-gray-400 min-w-0"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <IconX size={13} color="#aaa" />
            </button>
          )}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : visible.length === 0 ? (
          <EmptyState />
        ) : (
          visible.map((inv, i) => (
            <div key={inv.id}>
              <InvitationCard
                invitation={inv}
                onApply={handleApply}
                onDecline={handleDecline}
                onWithdraw={setWithdrawTarget}
              />
              {i < visible.length - 1 && <Divider />}
            </div>
          ))
        )}
      </main>

      <CrewNavFooter active="Regattas" />
    </div>
  );
}
