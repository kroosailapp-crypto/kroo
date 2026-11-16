"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import { IconSearch, IconX, IconPlus, IconCalendar, IconCheck, IconUser } from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { notify } from "@/lib/notify";

function formatRegattaDate(str) {
  if (!str) return "";
  const [m, d, y] = str.split("/");
  if (!m || !d || !y) return str;
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const month = months[parseInt(m, 10) - 1] || m;
  return `${month} ${parseInt(d, 10)}, ${y}`;
}

function CancelRegattaModal({ regatta, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl px-6 py-7 w-full max-w-[320px] flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-base font-semibold text-gray-900 text-center leading-snug">
          Cancel <span>"{regatta.name}"</span>?
        </p>
        <p className="text-xs text-gray-400 text-center -mt-2">This will notify all confirmed crew members.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold border" style={{ color: "#111", borderColor: "#d0d0d0" }}>Keep</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: "#e53e3e" }}>Cancel Regatta</button>
        </div>
      </div>
    </div>
  );
}

function RegattaCard({ regatta, onCancel, isPast }) {
  const positions = regatta.regatta_positions || [];
  const invitations = regatta.invitations || [];

  function applicantCount(posId) {
    return invitations.filter(inv => inv.position_id === posId && inv.status === "applied").length;
  }

  function acceptedCrew(posId) {
    return invitations.find(inv => inv.position_id === posId && inv.status === "accepted");
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: isPast ? "#efefef" : "#fff", boxShadow: isPast ? "none" : "0 1px 6px rgba(0,0,0,0.07)" }}>
      <div className="px-4 pt-4 pb-3">
        {regatta.date && (
          <p className="text-[13px] text-gray-400 mb-0.5">{formatRegattaDate(regatta.date)}</p>
        )}
        <p className="text-[22px] font-bold text-gray-900 leading-tight mb-0.5">{regatta.name}</p>
        {(regatta.location || regatta.yacht_club) && (
          <p className="text-[14px] text-gray-400">
            {[regatta.location, regatta.yacht_club].filter(Boolean).join(" • ")}
          </p>
        )}
      </div>

      {positions.length > 0 && (
        <>
          <div className="h-px mx-4" style={{ backgroundColor: "#f0f0f0" }} />
          <div className="px-4 py-2 flex flex-col gap-0">
            {positions.map((pos) => {
              const isFilled = pos.status === "filled";
              const crew = acceptedCrew(pos.id);
              const appCount = applicantCount(pos.id);

              return (
                <div key={pos.id} className="flex items-center gap-2 py-2.5">
                  <span className="text-[13px] px-2.5 py-1 rounded-lg font-semibold flex-shrink-0" style={{ backgroundColor: "#E8EDF8", color: "#111" }}>
                    {pos.role}
                  </span>

                  {isFilled && crew ? (
                    <>
                      <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 28, height: 28, backgroundColor: "#d8d8d8" }}>
                        {crew.crew_profiles?.avatar_url
                          ? <img src={crew.crew_profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                          : <IconUser size={13} color="#aaa" />}
                      </div>
                      <p className="text-[14px] font-bold text-gray-900 flex-1 truncate">{crew.crew_profiles?.name || "Crew"}</p>
                      <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 28, height: 28, backgroundColor: "#111" }}>
                        <IconCheck size={14} color="white" strokeWidth={2.5} />
                      </div>
                    </>
                  ) : (
                    <>
                      {appCount > 0 && (
                        <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 22, height: 22, backgroundColor: "#e53e3e" }}>
                          <span className="text-[11px] font-bold text-white">{appCount}</span>
                        </div>
                      )}
                      <p className="text-[14px] text-gray-400 flex-1">{pos.level || "All levels"}</p>
                      <span className="text-[13px] font-medium px-2.5 py-0.5 rounded-md border flex-shrink-0" style={{ color: "#888", borderColor: "#d0d0d0" }}>
                        Active
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="h-px mx-4" style={{ backgroundColor: "#f0f0f0" }} />
      <div className="flex items-center justify-between px-4 py-3">
        <Link href={`/boat/regattas/${regatta.id}`} className="text-[15px] font-semibold" style={{ color: "#0161F0" }}>
          Manage Regatta
        </Link>
        {!isPast && (
          <button onClick={onCancel} className="text-[15px] font-semibold" style={{ color: "#e53e3e" }}>
            Cancel Regatta
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24">
      <IconCalendar size={40} color="#e0e0e0" />
      <p className="text-sm font-medium text-gray-400 text-center mt-4">No regattas yet</p>
      <p className="text-xs text-gray-400 text-center mt-1">Add your first regatta to start finding crew.</p>
    </div>
  );
}

export default function BoatRegattas() {
  const { user } = useAuth();
  const [regattaList, setRegattaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [query, setQuery] = useState("");
  const [pastExpanded, setPastExpanded] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    loadRegattas();
  }, [user]);

  function parseDate(str) {
    if (!str) return null;
    const [m, d, y] = str.split("/");
    if (!m || !d || !y) return null;
    return new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
  }

  function sortByDate(list) {
    const now = new Date();
    return [...list].sort((a, b) => {
      const da = parseDate(a.date);
      const db = parseDate(b.date);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      const aUp = da >= now;
      const bUp = db >= now;
      if (aUp && !bUp) return -1;
      if (!aUp && bUp) return 1;
      if (aUp && bUp) return da - db;
      return db - da;
    });
  }

  async function loadRegattas() {
    const { data } = await supabase
      .from("regattas")
      .select("*, regatta_positions(*), invitations(status, seen_by_boat, position_id, crew_id, crew_profiles(name, avatar_url))")
      .eq("boat_id", user.id);
    setRegattaList(sortByDate(data || []));
    setLoading(false);
  }

  async function handleConfirmCancel() {
    const { data: accepted } = await supabase
      .from("invitations")
      .select("crew_id, role")
      .eq("regatta_id", cancelTarget.id)
      .eq("status", "accepted");

    await supabase.from("regattas").delete().eq("id", cancelTarget.id);
    setRegattaList((prev) => prev.filter((r) => r.id !== cancelTarget.id));
    setCancelTarget(null);

    for (const inv of accepted || []) {
      notify({
        event: "regatta_cancelled",
        recipient_id: inv.crew_id,
        profile_type: "crew",
        boat_name: cancelTarget.boat_profiles?.boat_name || "The boat",
        regatta_name: cancelTarget.name,
      });
    }
  }

  const now = new Date();
  const q = query.toLowerCase().trim();
  const filtered = q
    ? regattaList.filter((r) =>
        r.name?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q)
      )
    : regattaList;

  const upcoming = filtered.filter((r) => {
    const d = parseDate(r.date);
    return !d || d >= now;
  });
  const past = filtered.filter((r) => {
    const d = parseDate(r.date);
    return d && d < now;
  });

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0" style={{ borderBottom: "1px solid #e8e8e8" }}>
        <ProfileSwitcher className="lg:hidden" />
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
            placeholder="Name or location…"
            className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder-gray-400 min-w-0"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <IconX size={13} color="#aaa" />
            </button>
          )}
        </div>
        <Link href="/boat/regattas/new"><IconPlus size={22} color="#111" /></Link>
      </div>

      {cancelTarget && (
        <CancelRegattaModal regatta={cancelTarget} onConfirm={handleConfirmCancel} onClose={() => setCancelTarget(null)} />
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[800px] mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : filtered.length === 0 && !query ? (
          <div className="flex flex-col gap-3 px-3 pt-4 pb-4">
            <EmptyState />
            <Link
              href="/boat/regattas/new"
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[15px] font-semibold bg-white border"
              style={{ color: "#0161F0", borderColor: "#0161F0", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
            >
              <IconPlus size={18} color="#0161F0" />
              Add Regatta
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm text-gray-400">No results for "{query}"</p>
          </div>
        ) : (
          <div className="flex flex-col pt-4 pb-4">
            {/* Upcoming Events */}
            {upcoming.length > 0 && (
              <>
                <p className="text-[20px] font-bold text-gray-900 px-4 mb-2">Upcoming Events</p>
                <div className="flex flex-col gap-3 px-3 mb-4">
                  {upcoming.map((regatta) => (
                    <RegattaCard key={regatta.id} regatta={regatta} onCancel={() => setCancelTarget(regatta)} isPast={false} />
                  ))}
                </div>
              </>
            )}

            {/* Past Events */}
            {past.length > 0 && (
              <>
                <button
                  className="flex items-center gap-2 px-4 mb-2"
                  onClick={() => setPastExpanded((v) => !v)}
                >
                  <p className="text-[20px] font-bold text-gray-900">Past Events</p>
                  <svg
                    width="20" height="20" viewBox="0 0 20 20" fill="none"
                    style={{ transition: "transform 0.2s", transform: pastExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {pastExpanded && (
                  <div className="flex flex-col gap-3 px-3 mb-4">
                    {past.map((regatta) => (
                      <RegattaCard key={regatta.id} regatta={regatta} onCancel={() => setCancelTarget(regatta)} isPast={true} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Add Regatta */}
            <div className="px-3">
              <Link
                href="/boat/regattas/new"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[15px] font-semibold bg-white border"
                style={{ color: "#0161F0", borderColor: "#0161F0", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
              >
                <IconPlus size={18} color="#0161F0" />
                Add Regatta
              </Link>
            </div>
          </div>
        )}
        </div>
      </main>

      <BoatNavFooter active="My Regattas" />
    </div>
  );
}
