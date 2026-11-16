"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import { IconStar, IconSearch, IconX, IconAnchor, IconUser } from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

function BoatCard({ boat, onUnfavorite }) {
  const openPositions = (boat.regattas || [])
    .flatMap((r) => r.regatta_positions || [])
    .filter((p) => p.status === "open").length;

  return (
    <Link href={`/boat/${boat.id}`} className="relative flex items-center gap-4 mx-3 px-4 py-4 bg-white rounded-2xl" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
      <button onClick={(e) => { e.preventDefault(); onUnfavorite(boat.id); }} className="absolute top-3 right-3 z-10">
        <IconStar size={22} color="#f5a623" fill="#f5a623" />
      </button>
      {/* Boat thumbnail */}
      <div className="rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 88, height: 88, backgroundColor: "#e8e8e8" }}>
        {boat.photo_url
          ? <img src={boat.photo_url} alt={boat.boat_name} className="w-full h-full object-cover" />
          : <IconAnchor size={28} color="#ccc" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[17px] font-bold text-gray-900 truncate">{boat.boat_name}</p>
          {boat.boat_class && (
            <span className="text-[13px] px-2.5 py-0.5 rounded-md font-medium flex-shrink-0" style={{ backgroundColor: "#ebebeb", color: "#555" }}>
              {boat.boat_class}
            </span>
          )}
        </div>
        {boat.home_port && <p className="text-[14px] text-gray-400 mb-1">{boat.home_port}</p>}
        {boat.skipper_name && (
          <div className="flex items-center gap-1.5">
            <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 22, height: 22, backgroundColor: "#d8d8d8" }}>
              {boat.skipper_photo_url
                ? <img src={boat.skipper_photo_url} alt={boat.skipper_name} className="w-full h-full object-cover" />
                : <IconUser size={12} color="#aaa" />}
            </div>
            <p className="text-[14px] font-semibold text-gray-700">{boat.skipper_name}</p>
          </div>
        )}
      </div>

      {/* Right: open positions badge */}
      {openPositions > 0 && (
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="flex items-center justify-center rounded-full" style={{ width: 36, height: 36, backgroundColor: "#dce9ff" }}>
            <span className="text-[15px] font-bold" style={{ color: "#0161F0" }}>{openPositions}</span>
          </div>
          <p className="text-[11px] text-gray-400 text-center leading-tight">Open<br/>Positions</p>
        </div>
      )}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24">
      <IconStar size={40} color="#e0e0e0" />
      <p className="text-sm font-medium text-gray-400 text-center mt-4">No favorites yet</p>
      <p className="text-xs text-gray-400 text-center mt-1">Boats you favorite will appear here.</p>
      <Link href="/crew/feed" className="mt-5 text-xs font-medium" style={{ color: "#0161f0" }}>Browse boats →</Link>
    </div>
  );
}

export default function CrewFavoritesPage() {
  const { user } = useAuth();
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    loadFavorites();
  }, [user]);

  async function loadFavorites() {
    const { data } = await supabase
      .from("crew_favorites")
      .select("boat_id, boat_profiles(*, regattas(regatta_positions(id, status)))")
      .eq("crew_id", user.id)
      .order("created_at", { ascending: false });
    setBoats((data || []).map((row) => row.boat_profiles).filter(Boolean));
    setLoading(false);
  }

  async function handleUnfavorite(boatId) {
    await supabase.from("crew_favorites").delete().eq("crew_id", user.id).eq("boat_id", boatId);
    setBoats((prev) => prev.filter((b) => b.id !== boatId));
  }

  const q = query.toLowerCase().trim();
  const filtered = q
    ? boats.filter((b) =>
        b.boat_name?.toLowerCase().includes(q) ||
        b.home_port?.toLowerCase().includes(q) ||
        b.boat_class?.toLowerCase().includes(q)
      )
    : boats;

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0" style={{ borderBottom: "1px solid #e8e8e8" }}>
        <ProfileSwitcher className="lg:hidden" />
        <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: "#f0f0f0" }} onClick={() => inputRef.current?.focus()}>
          <IconSearch size={14} color="#aaa" className="flex-shrink-0" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Boat name, class or location…"
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
            {filtered.map((boat) => (
              <BoatCard key={boat.id} boat={boat} onUnfavorite={handleUnfavorite} />
            ))}
          </div>
        )}
        </div>
      </main>

      <CrewNavFooter active="Favorites" />
    </div>
  );
}
