import Image from "next/image";
import Link from "next/link";
import {
  IconAnchor,
  IconCalendarEvent,
  IconMessage,
  IconStar,
  IconUser,
  IconSearch,
  IconPlus,
  IconCircleCheck,
} from "@tabler/icons-react";

const regattas = [
  {
    id: 1,
    name: "Rolex Big Boat Series",
    date: "07/25/2026",
    location: "San Francisco, CA",
    invited: 5,
    confirmed: 2,
    pending: 2,
    declined: 1,
    positions: [
      {
        id: 1,
        role: "Jib Trimmer",
        level: "Mid Level – 2–5 years",
        status: "filled",
        crew: { name: "Andre Peixoto", level: "Mid-Level" },
        applicants: 3,
      },
      {
        id: 2,
        role: "Bowman",
        level: "All levels",
        status: "open",
        crew: null,
        applicants: 4,
      },
      {
        id: 3,
        role: "Spin Trimmer",
        level: "Mid Level – 2–5 years",
        status: "open",
        crew: null,
        applicants: 0,
      },
    ],
  },
  {
    id: 2,
    name: "Bay Regatta",
    date: "08/10/2026",
    location: "Oakland, CA",
    invited: 2,
    confirmed: 1,
    pending: 1,
    declined: 0,
    positions: [
      {
        id: 1,
        role: "Tactician",
        level: "Advanced",
        status: "open",
        crew: null,
        applicants: 2,
      },
    ],
  },
];

function NavFooter({ active }) {
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
      {/* Regatta name + date */}
      <div className="px-4 mb-3">
        <p className="text-xl font-bold text-gray-900 mb-0.5">{regatta.name}</p>
        <p className="text-xs text-gray-400">{regatta.date} · {regatta.location}</p>
      </div>

      {/* Stats row */}
      <div className="flex gap-5 px-4 mb-4">
        <div>
          <p className="text-base font-semibold text-gray-900">{regatta.invited}</p>
          <p className="text-[11px] text-gray-500">Invited</p>
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900">{regatta.confirmed}</p>
          <p className="text-[11px] text-gray-500">Confirmed</p>
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900">{regatta.pending}</p>
          <p className="text-[11px] text-gray-500">Pending</p>
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900">{regatta.declined}</p>
          <p className="text-[11px] text-gray-500">Declined</p>
        </div>
      </div>

      <Divider />

      {/* Positions */}
      {regatta.positions.map((pos) => (
        <div key={pos.id}>
          <div className="px-4 py-3">
            {/* Position tag + level + status icon */}
            <div className="flex items-center gap-2 mb-2">
              <Tag label={pos.role} />
              <span className="text-xs text-gray-500 flex-1">{pos.level}</span>
              {pos.status === "filled" && (
                <IconCircleCheck size={20} color="#111" />
              )}
            </div>

            {/* Filled: show selected crew */}
            {pos.status === "filled" && pos.crew && (
              <div className="flex items-center gap-2.5 mt-2 p-2.5 rounded-xl border" style={{ borderColor: "#e8e8e8" }}>
                <div
                  className="rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ width: 40, height: 40, backgroundColor: "#d8d8d8" }}
                >
                  <IconUser size={18} color="#aaa" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{pos.crew.name}</p>
                  <p className="text-xs text-gray-400">{pos.crew.level}</p>
                </div>
              </div>
            )}

            {/* Open with applicants: count badge + View button */}
            {pos.status === "open" && pos.applicants > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: "#111" }}
                >
                  {pos.applicants}
                </span>
                <Link
                  href={`/boat/regattas/${regatta.id}`}
                  className="text-xs font-medium px-3 py-1.5 rounded-full text-white"
                  style={{ backgroundColor: "#0161f0" }}
                >
                  View
                </Link>
              </div>
            )}

            {/* Open with no applicants */}
            {pos.status === "open" && pos.applicants === 0 && (
              <p className="text-xs text-gray-400 mt-1">No applicants yet</p>
            )}
          </div>
          <Divider />
        </div>
      ))}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3">
        <button
          className="text-xs font-medium px-3 py-1.5 rounded-full border"
          style={{ color: "#0161f0", borderColor: "#0161f0" }}
        >
          + Add Position
        </button>
        <Link
          href={`/boat/regattas/${regatta.id}`}
          className="text-xs font-medium"
          style={{ color: "#0161f0" }}
        >
          Edit regatta
        </Link>
      </div>
    </div>
  );
}

export default function BoatRegattas() {
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

      {/* Boat identifier */}
      <div className="flex items-center gap-3 px-4 py-2 border-b" style={{ borderColor: "#e8e8e8" }}>
        <div
          className="rounded-xl flex-shrink-0"
          style={{ width: 36, height: 36, backgroundColor: "#e0e0e0" }}
        />
        <div>
          <p className="text-sm font-semibold text-gray-900">Boat Name</p>
          <p className="text-xs text-gray-400">San Francisco, CA</p>
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

        {/* Add regatta CTA */}
        <div className="px-4 py-5">
          <button
            className="text-xs font-medium px-4 py-2 rounded-full border"
            style={{ color: "#0161f0", borderColor: "#0161f0" }}
          >
            + Add Regatta
          </button>
        </div>
      </main>

      <NavFooter active="Regattas" />
    </div>
  );
}
