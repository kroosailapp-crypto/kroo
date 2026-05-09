"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconSearch, IconPlus, IconAnchor, IconUser } from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";
import { supabase } from "@/lib/supabase";

function BoatCard({ boat }) {
  return (
    <Link href={`/boat/${boat.id}`} className="flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="font-bold text-lg text-gray-900">{boat.boat_name}</p>
          <p className="text-xs text-gray-500">{boat.home_port}</p>
        </div>
        {boat.boat_class && (
          <span className="text-xs px-2.5 py-1 rounded-lg font-bold" style={{ backgroundColor: "#E8EDF8", color: "#111" }}>
            {boat.boat_class}
          </span>
        )}
      </div>

      {/* Boat photo */}
      <div className="relative w-full h-48 flex items-center justify-center" style={{ backgroundColor: "#f0f0f0" }}>
        {boat.photo_url
          ? <img src={boat.photo_url} alt={boat.boat_name} className="w-full h-full object-cover" />
          : <IconAnchor size={40} color="#ccc" />}
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-5">
            <div>
              <p className="text-base font-semibold text-gray-900">{(boat.positions_needed || []).length}</p>
              <p className="text-[11px] text-gray-500">Positions</p>
            </div>
          </div>

          {boat.skipper_name && (
            <div className="flex items-center gap-2">
              <div className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, backgroundColor: "#d8d8d8" }}>
                {boat.skipper_photo_url
                  ? <img src={boat.skipper_photo_url} alt={boat.skipper_name} className="w-full h-full object-cover" />
                  : <IconUser size={16} color="#aaa" />}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">{boat.skipper_name}</p>
                <p className="text-[11px] text-gray-400">Skipper</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24">
      <IconAnchor size={40} color="#e0e0e0" />
      <p className="text-sm font-medium text-gray-400 text-center mt-4">No boats yet</p>
      <p className="text-xs text-gray-400 text-center mt-1">Boats looking for crew will appear here.</p>
    </div>
  );
}

export default function CrewFeedPage() {
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("boat_profiles").select("*").order("created_at", { ascending: false });
      setBoats(data || []);
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
        ) : boats.length === 0 ? (
          <EmptyState />
        ) : (
          boats.map((boat, i) => (
            <div key={boat.id}>
              <BoatCard boat={boat} />
              {i < boats.length - 1 && <div className="h-2" style={{ backgroundColor: "#F6F6F6" }} />}
            </div>
          ))
        )}
      </main>

      <CrewNavFooter active="Home" />
    </div>
  );
}
