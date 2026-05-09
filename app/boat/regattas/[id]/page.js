import Link from "next/link";
import {
  IconAnchor,
  IconCalendarEvent,
  IconMessage,
  IconStar,
  IconUser,
  IconArrowLeft,
  IconCircleCheck,
} from "@tabler/icons-react";


const regattas = {
  1: {
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
        selectedCrew: { name: "Andre Peixoto", location: "San Francisco, CA" },
        otherApplicants: [
          { name: "Sara Lopes", level: "Advanced" },
          { name: "Mike Chen", level: "Entry Level" },
        ],
      },
      {
        id: 2,
        role: "Bowman",
        level: "All levels",
        status: "open",
        selectedCrew: null,
        otherApplicants: [
          { name: "Julia Martins", level: "Mid-Level" },
          { name: "Tom Walsh", level: "Advanced" },
          { name: "Carlos Mendes", level: "Mid-Level" },
          { name: "Linda Petterson", level: "Advanced" },
        ],
      },
      {
        id: 3,
        role: "Spin Trimmer",
        level: "Mid Level – 2–5 years",
        status: "open",
        selectedCrew: null,
        otherApplicants: [],
      },
    ],
  },
  2: {
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
        selectedCrew: null,
        otherApplicants: [
          { name: "Sara Lopes", level: "Advanced" },
          { name: "Andre Peixoto", level: "Mid-Level" },
        ],
      },
    ],
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
          style={{ color: item.label === "Regattas" ? "#111" : "#aaa" }}
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

function CrewRow({ crew, action }) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b" style={{ borderColor: "#e8e8e8" }}>
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0"
        style={{ width: 42, height: 42, backgroundColor: "#d8d8d8" }}
      >
        <IconUser size={18} color="#aaa" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{crew.name}</p>
        <p className="text-xs text-gray-400">{crew.level}</p>
        {action && (
          <div className="flex items-center gap-3 mt-1.5">
            {action}
          </div>
        )}
      </div>
      <IconStar size={18} color="#ccc" />
    </div>
  );
}

export default function RegattaDetail({ params }) {
  const regatta = regattas[params.id] ?? regattas[1];

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link href="/boat/regattas">
          <IconArrowLeft size={22} color="#111" />
        </Link>
        <p className="text-sm font-medium text-gray-800">Boat Name</p>
      </div>

      <div className="overflow-y-auto flex-1">

        {/* Boat identifier */}
        <div className="flex items-center gap-3 px-4 pb-3">
          <div
            className="rounded-xl flex-shrink-0"
            style={{ width: 36, height: 36, backgroundColor: "#e0e0e0" }}
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">Boat Name</p>
            <p className="text-xs text-gray-400">San Francisco, CA</p>
          </div>
        </div>

        <Divider />

        {/* Regatta name + date */}
        <div className="px-4 pt-4 pb-3">
          <p className="text-xs text-gray-400 mb-0.5">{regatta.date}, {regatta.location}</p>
          <p className="text-xl font-bold text-gray-900 mb-4">{regatta.name}</p>

          {/* Stats */}
          <div className="flex gap-5">
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
        </div>

        <Divider />

        {/* Positions */}
        {regatta.positions.map((pos) => (
          <div key={pos.id}>
            {/* Position header */}
            <div className="flex items-center gap-2 px-4 py-3">
              <Tag label={pos.role} />
              <span className="text-xs text-gray-500 flex-1">{pos.level}</span>
              {pos.status === "filled" && (
                <IconCircleCheck size={20} color="#111" />
              )}
            </div>

            {/* Filled: confirmed crew card */}
            {pos.status === "filled" && pos.selectedCrew && (
              <>
                <div className="mx-4 mb-3 p-3 rounded-xl" style={{ backgroundColor: "#f5f5f5" }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ width: 52, height: 52, backgroundColor: "#d8d8d8" }}
                    >
                      <IconUser size={22} color="#aaa" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">{pos.selectedCrew.name}</p>
                      <p className="text-xs text-gray-500 mb-2">{pos.selectedCrew.location}</p>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-lg text-white"
                        style={{ backgroundColor: "#111" }}
                      >
                        Confirmed
                      </span>
                    </div>
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white flex-shrink-0"
                      style={{ backgroundColor: "#2C65BB" }}
                    >
                      <IconMessage size={13} color="white" /> Message
                    </button>
                  </div>
                </div>

                {pos.otherApplicants.length > 0 && (
                  <>
                    <p className="text-xs text-gray-400 px-4 pb-2">Others interested</p>
                    {pos.otherApplicants.map((crew) => (
                      <CrewRow key={crew.name} crew={crew} />
                    ))}
                  </>
                )}
              </>
            )}

            {/* Open: list of applicants with Select button */}
            {pos.status === "open" && pos.otherApplicants.length > 0 && (
              pos.otherApplicants.map((crew) => (
                <CrewRow
                  key={crew.name}
                  crew={crew}
                  action={
                    <>
                      <button
                        className="text-xs font-medium px-3 py-1 rounded-full text-white"
                        style={{ backgroundColor: "#111" }}
                      >
                        Select
                      </button>
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: "#111" }}
                      >
                        <IconMessage size={13} color="white" /> Message
                      </button>
                    </>
                  }
                />
              ))
            )}

            {/* Open: no applicants */}
            {pos.status === "open" && pos.otherApplicants.length === 0 && (
              <p className="text-xs text-gray-400 px-4 pb-3">No applicants yet</p>
            )}

            <Divider />
          </div>
        ))}

        {/* Actions */}
        <div className="flex items-center gap-4 px-4 py-4 pb-8">
          <button
            className="text-xs font-medium px-3 py-1.5 rounded-full border"
            style={{ color: "#0161f0", borderColor: "#0161f0" }}
          >
            + Add Position
          </button>
          <button
            className="text-xs font-medium"
            style={{ color: "#0161f0" }}
          >
            Edit regatta
          </button>
        </div>

      </div>

      <NavFooter />
    </div>
  );
}
