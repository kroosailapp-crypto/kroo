"use client";
import Image from "next/image";
import Link from "next/link";
import {
  IconAnchor,
  IconCalendarEvent,
  IconMessage,
  IconStar,
  IconUser,
  IconSearch,
  IconCheck,
} from "@tabler/icons-react";

const confirmedRegattas = [
  {
    id: 1,
    name: "2026 The Great Vallejo Race",
    date: "05/12/2026",
    location: "San Francisco, CA",
    boatName: "Dilema",
    position: "Jib Trimmer",
    skipper: "Linda Petterson",
  },
  {
    id: 2,
    name: "Rolex Big Boat Series",
    date: "07/25/2026",
    location: "San Francisco, CA",
    boatName: "Bravura",
    position: "Spin Trimmer",
    skipper: "Carlos Mendes",
  },
];

function NavFooter({ active }) {
  const items = [
    { label: "Home", href: "/crew/feed", icon: <IconAnchor size={22} /> },
    { label: "Regattas", href: "/crew/regattas", icon: <IconCalendarEvent size={22} /> },
    { label: "Message", href: "/crew/messages", icon: <IconMessage size={22} /> },
    { label: "Favorites", href: "/crew/favorites", icon: <IconStar size={22} /> },
    { label: "Profile", href: "/crew/profile", icon: <IconUser size={22} /> },
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
          style={{ color: active === item.label ? "#111" : "#aaa" }}
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
      className="px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap"
      style={{ backgroundColor: "#E8EDF8", color: "#111" }}
    >
      {label}
    </span>
  );
}

export default function CrewRegattas() {
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
      </div>

      <main className="flex-1 overflow-y-auto">

        {confirmedRegattas.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-20">
            <p className="text-sm text-gray-400 text-center">You haven't been selected for any regattas yet.</p>
            <Link href="/crew/feed" className="mt-4 text-xs font-medium" style={{ color: "#0161f0" }}>
              Browse boats →
            </Link>
          </div>
        ) : (
          confirmedRegattas.map((regatta, i) => (
            <div key={regatta.id}>
              <div className="px-4 py-4">
                {/* Date + location */}
                <p className="text-xs text-gray-400 mb-0.5">{regatta.date}, {regatta.location}</p>

                {/* Regatta name */}
                <p className="text-xl font-bold text-gray-900 mb-3">{regatta.name}</p>

                {/* Confirmed card */}
                <div className="rounded-xl p-3" style={{ backgroundColor: "#f5f5f5" }}>
                  <div className="flex items-center gap-3">
                    {/* Boat thumbnail */}
                    <div
                      className="rounded-xl flex-shrink-0"
                      style={{ width: 46, height: 46, backgroundColor: "#d8d8d8" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">{regatta.boatName}</p>
                      <p className="text-xs text-gray-500 mb-2">{regatta.skipper} · Skipper</p>
                      <Tag label={regatta.position} />
                    </div>
                    {/* Confirmed badge */}
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{ width: 28, height: 28, backgroundColor: "#111" }}
                      >
                        <IconCheck size={15} color="white" strokeWidth={2.5} />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-500">Confirmed</span>
                    </div>
                  </div>
                </div>
              </div>
              {i < confirmedRegattas.length - 1 && (
                <div className="h-2" style={{ backgroundColor: "#f5f5f5" }} />
              )}
            </div>
          ))
        )}

      </main>

      <NavFooter active="Regattas" />
    </div>
  );
}
