"use client";
import Link from "next/link";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useAuth } from "@/lib/auth-context";

// Shown at the top of a suspended user's profile.
export default function SuspendedBanner() {
  const { suspended } = useAuth();
  if (!suspended) return null;
  return (
    <div className="px-4 py-3 flex items-start gap-3" style={{ backgroundColor: "#f59e0b" }}>
      <IconAlertTriangle size={20} color="white" className="flex-shrink-0 mt-0.5" />
      <div className="text-white text-[14px] leading-snug">
        <p className="font-bold">Your Account Has Been Suspended</p>
        <p className="mt-0.5">
          For spam or misuse of the platform. Your profile is hidden from other users.{" "}
          <Link href="/contact" className="underline font-semibold">
            Contact us to ask for more information
          </Link>
        </p>
      </div>
    </div>
  );
}
