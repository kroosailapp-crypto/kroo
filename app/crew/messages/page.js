import Link from "next/link";
import Image from "next/image";
import {
  IconAnchor,
  IconCalendarEvent,
  IconMessage,
  IconStar,
  IconUser,
  IconSearch,
} from "@tabler/icons-react";

const conversations = [
  {
    id: 1,
    name: "Dilema",
    skipper: "Linda Petterson",
    lastMessage: "Hey Andre! Yes, we'd love to have you on board.",
    time: "2m ago",
    unread: 1,
    photo: "/boat-image.jpeg",
  },
  {
    id: 2,
    name: "Bravura",
    skipper: "Carlos Mendes",
    lastMessage: "We reviewed your application. Interested?",
    time: "3h ago",
    unread: 0,
    photo: "/boat-image.jpeg",
  },
  {
    id: 3,
    name: "Wild Card",
    skipper: "Tom Walsh",
    lastMessage: "Looking for a strong tactician this season.",
    time: "Yesterday",
    unread: 0,
    photo: "/boat-image.jpeg",
  },
];

function NavFooter() {
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
          style={{ color: item.label === "Message" ? "#111" : "#aaa" }}
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

export default function CrewMessages() {
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
          <span>Search messages</span>
        </div>
      </div>

      <p className="px-4 pt-2 pb-1 text-xs text-gray-400">Messages with boats</p>

      <main className="flex-1 overflow-y-auto">
        {conversations.map((c, i) => (
          <div key={c.id}>
            <Link href={`/crew/messages/${c.id}`} className="flex items-center gap-3 px-4 py-3.5">
              {/* Boat photo */}
              <div className="relative flex-shrink-0">
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ width: 50, height: 50, backgroundColor: "#e0e0e0" }}
                >
                  <Image src={c.photo} alt={c.name} width={50} height={50} className="object-cover w-full h-full" />
                </div>
                {c.unread > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: "#0161F0" }}
                  >
                    {c.unread}
                  </span>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                  <p className="text-[11px] text-gray-400 flex-shrink-0 ml-2">{c.time}</p>
                </div>
                <p className="text-xs text-gray-400 mb-0.5">{c.skipper} · Skipper</p>
                <p
                  className="text-xs truncate"
                  style={{ color: c.unread > 0 ? "#111" : "#aaa", fontWeight: c.unread > 0 ? 600 : 400 }}
                >
                  {c.lastMessage}
                </p>
              </div>
            </Link>
            {i < conversations.length - 1 && <Divider />}
          </div>
        ))}
      </main>

      <NavFooter />
    </div>
  );
}
