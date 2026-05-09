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

const favoritedCrew = [
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
          style={{ color: item.label === "Favorites" ? "#111" : "#aaa" }}
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
    <Link
      href={`/crew/${member.id}`}
      className="flex gap-3.5 px-4 py-4 items-start"
      style={{ borderColor: "#e8e8e8" }}
    >
      <Image
        src={member.photo}
        alt={member.name}
        width={64}
        height={64}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: 64, height: 64 }}
      />
      <div className="flex-1">
        <div className="flex items-start justify-between mb-0.5">
          <p className="font-semibold text-base text-gray-900">{member.name}</p>
          <IconStar size={18} color="#08FF00" fill="#08FF00" />
        </div>
        <p className="text-xs text-gray-500 mb-1.5">{member.location}</p>
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {member.positions.map((pos) => (
            <span
              key={pos}
              className="text-xs px-2.5 py-1 rounded-lg font-bold"
              style={{ backgroundColor: "#E8EDF8", color: "#111" }}
            >
              {pos}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mb-2">{member.level}</p>
        <div className="flex gap-5">
          <div>
            <p className="text-base font-semibold text-gray-900">{member.kroo}</p>
            <p className="text-[11px] text-gray-500">Kroo</p>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">{member.favorites}</p>
            <p className="text-[11px] text-gray-500">Favorites</p>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">{member.following}</p>
            <p className="text-[11px] text-gray-500">Following</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BoatFavoritesPage() {
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
        {favoritedCrew.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-24">
            <IconStar size={40} color="#e0e0e0" />
            <p className="text-sm text-gray-400 text-center mt-4">No favorites yet.</p>
            <p className="text-xs text-gray-400 text-center mt-1">Crew you favorite will appear here.</p>
            <Link href="/boat/feed" className="mt-4 text-xs font-medium" style={{ color: "#0161f0" }}>
              Browse crew →
            </Link>
          </div>
        ) : (
          favoritedCrew.map((member, i) => (
            <div key={member.id}>
              <CrewCard member={member} />
              {i < favoritedCrew.length - 1 && (
                <div className="h-2" style={{ backgroundColor: "#F6F6F6" }} />
              )}
            </div>
          ))
        )}
      </main>

      <NavFooter />
    </div>
  );
}
