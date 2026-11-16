"use client";
import React, { useState, useEffect, useRef } from "react";
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
import ProfileSwitcher from "@/app/components/ProfileSwitcher";

export default function CrewNavFooter({ active }) {
  const { user } = useAuth();
  const [hasMessageNotif, setHasMessageNotif] = useState(false);
  const [hasRegattaNotif, setHasRegattaNotif] = useState(false);
  const activeRef = useRef(active);

  // Keep activeRef current so realtime callbacks never use a stale value
  useEffect(() => { activeRef.current = active; }, [active]);

  // Clear dot immediately when user is on the respective page
  useEffect(() => {
    if (active === "Message") {
      setHasMessageNotif(false);
      try { localStorage.setItem("kroo_crew_messages_viewed", new Date().toISOString()); } catch {}
    }
    if (active === "My Regattas") {
      setHasRegattaNotif(false);
      try { localStorage.setItem("kroo_crew_regattas_viewed", new Date().toISOString()); } catch {}
    }
  }, [active]);

  useEffect(() => {
    if (!user) return;

    async function checkNotifs() {
      // Messages: only show dot for messages that arrived after the user last visited the messages page
      if (activeRef.current !== "Message") {
        let msgLastView;
        try { msgLastView = localStorage.getItem("kroo_crew_messages_viewed") || new Date(0).toISOString(); } catch { msgLastView = new Date(0).toISOString(); }
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", user.id)
          .is("read_at", null)
          .gt("created_at", msgLastView);
        setHasMessageNotif((count || 0) > 0);
      }

      // Regattas: pending invitations newer than the last time user visited the page
      if (activeRef.current !== "My Regattas") {
        let lastView;
        try { lastView = localStorage.getItem("kroo_crew_regattas_viewed") || new Date(0).toISOString(); } catch { lastView = new Date(0).toISOString(); }
        const { count } = await supabase
          .from("invitations")
          .select("*", { count: "exact", head: true })
          .eq("crew_id", user.id)
          .eq("status", "pending")
          .gt("created_at", lastView);
        setHasRegattaNotif((count || 0) > 0);
      }
    }

    checkNotifs();

    const msgChannel = supabase
      .channel("crew-nav-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        () => { if (activeRef.current !== "Message") setHasMessageNotif(true); }
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        async () => {
          if (activeRef.current !== "Message") {
            let msgLastView;
            try { msgLastView = localStorage.getItem("kroo_crew_messages_viewed") || new Date(0).toISOString(); } catch { msgLastView = new Date(0).toISOString(); }
            const { count } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("receiver_id", user.id).is("read_at", null).gt("created_at", msgLastView);
            setHasMessageNotif((count || 0) > 0);
          }
        }
      )
      .subscribe();

    const invChannel = supabase
      .channel("crew-nav-invitations")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "invitations", filter: `crew_id=eq.${user.id}` },
        () => { if (activeRef.current !== "My Regattas") setHasRegattaNotif(true); }
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "invitations", filter: `crew_id=eq.${user.id}` },
        async () => {
          if (activeRef.current !== "My Regattas") {
            let lastView;
            try { lastView = localStorage.getItem("kroo_crew_regattas_viewed") || new Date(0).toISOString(); } catch { lastView = new Date(0).toISOString(); }
            const { count } = await supabase.from("invitations").select("*", { count: "exact", head: true }).eq("crew_id", user.id).eq("status", "pending").gt("created_at", lastView);
            setHasRegattaNotif((count || 0) > 0);
          }
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
    { label: "My Regattas", href: "/crew/regattas", icon: <IconCalendarEvent size={22} /> },
    { label: "Message", href: "/crew/messages", icon: <IconMessage size={22} /> },
    { label: "Favorites", href: "/crew/favorites", icon: <IconStar size={22} /> },
    { label: "Profile", href: "/crew/profile", icon: <IconUser size={22} /> },
  ];

  return (
    <nav
      className="
        fixed z-30 bg-white border-t lg:border-t-0 lg:border-r
        bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex flex-row items-center justify-around px-2 pt-2 pb-1
        lg:left-0 lg:top-0 lg:translate-x-0 lg:w-[220px] lg:max-w-none lg:h-full lg:flex-col lg:items-stretch lg:justify-start lg:px-4 lg:pt-6 lg:pb-6 lg:gap-1
      "
      style={{ borderColor: "#e8e8e8" }}
    >
      <div className="hidden lg:flex items-center gap-2 px-2 pb-6">
        <ProfileSwitcher />
      </div>

      {items.map((item) => {
        const isActive = active === item.label;
        const color = isActive ? "#111" : "#aaa";
        const showDot =
          (item.label === "Message" && hasMessageNotif) ||
          (item.label === "My Regattas" && hasRegattaNotif);
        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-0.5 text-[12px] lg:flex-row lg:gap-3 lg:px-3 lg:py-3 lg:rounded-xl lg:text-sm"
            style={{ color }}
          >
            <div className="relative flex-shrink-0">
              {React.cloneElement(item.icon, { color })}
              {showDot && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#0161F0" }}
                />
              )}
            </div>
            <span className={isActive ? "font-semibold" : ""}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
