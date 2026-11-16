"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import { IconSearch, IconX, IconUser } from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
import { supabase } from "@/lib/supabase";
import { fetchAdminIds } from "@/lib/fetch-admin-ids";

function CrewCard({ member }) {
  const positions = member.positions || [];
  const visible = positions.slice(0, 3);
  const overflow = positions.length - visible.length;
  return (
    <Link
      href={`/crew/${member.id}`}
      className="flex gap-4 mx-3 my-2 px-4 py-4 items-start rounded-2xl bg-white"
      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}
    >
      <div
        className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ width: 90, height: 90, backgroundColor: "#d8d8d8" }}
      >
        {member.avatar_url ? (
          <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <IconUser size={32} color="#aaa" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-gray-400 mb-0.5">{member.location}</p>
        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-[17px] font-bold text-gray-900">{member.name}</p>
          {member.experience_level && (
            <p className="text-[13px] text-gray-400">{member.experience_level}</p>
          )}
        </div>
        {(member.sex || member.weight_lbs) && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {member.sex && (
              <span className="text-[13px] px-3 py-1 rounded-md font-medium" style={{ backgroundColor: "#f0f2f5", color: "#444" }}>
                {member.sex}
              </span>
            )}
            {member.weight_lbs && (
              <span className="text-[13px] px-3 py-1 rounded-md font-medium" style={{ backgroundColor: "#f0f2f5", color: "#444" }}>
                {member.weight_lbs} lbs
              </span>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {visible.map((pos) => (
            <span
              key={pos}
              className="text-[13px] px-3 py-1 rounded-md font-semibold"
              style={{ backgroundColor: "#111", color: "#fff" }}
            >
              {pos}
            </span>
          ))}
          {overflow > 0 && (
            <span
              className="text-[13px] px-3 py-1 rounded-md font-semibold"
              style={{ backgroundColor: "#e8e8e8", color: "#555" }}
            >
              +{overflow}
            </span>
          )}
        </div>
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
  const [visibleCount, setVisibleCount] = useState(25);
  const inputRef = useRef(null);

  useEffect(() => {
    async function load() {
      const [{ data }, adminIdList] = await Promise.all([
        supabase.from("crew_profiles").select("*").order("created_at", { ascending: false }),
        fetchAdminIds(),
      ]);
      const adminIds = new Set(adminIdList);
      setCrew((data || []).filter((c) => !adminIds.has(c.id)));
      setLoading(false);
    }
    load();
  }, []);

  // Reset pagination when query changes
  useEffect(() => setVisibleCount(25), [query]);

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

  const visible = filtered.slice(0, visibleCount);

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
        <div className="max-w-[800px] mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <>
            <div className="">
            {visible.map((member, i) => (
              <div key={member.id}>
                <CrewCard member={member} />
              </div>
            ))}
            </div>
            {filtered.length > visibleCount && (
              <div className="flex justify-center py-6">
                <button
                  onClick={() => setVisibleCount((c) => c + 25)}
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

      <BoatNavFooter active="Home" />
    </div>
  );
}
