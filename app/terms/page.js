"use client";
import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";

export default function TermsPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 flex-shrink-0">
        <button onClick={() => router.back()}>
          <IconArrowLeft size={22} color="#fff" />
        </button>
        <p className="text-sm font-semibold text-white">Terms of Use</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white text-sm font-medium tracking-wide">Coming Soon</p>
      </div>
    </div>
  );
}
