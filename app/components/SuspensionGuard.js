"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

// Suspended users can still sign in, but they're kept on their own profile
// (where the suspension banner is shown) and a few help/legal pages.
const ALLOWED = [
  "/crew/profile", "/boat/profile",
  "/contact", "/terms", "/privacy", "/help",
  "/account/delete",
  "/crew/login", "/boat/login", "/forgot-password", "/reset-password",
];

export default function SuspensionGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, suspended, profilesLoaded, crewProfile, boatProfile } = useAuth();

  useEffect(() => {
    if (!user || !profilesLoaded || !suspended) return;
    if (ALLOWED.some((p) => pathname === p || pathname.startsWith(p + "/"))) return;
    router.replace(crewProfile || !boatProfile ? "/crew/profile" : "/boat/profile");
  }, [user, profilesLoaded, suspended, pathname, crewProfile, boatProfile, router]);

  return null;
}
