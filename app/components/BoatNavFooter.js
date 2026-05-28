"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconAnchor,
  IconCalendarEvent,
  IconMessage,
  IconStar,
} from "@tabler/icons-react";

function BoatProfileIcon({ color = "currentColor", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.7979 2C11.0164 2 11.2286 2.07606 11.3971 2.21507C12.1421 2.82939 13.8267 4.53671 14.8677 6.6829C15.3944 7.76868 15.8507 9.23012 16.1591 10.6517C16.4657 12.065 16.6469 13.5349 16.5709 14.6324C16.5367 15.1256 16.1268 15.5081 15.6324 15.5083H10.9339V17.0588C10.9339 17.5786 10.5124 17.9999 9.99273 18H4.35303C4.02113 18 3.71386 17.8248 3.5442 17.5395C3.3747 17.2543 3.36743 16.9009 3.52582 16.6094L9.05156 6.43842V2.94118C9.05156 2.42138 9.47294 2 9.99273 2H10.7979ZM5.93575 16.1176H9.05156V10.3824L5.93575 16.1176ZM10.9339 13.6259H14.6903C14.6497 12.8824 14.5223 11.9834 14.3199 11.0506C14.0309 9.71805 13.6138 8.41183 13.1738 7.5046C12.5487 6.21584 11.6317 5.09296 10.9339 4.36581V13.6259Z"
        fill={color}
      />
    </svg>
  );
}
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function BoatNavFooter({ active }) {
  const { user } = useAuth();
  const [hasMessageNotif, setHasMessageNotif] = useState(false);
  const [hasRegattaNotif, setHasRegattaNotif] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function checkNotifs() {
      // Unread messages
      const { count: msgCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .is("read_at", null);
      setHasMessageNotif(msgCount > 0);

      // Applied invitations on the boat's regattas
      const { data: regs } = await supabase
        .from("regattas")
        .select("id")
        .eq("boat_id", user.id);
      if (regs?.length > 0) {
        const ids = regs.map((r) => r.id);
        const { count: appliedCount } = await supabase
          .from("invitations")
          .select("*", { count: "exact", head: true })
          .eq("status", "applied")
          .in("regatta_id", ids);
        setHasRegattaNotif(appliedCount > 0);
      } else {
        setHasRegattaNotif(false);
      }
    }

    checkNotifs();

    // Realtime: new messages arriving
    const msgChannel = supabase
      .channel("boat-nav-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        () => setHasMessageNotif(true)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        async () => {
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("receiver_id", user.id)
            .is("read_at", null);
          setHasMessageNotif(count > 0);
        }
      )
      .subscribe();

    // Realtime: invitation status changed to applied
    const invChannel = supabase
      .channel("boat-nav-invitations")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "invitations" },
        () => checkNotifs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(invChannel);
    };
  }, [user]);

  const items = [
    { label: "Home", href: "/boat/feed", icon: (color) => <IconAnchor size={22} color={color} /> },
    { label: "Regattas", href: "/boat/regattas", icon: (color) => <IconCalendarEvent size={22} color={color} /> },
    { label: "Message", href: "/boat/messages", icon: (color) => <IconMessage size={22} color={color} /> },
    { label: "Favorites", href: "/boat/favorites", icon: (color) => <IconStar size={22} color={color} /> },
    { label: "Profile", href: "/boat/profile", icon: (color) => <BoatProfileIcon size={22} color={color} /> },
  ];

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex items-center justify-around px-2 pt-2 pb-1 border-t"
      style={{ backgroundColor: "#fff", borderColor: "#e8e8e8" }}
    >
      {items.map((item) => {
        const isActive = active === item.label;
        const color = isActive ? "#111" : "#aaa";
        const showDot =
          (item.label === "Message" && hasMessageNotif) ||
          (item.label === "Regattas" && hasRegattaNotif);
        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-0.5 text-[12px]"
            style={{ color }}
          >
            <div className="relative">
              {item.icon(color)}
              {showDot && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#0161F0" }}
                />
              )}
            </div>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
