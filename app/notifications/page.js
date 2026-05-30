"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

const CREW_SETTINGS = [
  {
    key: "new_message",
    label: "New Message",
    description: "When a boat sends you a message",
  },
  {
    key: "new_invite",
    label: "New Regatta Invite",
    description: "When a boat invites you to race",
  },
  {
    key: "regatta_confirmation",
    label: "Regatta Confirmation",
    description: "When a boat confirms you as crew",
  },
  {
    key: "regatta_cancelled",
    label: "Regatta Cancelled",
    description: "When a confirmed regatta spot is cancelled",
  },
];

const BOAT_SETTINGS = [
  {
    key: "new_message",
    label: "New Message",
    description: "When a sailor sends you a message",
  },
  {
    key: "new_application",
    label: "New Crew Application",
    description: "When a sailor applies for a position",
  },
  {
    key: "crew_cancelled",
    label: "Crew Cancelled",
    description: "When a sailor cancels a confirmed position",
  },
];

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="relative flex-shrink-0 rounded-full"
      style={{
        width: 51,
        height: 31,
        backgroundColor: enabled ? "#0161F0" : "#d0d0d0",
        transition: "background-color 0.2s",
      }}
    >
      <span
        className="absolute rounded-full bg-white shadow"
        style={{
          width: 25,
          height: 25,
          top: 3,
          left: 3,
          transform: enabled ? "translateX(22px)" : "translateX(0px)",
          transition: "transform 0.2s",
        }}
      />
    </button>
  );
}

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
}

function NotificationsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileType = searchParams.get("from") === "boat" ? "boat" : "crew";
  const { user } = useAuth();
  const [prefs, setPrefs] = useState({
    new_message: true,
    new_invite: true,
    regatta_confirmation: true,
    regatta_cancelled: true,
    new_application: true,
    crew_cancelled: true,
  });
  const [loading, setLoading] = useState(true);

  const settings = profileType === "boat" ? BOAT_SETTINGS : CREW_SETTINGS;
  const table = profileType === "boat" ? "boat_profiles" : "crew_profiles";

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from(table)
        .select("notification_prefs")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.notification_prefs) {
        setPrefs((prev) => ({ ...prev, ...data.notification_prefs }));
      }
      setLoading(false);
    }
    load();
  }, [user]);

  async function toggle(key, value) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await supabase
      .from(table)
      .update({ notification_prefs: next })
      .eq("id", user.id);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div
        className="flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0"
        style={{ borderColor: "#e8e8e8" }}
      >
        <button onClick={() => router.back()}>
          <IconArrowLeft size={22} color="#111" />
        </button>
        <p className="text-sm font-semibold text-gray-900">Notifications</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <p className="px-4 pt-5 pb-3 text-xs text-gray-400">Email Notifications</p>
        <Divider />

        {settings.map((setting) => (
          <div key={setting.key}>
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{setting.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{setting.description}</p>
              </div>
              <Toggle
                enabled={prefs[setting.key] ?? true}
                onChange={(val) => toggle(setting.key, val)}
              />
            </div>
            <Divider />
          </div>
        ))}

        <p className="px-4 pt-4 text-xs text-gray-400 leading-relaxed">
          Notifications are sent to the email address associated with your account.
        </p>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-sm text-gray-400">Loading…</p></div>}>
      <NotificationsInner />
    </Suspense>
  );
}
