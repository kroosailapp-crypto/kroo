"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconAnchor,
  IconCalendarEvent,
  IconMessage,
  IconStar,
  IconUser,
} from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function CrewNavFooter({ active }) {
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

      // Pending invitations for this sailor
      const { count: invCount } = await supabase
        .from("invitations")
        .select("*", { count: "exact", head: true })
        .eq("crew_id", user.id)
        .eq("status", "pending");
      setHasRegattaNotif(invCount > 0);
    }

    checkNotifs();

    // Realtime: new messages
    const msgChannel = supabase
      .channel("crew-nav-messages")
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

    // Realtime: new invitation or invitation status changed
    const invChannel = supabase
      .channel("crew-nav-invitations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "invitations", filter: `crew_id=eq.${user.id}` },
        () => setHasRegattaNotif(true)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "invitations", filter: `crew_id=eq.${user.id}` },
        async () => {
          const { count } = await supabase
            .from("invitations")
            .select("*", { count: "exact", head: true })
            .eq("crew_id", user.id)
            .eq("status", "pending");
          setHasRegattaNotif(count > 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(invChannel);
    };
  }, [user]);

  const items = [
    { label: "Home", href: "/crew/feed", icon: <IconAnchor size={22} /> },
    { label: "Regattas", href: "/crew/regattas", icon: <IconCalendarEvent size={22} /> },
    { label: "Message", href: "/crew/messages", icon: <IconMessage size={22} /> },
    { label: "Favorites", href: "/crew/favorites", icon: <IconStar size={22} /> },
    { label: "Profile", href: "/crew/profile", icon: <IconUser size={22} /> },
  ];

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex items-center justify-around px-2 pt-2 pb-1 border-t z-20"
      style={{ backgroundColor: "#fff", borderColor: "#e8e8e8" }}
    >
      {items.map((item) => {
        const showDot =
          (item.label === "Message" && hasMessageNotif) ||
          (item.label === "Regattas" && hasRegattaNotif);
        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-0.5 text-[12px]"
            style={{ color: active === item.label ? "#111" : "#aaa" }}
          >
            <div className="relative">
              {item.icon}
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
