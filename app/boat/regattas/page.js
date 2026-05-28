"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import { IconSearch, IconX, IconPlus, IconCalendar } from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
}

function Tag({ label }) {
  return (
    <span className="px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap" style={{ backgroundColor: "#E8EDF8", color: "#111" }}>
      {label}
    </span>
  );
}

function CancelRegattaModal({ regatta, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl px-6 py-7 w-full max-w-[320px] flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-base font-semibold text-gray-900 text-center leading-snug">
          Are you sure you want to cancel <span>"{regatta.name}"</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full text-sm font-semibold border" style={{ color: "#111", borderColor: "#d0d0d0" }}>No</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: "#111" }}>Yes, Cancel</button>
        </div>
      </div>
    </div>
  );
}

function RegattaCard({ regatta, onCancel }) {
  const positions = regatta.regatta_positions || [];
  const filled = positions.filter((p) => p.status === "filled").length;
  const open = positions.filter((p) => p.status === "open").length;
  const invitations = regatta.invitations || [];

  function positionHasNewApplicant(posId) {
    return invitations.some(
      (inv) => inv.position_id === posId && inv.status === "applied" && !inv.seen_by_boat
    );
  }

  return (
    <div className="py-4">
      <div className="px-4 mb-3">
        {regatta.date && <p className="text-xs font-medium mb-0.5" style={{ color: "#000000" }}>{regatta.date}</p>}
        <Link href={`/boat/regattas/${regatta.id}`} className="text-xl font-bold text-gray-900 block mb-0.5">{regatta.name}</Link>
        {(regatta.location || regatta.yacht_club) && (
          <p className="text-xs text-gray-600">
            {[regatta.location, regatta.yacht_club].filter(Boolean).join(" / ")}
          </p>
        )}
      </div>

      <div className="flex gap-5 px-4 mb-4">
        <div><p className="text-base font-semibold text-gray-900">{positions.length}</p><p className="text-[13px] text-gray-500">Positions</p></div>
        <div><p className="text-base font-semibold text-gray-900">{filled}</p><p className="text-[13px] text-gray-500">Filled</p></div>
        <div><p className="text-base font-semibold text-gray-900">{open}</p><p className="text-[13px] text-gray-500">Open</p></div>
      </div>

      <Divider />

      {positions.map((pos) => {
        const isNew = positionHasNewApplicant(pos.id);
        return (
          <div key={pos.id}>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Tag label={pos.role} />
                <span className="text-xs text-gray-500 flex-1">{pos.level}</span>
                {isNew && (
                  <span className="text-[13px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#0161F0", color: "#fff" }}>
                    New Applicant
                  </span>
                )}
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: pos.status === "filled" ? "#111" : "#e8e8e8", color: pos.status === "filled" ? "#fff" : "#666" }}>
                  {pos.status === "filled" ? "Filled" : "Open"}
                </span>
              </div>
            </div>
            <Divider />
          </div>
        );
      })}

      {positions.length === 0 && (
        <>
          <p className="text-xs text-gray-400 px-4 py-3">No positions added yet.</p>
          <Divider />
        </>
      )}

      <div className="flex items-center gap-4 px-4 py-3">
        <Link href={`/boat/regattas/${regatta.id}`} className="text-xs font-medium" style={{ color: "#0161f0" }}>View Regatta</Link>
        <button onClick={onCancel} className="text-xs font-medium ml-auto" style={{ color: "#e00" }}>Cancel</button>
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
      <Link href="/boat/regattas/new" className="mt-5 px-4 py-2 rounded-full text-xs font-medium border" style={{ color: "#0161f0", borderColor: "#0161f0" }}>
        + Add Regatta
      </Link>
    </div>
  );
}

export default function BoatRegattas() {
  const { user } = useAuth();
  const [regattaList, setRegattaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    loadRegattas();
    localStorage.removeItem("kroo_boat_regatta_notif");
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
      const aUpcoming = da >= now;
      const bUpcoming = db >= now;
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      if (aUpcoming && bUpcoming) return da - db; // soonest first
      return db - da; // most recent past first
    });
  }

  async function loadRegattas() {
    const { data } = await supabase
      .from("regattas")
      .select("*, regatta_positions(*), invitations(status, seen_by_boat, position_id)")
      .eq("boat_id", user.id);
    setRegattaList(sortByDate(data || []));
    setLoading(false);
  }

  async function handleConfirmCancel() {
    await supabase.from("regattas").delete().eq("id", cancelTarget.id);
    setRegattaList((prev) => prev.filter((r) => r.id !== cancelTarget.id));
    setCancelTarget(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
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
        {(() => {
          const q = query.toLowerCase().trim();
          const filtered = q
            ? regattaList.filter((r) =>
                r.name?.toLowerCase().includes(q) ||
                r.location?.toLowerCase().includes(q)
              )
            : regattaList;
          if (loading) return (
            <div className="flex items-center justify-center py-24">
              <p className="text-sm text-gray-400">Loading…</p>
            </div>
          );
          if (filtered.length === 0) return <EmptyState />;
          return (
            <>
              {filtered.map((regatta, i) => (
                <div key={regatta.id}>
                  <RegattaCard regatta={regatta} onCancel={() => setCancelTarget(regatta)} />
                  {i < filtered.length - 1 && <div className="h-2" style={{ backgroundColor: "#F6F6F6" }} />}
                </div>
              ))}
              <div className="px-4 py-5">
                <Link href="/boat/regattas/new" className="text-xs font-medium px-4 py-2 rounded-full border" style={{ color: "#0161f0", borderColor: "#0161f0" }}>
                  + Add Regatta
                </Link>
              </div>
            </>
          );
        })()}
      </main>

      <BoatNavFooter active="Regattas" />
    </div>
  );
}
