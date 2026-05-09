import Image from "next/image";
import Link from "next/link";
import {
  IconAnchor,
  IconCalendarEvent,
  IconMessage,
  IconStar,
  IconUser,
  IconSearch,
  IconCircleCheck,
} from "@tabler/icons-react";

const regattas = [
  {
    id: 1,
    name: "2026 The Great Vallejo Race",
    date: "05/12/2026",
    location: "San Francisco, CA",
    positions: [
      {
        id: 1,
        role: "Mainsail Trimmer",
        level: "All levels",
        status: "open",
        applicants: 4,
        crew: null,
      },
      {
        id: 2,
        role: "Tactician",
        level: "All levels",
        status: "open",
        applicants: 0,
        crew: null,
      },
      {
        id: 3,
        role: "Spin Trimmer",
        level: "Mid-Level",
        status: "filled",
        applicants: 0,
        crew: { name: "Andre Peixoto", level: "Mid-Level" },
      },
      {
        id: 4,
        role: "Jib Trimmer",
        level: "Mid-Level",
        status: "filled",
        applicants: 0,
        crew: { name: "Andre Peixoto", level: "Mid-Level" },
      },
    ],
  },
  {
    id: 2,
    name: "Rolex Big Boat Series",
    date: "07/25/2026",
    location: "San Francisco, CA",
    positions: [
      {
        id: 1,
        role: "Bowman",
        level: "All levels",
        status: "open",
        applicants: 4,
        crew: null,
      },
      {
        id: 2,
        role: "Spin Trimmer",
        level: "Mid Level – 2–5 years",
        status: "open",
        applicants: 0,
        crew: null,
      },
    ],
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

function RegattaCard({ regatta }) {
  return (
    <div className="py-4">
      {/* Date + location + name */}
      <div className="px-4 mb-3">
        <p className="text-xs text-gray-400 mb-0.5">{regatta.date}, {regatta.location}</p>
        <Link href={`/crew/regattas/${regatta.id}`} className="text-xl font-bold text-gray-900">
          {regatta.name}
        </Link>
      </div>

      <Divider />

      {/* Positions */}
      {regatta.positions.map((pos) => (
        <div key={pos.id}>
          <div className="px-4 py-3">
            {/* Position row */}
            <div className="flex items-center gap-2">
              <Tag label={pos.role} />
              {pos.status === "open" && pos.applicants > 0 && (
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: "#e53935" }}
                >
                  {pos.applicants}
                </span>
              )}
              <span className="text-xs text-gray-500 flex-1">{pos.level}</span>
              {pos.status === "open" && (
                <button
                  className="text-xs font-semibold px-4 py-1.5 rounded-full text-white flex-shrink-0"
                  style={{ backgroundColor: "#0161f0" }}
                >
                  Apply
                </button>
              )}
              {pos.status === "filled" && (
                <IconCircleCheck size={20} color="#111" className="flex-shrink-0" />
              )}
            </div>

            {/* Filled: simple crew row */}
            {pos.status === "filled" && pos.crew && (
              <div className="flex items-center gap-2.5 mt-2 pl-1">
                <div
                  className="rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ width: 32, height: 32, backgroundColor: "#d8d8d8" }}
                >
                  <IconUser size={15} color="#aaa" />
                </div>
                <p className="text-sm text-gray-800">{pos.crew.name}</p>
                <p className="text-xs text-gray-400">{pos.crew.level}</p>
              </div>
            )}
          </div>
          <Divider />
        </div>
      ))}

      {/* View regatta link */}
      <div className="px-4 pt-3 pb-1">
        <Link
          href={`/crew/regattas/${regatta.id}`}
          className="text-xs font-medium"
          style={{ color: "#0161f0" }}
        >
          View Regatta
        </Link>
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
        {regattas.map((regatta, i) => (
          <div key={regatta.id}>
            <RegattaCard regatta={regatta} />
            {i < regattas.length - 1 && (
              <div className="h-2" style={{ backgroundColor: "#f5f5f5" }} />
            )}
          </div>
        ))}
      </main>

      <NavFooter active="Regattas" />
    </div>
  );
}
