import Link from "next/link";
import Image from "next/image";
import { IconUser, IconSearch } from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";

const conversations = [
  {
    id: 1,
    name: "Andre Peixoto",
    role: "Jib Trimmer",
    lastMessage: "Sounds good, I'll be there!",
    time: "2m ago",
    unread: 2,
    photo: null,
  },
  {
    id: 2,
    name: "Sara Lopes",
    role: "Tactician",
    lastMessage: "What time does the race start?",
    time: "1h ago",
    unread: 0,
    photo: null,
  },
  {
    id: 4,
    name: "Julia Martins",
    role: "Main Trimmer",
    lastMessage: "Thanks for the invite!",
    time: "Yesterday",
    unread: 0,
    photo: null,
  },
  {
    id: 3,
    name: "Mike Chen",
    role: "Bowman",
    lastMessage: "I'm interested in the position.",
    time: "2d ago",
    unread: 0,
    photo: null,
  },
];

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
}

export default function BoatMessages() {
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

      <p className="px-4 pt-2 pb-1 text-xs text-gray-400">Messages with crew</p>

      <main className="flex-1 overflow-y-auto">
        {conversations.map((c, i) => (
          <div key={c.id}>
            <Link href={`/boat/messages/${c.id}`} className="flex items-center gap-3 px-4 py-3.5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 50, height: 50, backgroundColor: "#d8d8d8" }}
                >
                  <IconUser size={22} color="#aaa" />
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
                <p className="text-xs text-gray-400 mb-0.5">{c.role}</p>
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

      <BoatNavFooter active="Message" />
    </div>
  );
}
