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

const boats = [
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
    id: 2,
    name: "Bravura",
    location: "San Francisco, CA",
    boatClass: "J/24",
    nextRegatta: "Bay Regatta, 08/10/26",
    positions: 2,
    followers: 27,
    skipper: "Carlos Mendes",
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

function NavFooter({ active }) {
  const items = [
    { label: "Home", href: "/crew/feed", icon: <IconAnchor size={22} /> },
    { label: "Regattas", href: "/crew/regattas", icon: <IconCalendarEvent size={22} /> },
    { label: "Message", href: "/crew/messages", icon: <IconMessage size={22} /> },
    { label: "Following", href: "/crew/following", icon: <IconStar size={22} /> },
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

function BoatCard({ boat }) {
  return (
    <div className="flex flex-col border-b" style={{ borderColor: "#e8e8e8" }}>

      {/* Boat name + location + class tag */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="font-bold text-lg text-gray-900">{boat.name}</p>
          <p className="text-xs text-gray-500">{boat.location}</p>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-lg font-bold"
          style={{ backgroundColor: "#E8EDF8", color: "#111" }}
        >
          {boat.boatClass}
        </span>
      </div>

      {/* Boat Photo */}
      <div className="relative w-full h-48">
        <Image src={boat.photo} alt={boat.name} fill className="object-cover" />
      </div>

      {/* Regatta + Stats + Skipper */}
      <div className="px-4 py-3">
        <p className="text-xs text-gray-400 mb-0.5">Next regatta</p>
        <p className="text-sm font-medium text-gray-900 mb-3">{boat.nextRegatta}</p>

        <div className="flex items-center justify-between">
          {/* Stats — left-aligned, same format as profiles */}
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

          {/* Skipper */}
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
      </div>

    </div>
  );
}

export default function CrewFeedPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">

      {/* Header — matches profile pages */}
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

      <main className="flex-1">
        {boats.map((boat) => (
          <BoatCard key={boat.id} boat={boat} />
        ))}
      </main>

      <NavFooter active="Home" />
    </div>
  );
}
