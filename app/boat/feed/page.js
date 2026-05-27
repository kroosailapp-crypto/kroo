"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import { IconSearch, IconX, IconUser } from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
import { supabase } from "@/lib/supabase";

function CrewCard({ member }) {
  return (
    <Link href={`/crew/${member.id}`} className="flex gap-3.5 px-4 py-4 items-start">
      <div
        className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ width: 64, height: 64, backgroundColor: "#d8d8d8" }}
      >
        {member.avatar_url ? (
          <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <IconUser size={24} color="#aaa" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">{member.location}</p>
        <p className="font-semibold text-base text-gray-900 mb-0.5">{member.name}</p>
        <p className="text-xs text-gray-400 mb-1.5">{member.experience_level}</p>
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {(member.positions || []).slice(0, 3).map((pos) => (
            <span
              key={pos}
              className="text-xs px-2.5 py-1 rounded-lg font-bold"
              style={{ backgroundColor: "#111", color: "#fff" }}
            >
              {pos}
            </span>
          ))}
        </div>
        {(member.sex || member.weight_lbs) && (
          <div className="flex flex-wrap gap-1.5">
            {member.sex && (
              <span className="text-xs px-2.5 py-1 rounded-lg font-bold" style={{ backgroundColor: "#E8EDF8", color: "#111" }}>
                {member.sex}
              </span>
            )}
            {member.weight_lbs && (
              <span className="text-xs px-2.5 py-1 rounded-lg font-bold" style={{ backgroundColor: "#E8EDF8", color: "#111" }}>
                {member.weight_lbs} lbs
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ query }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24">
      <IconUser size={40} color="#e0e0e0" />
      {query ? (
        <>
          <p className="text-sm font-medium text-gray-400 text-center mt-4">No results for "{query}"</p>
          <p className="text-xs text-gray-400 text-center mt-1">Try a different name, position, or location.</p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-400 text-center mt-4">No sailors yet</p>
          <p className="text-xs text-gray-400 text-center mt-1">Crew members who sign up will appear here.</p>
        </>
      )}
    </div>
  );
}

export default function BoatFeedPage() {
  const [crew, setCrew] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("crew_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setCrew(data || []);
      setLoading(false);
    }
    load();
  }, []);

  // Filter: name, position, location
  const q = query.toLowerCase().trim();
  const filtered = q
    ? crew.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.location?.toLowerCase().includes(q) ||
          (m.positions || []).some((p) => p.toLowerCase().includes(q))
      )
    : crew;

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, position or location…"
            className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder-gray-400 min-w-0"
          />
          {query && (
            <button onClick={() => setQuery("")} className="flex-shrink-0">
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
        ) : filtered.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          filtered.map((member, i) => (
            <div key={member.id}>
              <CrewCard member={member} />
              {i < filtered.length - 1 && (
                <div className="h-px mx-4" style={{ backgroundColor: "#f0f0f0" }} />
              )}
            </div>
          ))
        )}
      </main>

      <BoatNavFooter active="Home" />
    </div>
  );
}
