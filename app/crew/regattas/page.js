"use client";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconSearch, IconCalendar } from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";

export default function CrewRegattas() {
  useEffect(() => {
    localStorage.removeItem("kroo_crew_regatta_notif");
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0">
        <Image src="/kroo-logo-blue.svg" alt="Kroo" width={52} height={20} />
        <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-gray-400" style={{ backgroundColor: "#f0f0f0" }}>
          <IconSearch size={14} color="#aaa" />
          <span>Search</span>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-24">
        <IconCalendar size={40} color="#e0e0e0" />
        <p className="text-sm font-medium text-gray-400 text-center mt-4">No regattas yet</p>
        <p className="text-xs text-gray-400 text-center mt-1">Regattas you apply to will appear here.</p>
        <Link href="/crew/feed" className="mt-5 text-xs font-medium" style={{ color: "#0161f0" }}>
          Browse boats →
        </Link>
      </main>

      <CrewNavFooter active="Regattas" />
    </div>
  );
}
