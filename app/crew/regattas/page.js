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
} from "@tabler/icons-react";

const myRegattas = [
  {
    id: 1,
    status: "confirmed",
    name: "2026 The Great Vallejo Race",
    date: "05/12/2026",
    location: "San Francisco, CA",
    position: "Bow",
    boatName: "Flyer",
    boatLocation: "San Francisco",
    boatPhoto: null,
    skipperName: "Gordon Petterson",
    skipperPhoto: null,
  },
  {
    id: 2,
    status: "applied",
    name: "Rolex Big Boat Series",
    date: "07/25/2026",
    location: "San Francisco, CA",
    position: "Spin Trimmer",
    boatName: "Bravura",
    boatLocation: "San Francisco",
    boatPhoto: null,
    skipperName: "Carlos Mendes",
    skipperPhoto: null,
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

function StatusTag({ status }) {
  const confirmed = status === "confirmed";
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-lg"
      style={{
        backgroundColor: confirmed ? "#111" : "#fff7e6",
        color: confirmed ? "#fff" : "#b96b00",
      }}
    >
      {confirmed ? "Confirmed" : "Applied"}
    </span>
  );
}

function RegattaCard({ regatta }) {
  const isConfirmed = regatta.status === "confirmed";

  return (
    <div className="px-4 py-5">
      {/* Date + location */}
      <p className="text-xs text-gray-400 mb-1">{regatta.date}, {regatta.location}</p>

      {/* Regatta name */}
      <p className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{regatta.name}</p>

      {/* Position tag + status tag */}
      <div className="flex items-center gap-2 mb-4">
        <Tag label={regatta.position} />
        <StatusTag status={regatta.status} />
      </div>

      {/* Boat + Skipper row */}
      <div className="flex gap-4 mb-5">
        {/* Boat */}
        <div className="flex items-center gap-2.5 flex-1">
          <div
            className="rounded-xl flex-shrink-0 overflow-hidden"
            style={{ width: 48, height: 48, backgroundColor: "#e0e0e0" }}
          >
            {regatta.boatPhoto && (
              <Image src={regatta.boatPhoto} alt={regatta.boatName} width={48} height={48} className="object-cover w-full h-full" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{regatta.boatName}</p>
            <p className="text-xs text-gray-400">{regatta.boatLocation}</p>
          </div>
        </div>

        {/* Skipper */}
        <div className="flex items-center gap-2.5 flex-1">
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{ width: 48, height: 48, backgroundColor: "#d8d8d8" }}
          >
            {regatta.skipperPhoto ? (
              <Image src={regatta.skipperPhoto} alt={regatta.skipperName} width={48} height={48} className="object-cover w-full h-full rounded-full" />
            ) : (
              <IconUser size={20} color="#aaa" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{regatta.skipperName}</p>
            <p className="text-xs text-gray-400">Skipper</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {isConfirmed ? (
          <>
            <button
              className="flex-1 py-2 rounded-full text-sm font-medium border"
              style={{ color: "#111", borderColor: "#d0d0d0" }}
            >
              Cancel
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: "#024BB9" }}
            >
              <IconMessage size={13} /> Send Message
            </button>
          </>
        ) : (
          <>
            <button
              className="flex-1 py-2 rounded-full text-sm font-medium border"
              style={{ color: "#111", borderColor: "#d0d0d0" }}
            >
              Withdraw
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: "#024BB9" }}
            >
              <IconMessage size={13} /> Send Message
            </button>
          </>
        )}
      </div>
    </div>
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
        {myRegattas.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-20">
            <p className="text-sm text-gray-400 text-center">No regattas yet. Apply from a boat's profile.</p>
            <Link href="/crew/feed" className="mt-4 text-xs font-medium" style={{ color: "#0161f0" }}>
              Browse boats →
            </Link>
          </div>
        ) : (
          myRegattas.map((regatta, i) => (
            <div key={regatta.id}>
              <RegattaCard regatta={regatta} />
              {i < myRegattas.length - 1 && (
                <div className="h-2" style={{ backgroundColor: "#F6F6F6" }} />
              )}
            </div>
          ))
        )}
      </main>

      <NavFooter active="Regattas" />
    </div>
  );
}
