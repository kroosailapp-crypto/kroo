import Image from "next/image";
import Link from "next/link";

// Sample boat data for crew to browse
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
    { label: "Home", href: "/crew/feed", icon: "🏠" },
    { label: "Regattas", href: "/crew/regattas", icon: "📅" },
    { label: "Message", href: "/crew/messages", icon: "💬" },
    { label: "Following", href: "/crew/following", icon: "⭐" },
    { label: "Profile", href: "/crew/profile", icon: "👤" },
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
          style={{ color: active === item.label ? "#0161f0" : "#888" }}
        >
          <span className="text-xl">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function BoatCard({ boat }) {
  return (
    <div className="flex flex-col border-b mb-2" style={{ borderColor: "#e5e5e5" }}>
      {/* Boat Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="font-bold text-lg text-gray-900">{boat.name}</p>
          <p className="text-sm text-gray-500">{boat.location}</p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ backgroundColor: "#e8efff", color: "#0161f0" }}
        >
          {boat.boatClass}
        </span>
      </div>

      {/* Boat Photo */}
      <div className="relative w-full h-48">
        <Image
          src={boat.photo}
          alt={boat.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Regatta & Info */}
      <div className="px-4 py-3">
        <p className="text-xs text-gray-500 mb-1">Next regatta</p>
        <p className="text-sm font-medium text-gray-900 mb-3">{boat.nextRegatta}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-6 text-sm">
            <div className="flex flex-col items-center">
              <span className="font-semibold text-gray-900">{boat.positions}</span>
              <span className="text-gray-400 text-xs">Positions</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold text-gray-900">{boat.followers}</span>
              <span className="text-gray-400 text-xs">Followers</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: "#0161f0" }}
            >
              {boat.skipper.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">{boat.skipper}</p>
              <p className="text-xs text-gray-400">Skipper</p>
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
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#e5e5e5" }}>
        <Image src="/kroo-logo.png" alt="Kroo" width={60} height={24} />
        <div
          className="flex items-center gap-2 flex-1 mx-4 px-3 py-2 rounded-full text-sm text-gray-400"
          style={{ backgroundColor: "#f6f6f6" }}
        >
          <span>🔍</span>
          <span>Search</span>
        </div>
        <button className="text-gray-700 text-xl font-light">+</button>
      </header>

      {/* Boat Cards Feed */}
      <main className="flex-1">
        {boats.map((boat) => (
          <BoatCard key={boat.id} boat={boat} />
        ))}
      </main>

      <NavFooter active="Home" />
    </div>
  );
}
