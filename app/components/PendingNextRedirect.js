"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { consumeNext } from "@/lib/next-redirect";

// After a visitor from a share link finishes sign-up / login, send them back
// to the profile they came from.
export default function PendingNextRedirect() {
  const router = useRouter();
  const { user, crewProfile, boatProfile, profilesLoaded } = useAuth();

  useEffect(() => {
    if (!user || !profilesLoaded || !(crewProfile || boatProfile)) return;
    const next = consumeNext();
    if (next) router.replace(next);
  }, [user, profilesLoaded, crewProfile, boatProfile, router]);

  return null;
}
