"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import { IconStar, IconSearch, IconX, IconUser } from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
}

function Tag({ label }) {
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-lg font-bold"
      style={{ backgroundColor: "#E8EDF8", color: "#111" }}
    >
      {label}
    </span>
  );
}

function CrewCard({ member, onUnfavorite }) {
  return (
    <div className="flex items-start gap-3.5 px-4 py-4">
      <Link href={`/crew/${member.id}`}>
        <div
          className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ width: 64, height: 64, backgroundColor: "#d8d8d8" }}
        >
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <IconUser size={24} color="#aaa" />
          )}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/crew/${member.id}`}>
          <p className="font-semibold text-base text-gray-900">{member.name}</p>
        </Link>
        <p className="text-xs text-gray-500 mb-1.5">{member.location}</p>
        <div className="flex flex-wrap gap-1.5 mb-1">
          {(member.positions || []).slice(0, 3).map((pos) => (
            <Tag key={pos} label={pos} />
          ))}
        </div>
        <p className="text-xs text-gray-400">{member.experience_level}</p>
      </div>
      <button onClick={() => onUnfavorite(member.id)} className="flex-shrink-0 pt-1">
        <IconStar size={20} color="#0161f0" fill="#0161f0" />
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24">
      <IconStar size={40} color="#e0e0e0" />
      <p className="text-sm font-medium text-gray-400 text-center mt-4">No favorites yet</p>
      <p className="text-xs text-gray-400 text-center mt-1">Crew you favorite will appear here.</p>
      <Link href="/boat/feed" className="mt-5 text-xs font-medium" style={{ color: "#0161f0" }}>
        Browse crew →
      </Link>
    </div>
  );
}

export default function BoatFavoritesPage() {
  const { user } = useAuth();
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    loadFavorites();
  }, [user]);

  async function loadFavorites() {
    const { data } = await supabase
      .from("boat_favorites")
      .select("crew_id, crew_profiles(*)")
      .eq("boat_owner_id", user.id)
      .order("created_at", { ascending: false });
    setCrew((data || []).map((row) => row.crew_profiles).filter(Boolean));
    setLoading(false);
  }

  async function handleUnfavorite(crewId) {
    await supabase
      .from("boat_favorites")
      .delete()
      .eq("boat_owner_id", user.id)
      .eq("crew_id", crewId);
    setCrew((prev) => prev.filter((m) => m.id !== crewId));
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
            placeholder="Name, position or location…"
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
        {(() => {
          const q = query.toLowerCase().trim();
          const filtered = q
            ? crew.filter(
                (m) =>
                  m.name?.toLowerCase().includes(q) ||
                  m.location?.toLowerCase().includes(q) ||
                  (m.positions || []).some((p) => p.toLowerCase().includes(q))
              )
            : crew;
          if (loading) return (
            <div className="flex items-center justify-center py-24">
              <p className="text-sm text-gray-400">Loading…</p>
            </div>
          );
          if (filtered.length === 0) return <EmptyState />;
          return filtered.map((member, i) => (
            <div key={member.id}>
              <CrewCard member={member} onUnfavorite={handleUnfavorite} />
              {i < filtered.length - 1 && <Divider />}
            </div>
          ));
        })()}
      </main>

      <BoatNavFooter active="Favorites" />
    </div>
  );
}
