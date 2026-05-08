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
} from "@tabler/icons-react";

// Sample crew data for the boat owner to browse
const crewMembers = [
  {
    id: 1,
    name: "Andre Peixoto",
    location: "San Francisco, CA",
    positions: ["Jib Trimmer", "Spin Trimmer"],
    level: "Mid-Level",
    kroo: 15,
    favorites: 31,
    following: 10,
    photo: "/boat-image-placeholder.png",
  },
  {
    id: 2,
    name: "Sara Lopes",
    location: "Oakland, CA",
    positions: ["Tactician", "Helm"],
    level: "Advanced",
    kroo: 28,
    favorites: 44,
    following: 19,
    photo: "/boat-image-placeholder.png",
  },
  {
    id: 3,
    name: "Mike Chen",
    location: "Sausalito, CA",
    positions: ["Bowman"],
    level: "Entry Level",
    kroo: 6,
    favorites: 12,
    following: 5,
    photo: "/boat-image-placeholder.png",
  },
  {
    id: 4,
    name: "Julia Martins",
    location: "Berkeley, CA",
    positions: ["Main Trimmer", "Jib Trimmer"],
    level: "Mid-Level",
    kroo: 20,
    favorites: 37,
    following: 14,
    photo: "/boat-image-placeholder.png",
  },
];

function NavFooter({ active }) {
  const items = [
    { label: "Home", href: "/boat/feed", icon: <IconAnchor size={22} /> },
    { label: "Regattas", href: "/boat/regattas", icon: <IconCalendarEvent size={22} /> },
    { label: "Message", href: "/boat/messages", icon: <IconMessage size={22} /> },
    { label: "Following", href: "/boat/following", icon: <IconStar size={22} /> },
    { label: "Profile", href: "/boat/profile", icon: <IconUser size={22} /> },
  ];
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex items-center justify-around px-2 py-2 border-t"
      style={{ backgroundColor: "#fff", borderColor: "#e5e5e5" }}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center gap-1 text-xs"
          style={{ color: active === item.label ? "#111" : "#aaa" }}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function CrewCard({ member }) {
  return (
    <div className="flex flex-col gap-2 px-4 py-4 border-b" style={{ borderColor: "#e5e5e5" }}>
      <div className="flex items-center gap-3">
        <Image
          src={member.photo}
          alt={member.name}
          width={64}
          height={64}
          className="rounded-full object-cover"
          style={{ width: 64, height: 64 }}
        />
        <div>
          <p className="font-semibold text-base text-gray-900">{member.name}</p>
          <p className="text-sm text-gray-500">{member.location}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {member.positions.map((pos) => (
              <span
                key={pos}
                className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{ backgroundColor: "#E8EDF8", color: "#0161f0" }}
              >
                {pos}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600">{member.level}</p>
      <div className="flex gap-6 text-sm text-gray-700">
        <div className="flex flex-col items-center">
          <span className="font-semibold">{member.kroo}</span>
          <span className="text-gray-400 text-xs">Kroo</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-semibold">{member.favorites}</span>
          <span className="text-gray-400 text-xs">Favorites</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-semibold">{member.following}</span>
          <span className="text-gray-400 text-xs">Following</span>
        </div>
      </div>
    </div>
  );
}

export default function BoatFeedPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#e5e5e5" }}>
        <Image src="/kroo-logo.png" alt="Kroo" width={60} height={24} />
        <div
          className="flex items-center gap-1.5 flex-1 mx-3 px-3 py-1.5 rounded-full text-xs text-gray-400"
          style={{ backgroundColor: "#f0f0f0" }}
        >
          <IconSearch size={14} color="#aaa" />
          <span>Search</span>
        </div>
        <IconPlus size={22} color="#111" />
      </header>

      {/* Crew Cards Feed */}
      <main className="flex-1">
        {crewMembers.map((member) => (
          <CrewCard key={member.id} member={member} />
        ))}
      </main>

      <NavFooter active="Home" />
    </div>
  );
}
