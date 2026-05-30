"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import {
  IconSearch,
  IconX,
  IconAnchor,
  IconUser,
  IconLayoutGrid,
  IconList,
  IconCalendar,
  IconCheck,
} from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseDate(str) {
  if (!str) return null;
  const [m, d, y] = str.split("/");
  if (!m || !d || !y) return null;
  return new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
}

function monthName(date) {
  return date.toLocaleString("default", { month: "long" });
}

function groupRegattasByMonth(regattas) {
  // Sort: upcoming soonest first, past most recently first, no-date last
  const now = new Date();
  const sorted = [...regattas].sort((a, b) => {
    const da = parseDate(a.date);
    const db = parseDate(b.date);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    const aUp = da >= now;
    const bUp = db >= now;
    if (aUp && !bUp) return -1;
    if (!aUp && bUp) return 1;
    if (aUp && bUp) return da - db; // soonest upcoming first
    return db - da;                 // most recently past first
  });

  const groups = [];
  let curMonthKey = null;
  let curGroup = null;

  for (const reg of sorted) {
    const date = parseDate(reg.date);
    const monthKey = date
      ? `${date.getFullYear()}-${date.getMonth()}`
      : "no-date";
    const label = date ? monthName(date) : "No Date";

    if (monthKey !== curMonthKey) {
      curMonthKey = monthKey;
      curGroup = { label, regattas: [] };
      groups.push(curGroup);
    }
    curGroup.regattas.push({ ...reg, parsedDate: date });
  }

  return groups;
}

// ─── Apply confirmation modal ────────────────────────────────────────────────

function ApplyModal({ boatName, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-8"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl px-6 py-7 w-full max-w-[320px] flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 48, height: 48, backgroundColor: "#111" }}
        >
          <IconCheck size={22} color="white" strokeWidth={2.5} />
        </div>
        <p className="text-base font-semibold text-gray-900 text-center">
          Application sent!
        </p>
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          A notification was sent to the skipper of{" "}
          <span className="font-semibold text-gray-800">"{boatName}"</span>. If
          you are selected, we will notify you.
        </p>
        <button
          onClick={onClose}
          className="mt-1 w-full py-2.5 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: "#0161f0" }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

// ─── Boats view ──────────────────────────────────────────────────────────────

function BoatCard({ boat }) {
  return (
    <Link href={`/boat/${boat.id}`} className="flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="font-bold text-lg text-gray-900">{boat.boat_name}</p>
          <p className="text-xs text-gray-500">{boat.home_port}</p>
        </div>
        {boat.boat_class && (
          <span
            className="text-xs px-2.5 py-1 rounded-lg font-bold"
            style={{ backgroundColor: "#E8EDF8", color: "#111" }}
          >
            {boat.boat_class}
          </span>
        )}
      </div>

      <div
        className="relative w-full h-48 flex items-center justify-center"
        style={{ backgroundColor: "#f0f0f0" }}
      >
        {boat.photo_url ? (
          <img
            src={boat.photo_url}
            alt={boat.boat_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <IconAnchor size={40} color="#ccc" />
        )}
      </div>

      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex gap-5">
          <div>
            <p className="text-base font-semibold text-gray-900">
              {(boat.open_positions ?? 0)}
            </p>
            <p className="text-[13px] text-gray-500">Open Positions</p>
          </div>
        </div>
        {boat.skipper_name && (
          <div className="flex items-center gap-2">
            <div
              className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ width: 32, height: 32, backgroundColor: "#d8d8d8" }}
            >
              {boat.skipper_photo_url ? (
                <img
                  src={boat.skipper_photo_url}
                  alt={boat.skipper_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <IconUser size={16} color="#aaa" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">
                {boat.skipper_name}
              </p>
              <p className="text-[13px] text-gray-400">Skipper</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Positions view ──────────────────────────────────────────────────────────

function PositionRow({ pos, applied, onApply }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <span
        className="px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0"
        style={{ backgroundColor: "#E8EDF8", color: "#111" }}
      >
        {pos.role}
      </span>
      {pos.level && (
        <span className="text-xs text-gray-500 flex-1 truncate">{pos.level}</span>
      )}
      {applied ? (
        <span
          className="text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: "#EFF6FF", color: "#0161F0" }}
        >
          Applied
        </span>
      ) : (
        <button
          onClick={() => onApply(pos)}
          className="text-xs font-semibold px-3 py-1.5 rounded-full text-white flex-shrink-0"
          style={{ backgroundColor: "#0161F0" }}
        >
          Apply
        </button>
      )}
    </div>
  );
}

function BoatPositionBlock({ regatta, boat, openPositions, appliedPositions, onApply }) {
  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: "#f0f0f0" }}>
      {/* Boat header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href={`/boat/${boat.id}`} className="rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 52, height: 52, backgroundColor: "#e0e0e0" }}>
          {boat.photo_url ? (
            <img src={boat.photo_url} alt={boat.boat_name} className="w-full h-full object-cover" />
          ) : (
            <IconAnchor size={20} color="#ccc" />
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/boat/${boat.id}`}>
            <p className="text-sm font-bold text-gray-900 truncate">{boat.boat_name}</p>
          </Link>
          {boat.boat_class && (
            <span
              className="inline-block mt-0.5 px-2 py-0.5 rounded text-[13px] font-semibold"
              style={{ backgroundColor: "#F0F0F0", color: "#555" }}
            >
              {boat.boat_class}
            </span>
          )}
        </div>
      </div>

      {/* Open positions */}
      <div className="flex flex-col divide-y divide-[#e8e8e8]">
        {openPositions.map((pos) => (
          <PositionRow
            key={pos.id}
            pos={pos}
            applied={appliedPositions.has(pos.id)}
            onApply={(p) => onApply(regatta, boat, p)}
          />
        ))}
      </div>
    </div>
  );
}

function RegattaBlock({ regatta, appliedPositions, onApply }) {
  const date = regatta.parsedDate;
  const day = date ? date.getDate().toString().padStart(2, "0") : null;

  // Group open positions by boat
  const openPositions = (regatta.regatta_positions || []).filter(
    (p) => p.status === "open"
  );
  const boat = regatta.boat_profiles;
  if (!boat || openPositions.length === 0) return null;

  return (
    <div className="mb-1">
      {/* Date + regatta header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-2">
        {day && (
          <div
            className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ width: 44, height: 44, backgroundColor: "#0161F0" }}
          >
            <span className="text-white font-bold text-lg leading-none">{day}</span>
          </div>
        )}
        <div className="flex-1 min-w-0 pt-0.5">
          {regatta.location && (
            <p className="text-xs text-gray-400 mb-0.5">{regatta.location}</p>
          )}
          <p className="text-base font-bold text-gray-900 leading-tight">
            {regatta.name}
          </p>
        </div>
      </div>

      {/* Boat + positions */}
      <BoatPositionBlock
        regatta={regatta}
        boat={boat}
        openPositions={openPositions}
        appliedPositions={appliedPositions}
        onApply={onApply}
      />
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

function EmptyBoats() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24">
      <IconAnchor size={40} color="#e0e0e0" />
      <p className="text-sm font-medium text-gray-400 text-center mt-4">No boats yet</p>
      <p className="text-xs text-gray-400 text-center mt-1">
        Boats looking for crew will appear here.
      </p>
    </div>
  );
}

function EmptyPositions() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24">
      <IconList size={40} color="#e0e0e0" />
      <p className="text-sm font-medium text-gray-400 text-center mt-4">
        No open positions
      </p>
      <p className="text-xs text-gray-400 text-center mt-1">
        Open crew positions will appear here when boats post regattas.
      </p>
    </div>
  );
}

export default function CrewFeedPage() {
  const { user } = useAuth();
  const [view, setView] = useState("boats"); // "boats" | "positions"
  const [query, setQuery] = useState("");
  const [boats, setBoats] = useState([]);
  const [monthGroups, setMonthGroups] = useState([]);
  const [appliedPositions, setAppliedPositions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [modalBoat, setModalBoat] = useState(null); // { boat_name }
  const inputRef = useRef(null);

  // Load boats + regattas with open positions
  useEffect(() => {
    async function load() {
      const [{ data: boatData }, { data: regattaData }, adminRes] = await Promise.all([
        supabase.from("boat_profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("regattas").select(`
          id, name, date, location, boat_id,
          regatta_positions(id, role, level, status),
          boat_profiles(id, boat_name, photo_url, boat_class)
        `),
        fetch("/api/admin/ids").then((r) => r.json()),
      ]);
      const adminIds = new Set(adminRes.ids || []);

      // Build a map of boat_id → count of open positions across all their regattas
      const openCountByBoat = {};
      for (const reg of regattaData || []) {
        const openCount = (reg.regatta_positions || []).filter(
          (p) => p.status === "open"
        ).length;
        if (openCount > 0) {
          openCountByBoat[reg.boat_id] =
            (openCountByBoat[reg.boat_id] || 0) + openCount;
        }
      }

      // Annotate each boat with its real open position count (exclude admins)
      const allBoats = (boatData || [])
        .filter((b) => !adminIds.has(b.id))
        .map((b) => ({ ...b, open_positions: openCountByBoat[b.id] || 0 }));
      setBoats(allBoats);

      // Regattas: keep only those with ≥1 open position
      const withOpen = (regattaData || []).filter((r) =>
        (r.regatta_positions || []).some((p) => p.status === "open")
      );
      setMonthGroups(groupRegattasByMonth(withOpen));
      setLoading(false);
    }
    load();
  }, []);

  // Load already-applied positions
  useEffect(() => {
    if (!user) return;
    supabase
      .from("invitations")
      .select("position_id")
      .eq("crew_id", user.id)
      .in("status", ["applied", "accepted"])
      .then(({ data }) => {
        if (data) setAppliedPositions(new Set(data.map((r) => r.position_id)));
      });
  }, [user]);

  async function handleApply(regatta, boat, pos) {
    if (!user) return;
    setAppliedPositions((prev) => new Set(prev).add(pos.id));
    setModalBoat(boat);

    await supabase.from("invitations").upsert(
      {
        regatta_id: regatta.id,
        position_id: pos.id,
        crew_id: user.id,
        role: pos.role,
        status: "applied",
      },
      { onConflict: "position_id,crew_id", ignoreDuplicates: false }
    );
  }

  // ── Filtering ────────────────────────────────────────────────────────────
  const q = query.toLowerCase().trim();

  const filteredBoats = q
    ? boats.filter(
        (b) =>
          b.boat_name?.toLowerCase().includes(q) ||
          b.home_port?.toLowerCase().includes(q) ||
          b.boat_class?.toLowerCase().includes(q)
      )
    : boats;

  const filteredMonthGroups = q
    ? monthGroups
        .map((group) => {
          const monthMatches = group.label.toLowerCase().includes(q);
          return {
            ...group,
            regattas: monthMatches
              ? group.regattas // show all regattas in matching month
              : group.regattas.filter(
                  (reg) =>
                    reg.name?.toLowerCase().includes(q) ||
                    reg.location?.toLowerCase().includes(q) ||
                    (reg.regatta_positions || []).some((p) =>
                      p.role?.toLowerCase().includes(q)
                    )
                ),
          };
        })
        .filter((group) => group.regattas.length > 0)
    : monthGroups;

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {modalBoat && (
        <ApplyModal boatName={modalBoat.boat_name} onClose={() => setModalBoat(null)} />
      )}

      {/* Header */}
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
            onChange={(e) => { setQuery(e.target.value); }}
            placeholder={view === "positions" ? "Event, location or position…" : "Boat name, location or class…"}
            className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder-gray-400 min-w-0"
          />
          {query && (
            <button onClick={() => setQuery("")} className="flex-shrink-0">
              <IconX size={13} color="#aaa" />
            </button>
          )}
        </div>
        {/* Toggle view */}
        <button
          onClick={() => { setView((v) => (v === "boats" ? "positions" : "boats")); setQuery(""); }}
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{ width: 34, height: 34, backgroundColor: view === "positions" ? "#111" : "#f0f0f0" }}
        >
          {view === "boats" ? (
            <IconCalendar size={18} color="#555" />
          ) : (
            <IconLayoutGrid size={18} color="#fff" />
          )}
        </button>
      </div>

      {/* ── Boats view ── */}
      {view === "boats" && (
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="text-sm text-gray-400">Loading…</p>
            </div>
          ) : filteredBoats.length === 0 ? (
            q ? (
              <div className="flex flex-col items-center justify-center px-8 py-24">
                <IconAnchor size={40} color="#e0e0e0" />
                <p className="text-sm font-medium text-gray-400 text-center mt-4">No results for "{query}"</p>
                <p className="text-xs text-gray-400 text-center mt-1">Try a different boat name, location or class.</p>
              </div>
            ) : (
              <EmptyBoats />
            )
          ) : (
            filteredBoats.map((boat, i) => (
              <div key={boat.id}>
                <BoatCard boat={boat} />
                {i < filteredBoats.length - 1 && (
                  <div className="h-2" style={{ backgroundColor: "#F6F6F6" }} />
                )}
              </div>
            ))
          )}
        </main>
      )}

      {/* ── Positions view ── */}
      {view === "positions" && (
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="text-sm text-gray-400">Loading…</p>
            </div>
          ) : filteredMonthGroups.length === 0 ? (
            q ? (
              <div className="flex flex-col items-center justify-center px-8 py-24">
                <IconList size={40} color="#e0e0e0" />
                <p className="text-sm font-medium text-gray-400 text-center mt-4">No results for "{query}"</p>
                <p className="text-xs text-gray-400 text-center mt-1">Try a different event name, location or position.</p>
              </div>
            ) : (
              <EmptyPositions />
            )
          ) : (
            filteredMonthGroups.map((group) => (
              <div key={group.label}>
                <div
                  className="px-4 py-2.5 sticky top-0 z-10"
                  style={{ backgroundColor: "#F6F6F6" }}
                >
                  <p className="text-base font-bold text-gray-900">{group.label}</p>
                </div>
                {group.regattas.map((reg) => (
                  <RegattaBlock
                    key={reg.id}
                    regatta={reg}
                    appliedPositions={appliedPositions}
                    onApply={handleApply}
                  />
                ))}
              </div>
            ))
          )}
        </main>
      )}

      <CrewNavFooter active="Home" />
    </div>
  );
}
