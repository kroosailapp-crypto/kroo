"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconSearch, IconPlus, IconUser } from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
import { supabase } from "@/lib/supabase";

function CrewCard({ member }) {
  return (
    <Link href={`/crew/${member.id}`} className="flex gap-3.5 px-4 py-4 items-start">
      <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 64, height: 64, backgroundColor: "#d8d8d8" }}>
        {member.avatar_url
          ? <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
          : <IconUser size={24} color="#aaa" />}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-base text-gray-900">{member.name}</p>
        <p className="text-xs text-gray-500 mb-1.5">{member.location}</p>
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {(member.positions || []).slice(0, 3).map((pos) => (
            <span key={pos} className="text-xs px-2.5 py-1 rounded-lg font-bold" style={{ backgroundColor: "#E8EDF8", color: "#111" }}>
              {pos}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400">{member.experience_level}</p>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24">
      <IconUser size={40} color="#e0e0e0" />
      <p className="text-sm font-medium text-gray-400 text-center mt-4">No sailors yet</p>
      <p className="text-xs text-gray-400 text-center mt-1">Crew members who sign up will appear here.</p>
    </div>
  );
}

export default function BoatFeedPage() {
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("crew_profiles").select("*").order("created_at", { ascending: false });
      setCrew(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0">
        <Image src="/kroo-logo-blue.svg" alt="Kroo" width={52} height={20} />
        <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-gray-400" style={{ backgroundColor: "#f0f0f0" }}>
          <IconSearch size={14} color="#aaa" />
          <span>Search</span>
        </div>
        <IconPlus size={22} color="#111" />
      </div>

      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : crew.length === 0 ? (
          <EmptyState />
        ) : (
          crew.map((member, i) => (
            <div key={member.id}>
              <CrewCard member={member} />
              {i < crew.length - 1 && <div className="h-2" style={{ backgroundColor: "#F6F6F6" }} />}
            </div>
          ))
        )}
      </main>

      <BoatNavFooter active="Home" />
    </div>
  );
}
