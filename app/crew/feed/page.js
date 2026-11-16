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
  IconCalendar,
  IconCheck,
  IconSailboat,
} from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { fetchAdminIds } from "@/lib/fetch-admin-ids";

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
      curGroup = { label, year: date ? date.getFullYear() : null, regattas: [] };
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
          className="mt-1 w-full py-2.5 rounded-2xl text-sm font-semibold text-white"
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
    <Link href={`/boat/${boat.id}`} className="flex items-center gap-4 px-4 py-4">
      {/* Boat thumbnail */}
      <div
        className="rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ width: 88, height: 88, backgroundColor: "#e8e8e8" }}
      >
        {boat.photo_url ? (
          <img src={boat.photo_url} alt={boat.boat_name} className="w-full h-full object-cover" />
        ) : (
          <IconAnchor size={28} color="#ccc" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[17px] font-bold text-gray-900 truncate">{boat.boat_name}</p>
          {boat.boat_class && (
            <span
              className="text-[13px] px-2.5 py-0.5 rounded-md font-medium flex-shrink-0"
              style={{ backgroundColor: "#ebebeb", color: "#555" }}
            >
              {boat.boat_class}
            </span>
          )}
        </div>
        {boat.home_port && (
          <p className="text-[14px] text-gray-400 mb-1">{boat.home_port}</p>
        )}
        {boat.skipper_name && (
          <div className="flex items-center gap-1.5">
            <div
              className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{ width: 22, height: 22, backgroundColor: "#d8d8d8" }}
            >
              {boat.skipper_photo_url ? (
                <img src={boat.skipper_photo_url} alt={boat.skipper_name} className="w-full h-full object-cover" />
              ) : (
                <IconUser size={12} color="#aaa" />
              )}
            </div>
            <p className="text-[14px] font-semibold text-gray-700">{boat.skipper_name}</p>
          </div>
        )}
      </div>

      {/* Open positions badge */}
      {(boat.open_positions ?? 0) > 0 && (
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 36, height: 36, backgroundColor: "#dce9ff" }}
          >
            <span className="text-[15px] font-bold" style={{ color: "#0161F0" }}>{boat.open_positions}</span>
          </div>
          <p className="text-[11px] text-gray-400 text-center leading-tight">Open<br/>Positions</p>
        </div>
      )}
    </Link>
  );
}


function RegattaCard({ regatta }) {
  const date = regatta.parsedDate;
  const day = date ? date.getDate().toString().padStart(2, "0") : null;

  const openPositions = (regatta.regatta_positions || []).filter((p) => p.status === "open");
  const boat = regatta.boat_profiles;
  if (!boat || openPositions.length === 0) return null;

  const openCount = openPositions.length;

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0" }}>
      {/* Regatta header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        {day && (
          <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 52, height: 52, backgroundColor: "#0161F0" }}>
            <span className="text-white font-bold text-xl leading-none">{day}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {regatta.location && <p className="text-[13px] text-gray-400 mb-0.5">{regatta.location}</p>}
          <p className="text-[17px] font-bold text-gray-900 leading-tight">{regatta.name}</p>
        </div>
      </div>

      {/* Boat card — same layout as boats view */}
      <div className="h-px" style={{ backgroundColor: "#f0f0f0" }} />
      <BoatCard boat={{ ...boat, open_positions: openCount }} />

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
      <IconCalendar size={40} color="#e0e0e0" />
      <p className="text-sm font-medium text-gray-400 text-center mt-4">No upcoming regattas</p>
      <p className="text-xs text-gray-400 text-center mt-1">Open crew positions will appear here when boats post regattas.</p>
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
  const [modalBoat, setModalBoat] = useState(null);
  const [visibleBoats, setVisibleBoats] = useState(25);
  const [visibleRegattas, setVisibleRegattas] = useState(25);
  const inputRef = useRef(null);

  // Load boats + regattas with open positions
  useEffect(() => {
    async function load() {
      const [{ data: boatData }, { data: regattaData }, adminIdList] = await Promise.all([
        supabase.from("boat_profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("regattas").select(`
          id, name, date, location, boat_id,
          regatta_positions(id, role, level, status),
          boat_profiles(id, boat_name, photo_url, boat_class, home_port, skipper_name, skipper_photo_url)
        `),
        fetchAdminIds(),
      ]);
      const adminIds = new Set(adminIdList);

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

  // Reset pagination when query or view changes
  useEffect(() => { setVisibleBoats(25); setVisibleRegattas(25); }, [query, view]);

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
              ? group.regattas
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

  const allFilteredRegattas = filteredMonthGroups.flatMap((g) => g.regattas);
  const slicedRegattas = new Set(allFilteredRegattas.slice(0, visibleRegattas).map((r) => r.id));
  const visibleMonthGroups = filteredMonthGroups
    .map((g) => ({ ...g, regattas: g.regattas.filter((r) => slicedRegattas.has(r.id)) }))
    .filter((g) => g.regattas.length > 0);

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ backgroundColor: "#f5f5f5" }}>
      {modalBoat && (
        <ApplyModal boatName={modalBoat.boat_name} onClose={() => setModalBoat(null)} />
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white flex-shrink-0" style={{ borderBottom: "1px solid #e8e8e8" }}>
        {/* Row 1: Logo + toggle */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <ProfileSwitcher className="lg:hidden" />
          <button
            onClick={() => { setView((v) => (v === "boats" ? "positions" : "boats")); setQuery(""); }}
            className="flex items-center gap-1.5"
          >
            {view === "boats" ? (
              <>
                <span className="text-[15px] font-semibold" style={{ color: "#0161F0" }}>Calendar View</span>
                <IconCalendar size={18} color="#0161F0" />
              </>
            ) : (
              <>
                <span className="text-[15px] font-semibold" style={{ color: "#0161F0" }}>Boats View</span>
                <IconSailboat size={18} color="#0161F0" />
              </>
            )}
          </button>
        </div>
        {/* Row 2: Search */}
        <div className="px-4 pb-3">
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl"
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
        </div>
      </div>

      {/* ── Boats view ── */}
      {view === "boats" && (
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[800px] mx-auto w-full">
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
            <>
              <div className="flex flex-col gap-2 px-3 pt-2">
              {filteredBoats.slice(0, visibleBoats).map((boat) => (
                <div key={boat.id} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0" }}>
                  <BoatCard boat={boat} />
                </div>
              ))}
              </div>
              {filteredBoats.length > visibleBoats && (
                <div className="flex justify-center py-6">
                  <button
                    onClick={() => setVisibleBoats((c) => c + 25)}
                    className="px-6 py-2.5 rounded-2xl text-sm font-semibold border"
                    style={{ color: "#111", borderColor: "#d0d0d0" }}
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
          </div>
        </main>
      )}

      {/* ── Positions view ── */}
      {view === "positions" && (
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[800px] mx-auto w-full">
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
            <>
              <div className="flex flex-col px-3 pt-2 pb-4 gap-4">
                {visibleMonthGroups.map((group) => (
                  <div key={group.label}>
                    <div className="flex items-baseline justify-between px-1 mb-3">
                      <p className="text-[22px] font-bold text-gray-900">{group.label}</p>
                      {group.year && <p className="text-[15px] font-semibold text-gray-400">{group.year}</p>}
                    </div>
                    <div className="flex flex-col gap-3">
                      {group.regattas.map((reg) => (
                        <RegattaCard
                          key={reg.id}
                          regatta={reg}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {allFilteredRegattas.length > visibleRegattas && (
                <div className="flex justify-center py-6">
                  <button
                    onClick={() => setVisibleRegattas((c) => c + 25)}
                    className="px-6 py-2.5 rounded-2xl text-sm font-semibold border"
                    style={{ color: "#111", borderColor: "#d0d0d0" }}
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
          </div>
        </main>
      )}

      <CrewNavFooter active="Home" />
    </div>
  );
}
