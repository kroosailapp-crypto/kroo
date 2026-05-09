"use client";
import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconAnchor,
  IconCalendarEvent,
  IconMessage,
  IconStar,
  IconUser,
  IconArrowLeft,
  IconFlag,
} from "@tabler/icons-react";

// In a real app this would be fetched from a database by ID.
// For now we use sample data.
const crewProfiles = {
  1: {
    name: "Andre Peixoto",
    location: "San Francisco, CA",
    positions: ["Jib Trimmer", "Spin Trimmer", "Main Trimmer"],
    level: "Mid-Level",
    kroo: 15,
    favorites: 31,
    following: 10,
    photo: "/boat-image-placeholder.png",
    availability: ["March 12–15, 2026", "April 3–6, 2026", "May 20–22, 2026"],
    regattas: [
      "2026 Snipe Masters – San Diego",
      "2026 SoCal Ocean Series – Santa Barbara",
      "2026 Nationals – San Francisco",
    ],
    classes: ["Melges 24", "Snipe", "J/24", "470"],
    bio: "Passionate racer with 10+ years of competitive sailing. Comfortable on boats from dinghies to offshore. Always looking for the next regatta.",
    website: "www.boatlink.com",
  },
  2: {
    name: "Sara Lopes",
    location: "Oakland, CA",
    positions: ["Tactician", "Helm"],
    level: "Advanced",
    kroo: 28,
    favorites: 44,
    following: 19,
    photo: "/boat-image-placeholder.png",
    availability: ["April 10–14, 2026", "June 1–5, 2026"],
    regattas: ["2026 Bay Regatta – San Francisco", "2026 Pacific Cup"],
    classes: ["J/105", "Farr 40", "Etchells"],
    bio: "Experienced tactician and helm. 15 years of offshore and inshore racing up and down the West Coast.",
    website: "",
  },
  3: {
    name: "Mike Chen",
    location: "Sausalito, CA",
    positions: ["Bowman"],
    level: "Entry Level",
    kroo: 6,
    favorites: 12,
    following: 5,
    photo: "/boat-image-placeholder.png",
    availability: ["May 5–8, 2026"],
    regattas: ["2026 Tuesday Night Series – Oakland"],
    classes: ["J/24", "Lightning"],
    bio: "New to racing but eager to learn. Available most weekends in the Bay Area.",
    website: "",
  },
  4: {
    name: "Julia Martins",
    location: "Berkeley, CA",
    positions: ["Main Trimmer", "Jib Trimmer"],
    level: "Mid-Level",
    kroo: 20,
    favorites: 37,
    following: 14,
    photo: "/boat-image-placeholder.png",
    availability: ["March 20–23, 2026", "May 12–15, 2026"],
    regattas: ["2026 Nationals – San Francisco", "2026 Rolex Big Boat Series"],
    classes: ["Melges 24", "J/70", "Snipe"],
    bio: "Trimmer with a strong background in one-design racing. Love the Melges 24 circuit.",
    website: "juliasails.com",
  },
};

function NavFooter() {
  const items = [
    { label: "Home", href: "/boat/feed", icon: <IconAnchor size={22} /> },
    { label: "Regattas", href: "/boat/regattas", icon: <IconCalendarEvent size={22} /> },
    { label: "Message", href: "/boat/messages", icon: <IconMessage size={22} /> },
    { label: "Favorites", href: "/boat/favorites", icon: <IconStar size={22} /> },
    { label: "Profile", href: "/boat/profile", icon: <IconUser size={22} /> },
  ];
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex items-center justify-around px-2 pt-2 pb-1 border-t"
      style={{ backgroundColor: "#fff", borderColor: "#e8e8e8" }}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center gap-0.5 text-[10px]"
          style={{ color: "#aaa" }}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
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

export default function CrewPublicProfile({ params }) {
  const { id } = use(params);
  const profile = crewProfiles[id] ?? crewProfiles[1];
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">

      {/* Header with back arrow */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link href="/boat/feed">
          <IconArrowLeft size={22} color="#111" />
        </Link>
        <p className="text-sm font-medium text-gray-800">{profile.name}</p>
      </div>

      <div className="overflow-y-auto flex-1">

        {/* Avatar + Info */}
        <div className="flex gap-3.5 px-4 py-3 items-start">
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{ width: 105, height: 105, backgroundColor: "#d8d8d8" }}
          >
            <IconUser size={32} color="#aaa" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold mb-0.5 text-gray-900">{profile.name}</p>
            <p className="text-xs text-gray-500 mb-2">{profile.location}</p>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {profile.positions.map((pos) => (
                <Tag key={pos} label={pos} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mb-2.5">{profile.level}</p>
            <div className="flex gap-5">
              <div>
                <p className="text-base font-semibold text-gray-900">{profile.kroo}</p>
                <p className="text-[11px] text-gray-500">Kroo</p>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">{profile.favorites}</p>
                <p className="text-[11px] text-gray-500">Favorites</p>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">{profile.following}</p>
                <p className="text-[11px] text-gray-500">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 px-4 pb-3">
          <Link
            href="/boat/messages"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "#024BB9" }}
          >
            <IconMessage size={13} /> Message
          </Link>
          <button
            onClick={() => setIsFavorited((f) => !f)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "#024BB9" }}
          >
            <IconStar size={13} color={isFavorited ? "#08FF00" : "white"} fill={isFavorited ? "#08FF00" : "none"} />
            {isFavorited ? "Unfavorite" : "Favorite"}
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "#0161F0" }}
          >
            <IconFlag size={13} /> Invite to Race
          </button>
        </div>

        <Divider />

        {/* Availability */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">Availability</p>
          {profile.availability.map((date) => (
            <p key={date} className="text-sm text-gray-800 mb-1.5">{date}</p>
          ))}
        </div>

        <Divider />

        {/* Interested Regattas */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">Interested Regattas</p>
          {profile.regattas.map((r) => (
            <p key={r} className="text-sm text-gray-800 mb-1.5">{r}</p>
          ))}
        </div>

        <Divider />

        {/* Boat Classes */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">Boat Classes Sailed</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.classes.map((cls) => (
              <Tag key={cls} label={cls} />
            ))}
          </div>
        </div>

        <Divider />

        {/* About */}
        <div className="px-4 py-3 pb-8">
          <p className="text-xs text-gray-400 mb-2">About</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">{profile.bio}</p>
          {profile.website ? (
            <p className="text-sm" style={{ color: "#007AFF" }}>{profile.website}</p>
          ) : null}
        </div>

      </div>

      <NavFooter />
    </div>
  );
}
