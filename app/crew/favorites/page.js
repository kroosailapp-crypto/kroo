"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import { IconStar, IconSearch, IconX, IconAnchor, IconUser } from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

function Divider() {
  return <div className="h-2 w-full" style={{ backgroundColor: "#F6F6F6" }} />;
}

function Tag({ label }) {
  return (
    <span
      className="px-2.5 py-1 rounded-lg text-xs font-bold"
      style={{ backgroundColor: "#E8EDF8", color: "#111" }}
    >
      {label}
    </span>
  );
}

function BoatCard({ boat, onUnfavorite }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <Link href={`/boat/${boat.id}`}>
            <p className="font-bold text-lg text-gray-900">{boat.boat_name}</p>
          </Link>
          <p className="text-xs text-gray-500">{boat.home_port}</p>
        </div>
        <div className="flex items-center gap-3">
          {boat.boat_class && <Tag label={boat.boat_class} />}
          <button onClick={() => onUnfavorite(boat.id)}>
            <IconStar size={20} color="#0161f0" fill="#0161f0" />
          </button>
        </div>
      </div>

      <Link href={`/boat/${boat.id}`}>
        <div
          className="relative w-full h-44 flex items-center justify-center"
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
      </Link>

      <div className="px-4 py-3">
        {boat.skipper_name && (
          <div className="flex items-center gap-2">
            <div
              className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ width: 28, height: 28, backgroundColor: "#d8d8d8" }}
            >
              {boat.skipper_photo_url ? (
                <img
                  src={boat.skipper_photo_url}
                  alt={boat.skipper_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <IconUser size={14} color="#aaa" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">{boat.skipper_name}</p>
              <p className="text-[11px] text-gray-400">Skipper</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24">
      <IconStar size={40} color="#e0e0e0" />
      <p className="text-sm font-medium text-gray-400 text-center mt-4">No favorites yet</p>
      <p className="text-xs text-gray-400 text-center mt-1">Boats you favorite will appear here.</p>
      <Link href="/crew/feed" className="mt-5 text-xs font-medium" style={{ color: "#0161f0" }}>
        Browse boats →
      </Link>
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
      .select("boat_id, boat_profiles(*)")
      .eq("crew_id", user.id)
      .order("created_at", { ascending: false });
    setBoats((data || []).map((row) => row.boat_profiles).filter(Boolean));
    setLoading(false);
  }

  async function handleUnfavorite(boatId) {
    await supabase
      .from("crew_favorites")
      .delete()
      .eq("crew_id", user.id)
      .eq("boat_id", boatId);
    setBoats((prev) => prev.filter((b) => b.id !== boatId));
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
            placeholder="Boat name, class or location…"
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
            ? boats.filter(
                (b) =>
                  b.boat_name?.toLowerCase().includes(q) ||
                  b.home_port?.toLowerCase().includes(q) ||
                  b.boat_class?.toLowerCase().includes(q)
              )
            : boats;
          if (loading) return (
            <div className="flex items-center justify-center py-24">
              <p className="text-sm text-gray-400">Loading…</p>
            </div>
          );
          if (filtered.length === 0) return <EmptyState />;
          return filtered.map((boat, i) => (
            <div key={boat.id}>
              <BoatCard boat={boat} onUnfavorite={handleUnfavorite} />
              {i < filtered.length - 1 && <Divider />}
            </div>
          ));
        })()}
      </main>

      <CrewNavFooter active="Favorites" />
    </div>
  );
}
