"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronDown, IconUser, IconAnchor, IconPlus, IconCheck } from "@tabler/icons-react";
import { useAuth } from "@/lib/auth-context";

export default function ProfileSwitcher() {
  const { crewProfile, boatProfile, profilesLoaded } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const pathname = usePathname();

  const isBoatSide = pathname.startsWith("/boat");
  const isCrewSide = pathname.startsWith("/crew");

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-0.5"
      >
        <Image src="/kroo-logo-blue.svg" alt="Kroo" width={52} height={20} />
        <IconChevronDown
          size={14}
          color="#0161f0"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
        />
      </button>

      {open && (
        <div
          className="absolute top-9 left-0 bg-white rounded-2xl py-1 z-50 min-w-[200px]"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.12)", border: "1px solid #f0f0f0" }}
        >
          {/* Boat profile row */}
          {boatProfile && (
            <Link
              href="/boat/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 34, height: 34, backgroundColor: "#e0e0e0" }}>
                {boatProfile.photo_url
                  ? <img src={boatProfile.photo_url} alt="" className="w-full h-full object-cover" />
                  : <IconAnchor size={16} color="#bbb" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{boatProfile.boat_name}</p>
                <p className="text-xs text-gray-400">Boat</p>
              </div>
              {isBoatSide && <IconCheck size={14} color="#0161f0" />}
            </Link>
          )}

          {/* Crew profile row */}
          {crewProfile && (
            <Link
              href="/crew/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 34, height: 34, backgroundColor: "#d8d8d8" }}>
                {crewProfile.avatar_url
                  ? <img src={crewProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <IconUser size={16} color="#aaa" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{crewProfile.name}</p>
                <p className="text-xs text-gray-400">Sailor</p>
              </div>
              {isCrewSide && <IconCheck size={14} color="#0161f0" />}
            </Link>
          )}

          {/* Divider if at least one profile exists */}
          {profilesLoaded && (boatProfile || crewProfile) && (!boatProfile || !crewProfile) && (
            <div className="h-px mx-4 my-1" style={{ backgroundColor: "#f0f0f0" }} />
          )}

          {/* Create sailor profile — only show once we know for sure there's no crew profile */}
          {profilesLoaded && !crewProfile && (
            <Link
              href="/crew/signup"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 34, height: 34, backgroundColor: "#EEF4FF" }}>
                <IconPlus size={15} color="#0161f0" />
              </div>
              <p className="text-sm font-medium" style={{ color: "#0161f0" }}>Create Sailor Profile</p>
            </Link>
          )}

          {/* Create boat profile — only show once we know for sure there's no boat profile */}
          {profilesLoaded && !boatProfile && (
            <Link
              href="/boat/signup"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ width: 34, height: 34, backgroundColor: "#EEF4FF" }}>
                <IconPlus size={15} color="#0161f0" />
              </div>
              <p className="text-sm font-medium" style={{ color: "#0161f0" }}>Create Boat Profile</p>
            </Link>
          )}

          {/* Loading state — profiles not yet fetched */}
          {!profilesLoaded && (
            <div className="px-4 py-3">
              <p className="text-xs text-gray-400">Loading…</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
