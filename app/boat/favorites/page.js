"use client";
import Image from "next/image";
import Link from "next/link";
import { IconStar, IconSearch, IconPlus } from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";

export default function BoatFavoritesPage() {
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

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-24">
        <IconStar size={40} color="#e0e0e0" />
        <p className="text-sm font-medium text-gray-400 text-center mt-4">No favorites yet</p>
        <p className="text-xs text-gray-400 text-center mt-1">Crew you favorite will appear here.</p>
        <Link href="/boat/feed" className="mt-5 text-xs font-medium" style={{ color: "#0161f0" }}>
          Browse crew →
        </Link>
      </main>

      <BoatNavFooter active="Favorites" />
    </div>
  );
}
