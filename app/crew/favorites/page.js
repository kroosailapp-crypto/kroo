"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconStar,
  IconSearch,
  IconPlus,
} from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";

const initialFavoritedBoats = [
  {
    id: 1,
    name: "Dilema",
    location: "Salvador, BA",
    boatClass: "Melges 24",
    nextRegatta: "Rolex Big Boat Series, 07/25/26",
    positions: 3,
    followers: 40,
    skipper: "Linda Petterson",
    photo: "/boat-image.jpeg",
  },
  {
    id: 3,
    name: "Wild Card",
    location: "Newport, RI",
    boatClass: "Etchells",
    nextRegatta: "Newport Regatta, 09/05/26",
    positions: 1,
    followers: 55,
    skipper: "Tom Walsh",
    photo: "/boat-image.jpeg",
  },
];

function BoatCard({ boat, onUnfavorite }) {
  return (
    <div className="flex flex-col">

      {/* Boat name + location + class tag + star */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <Link href={`/boat/${boat.id}`} className="flex-1">
          <p className="font-bold text-lg text-gray-900">{boat.name}</p>
          <p className="text-xs text-gray-500">{boat.location}</p>
        </Link>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2.5 py-1 rounded-lg font-bold"
            style={{ backgroundColor: "#E8EDF8", color: "#111" }}
          >
            {boat.boatClass}
          </span>
          <button onClick={onUnfavorite} className="flex-shrink-0">
            <IconStar size={18} color="#08FF00" fill="#08FF00" />
          </button>
        </div>
      </div>

      {/* Boat Photo */}
      <Link href={`/boat/${boat.id}`}>
        <div className="relative w-full h-48">
          <Image src={boat.photo} alt={boat.name} fill className="object-cover" />
        </div>
      </Link>

      {/* Regatta + Stats + Skipper */}
      <Link href={`/boat/${boat.id}`} className="px-4 py-3">
        <p className="text-xs text-gray-400 mb-0.5">Next regatta</p>
        <p className="text-sm font-medium text-gray-900 mb-3">{boat.nextRegatta}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-5">
            <div>
              <p className="text-base font-semibold text-gray-900">{boat.positions}</p>
              <p className="text-[11px] text-gray-500">Positions</p>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{boat.followers}</p>
              <p className="text-[11px] text-gray-500">Followers</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: "#0161f0" }}
            >
              {boat.skipper.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">{boat.skipper}</p>
              <p className="text-[11px] text-gray-400">Skipper</p>
            </div>
          </div>
        </div>
      </Link>

    </div>
  );
}

export default function CrewFavoritesPage() {
  const [favorites, setFavorites] = useState(initialFavoritedBoats);

  function removeFavorite(id) {
    setFavorites((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0">
        <Image src="/kroo-logo-blue.svg" alt="Kroo" width={52} height={20} />
        <div
          className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-gray-400"
          style={{ backgroundColor: "#f0f0f0" }}
        >
          <IconSearch size={14} color="#aaa" />
          <span>Search</span>
        </div>
        <IconPlus size={22} color="#111" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-24">
            <IconStar size={40} color="#e0e0e0" />
            <p className="text-sm text-gray-400 text-center mt-4">No favorites yet.</p>
            <p className="text-xs text-gray-400 text-center mt-1">Boats you favorite will appear here.</p>
            <Link href="/crew/feed" className="mt-4 text-xs font-medium" style={{ color: "#0161f0" }}>
              Browse boats →
            </Link>
          </div>
        ) : (
          favorites.map((boat, i) => (
            <div key={boat.id}>
              <BoatCard boat={boat} onUnfavorite={() => removeFavorite(boat.id)} />
              {i < favorites.length - 1 && (
                <div className="h-2" style={{ backgroundColor: "#F6F6F6" }} />
              )}
            </div>
          ))
        )}
      </main>

      <CrewNavFooter active="Favorites" />
    </div>
  );
}
