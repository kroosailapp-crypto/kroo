import Image from "next/image";
import { IconUser, IconLock } from "@tabler/icons-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { RedirectIfSignedIn, GateButton } from "../../ShareActions";

// Never cache: turning "public profile" off must take effect immediately.
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kroofinder.com";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Only whitelisted fields ever leave the server. Weight, sex, "about", links,
// availability and history stay behind the sign-up wall.
async function getPublicSailor(id) {
  if (!UUID.test(id)) return null;
  const { data: sailor, error } = await supabaseAdmin
    .from("crew_profiles")
    .select("id, name, location, avatar_url, experience_level, positions, boat_classes, is_public")
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("Share page: could not load sailor", error);
  if (!sailor || !sailor.is_public) return null;
  sailor.name = (sailor.name || "").trim();

  // Hide banned owners
  const { data: owner } = await supabaseAdmin.auth.admin.getUserById(id);
  if (owner?.user?.banned_until && new Date(owner.user.banned_until) > new Date()) return null;

  return sailor;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const sailor = await getPublicSailor(id);
  const metadataBase = new URL(APP_URL);
  const robots = { index: false, follow: false };

  if (!sailor) return { metadataBase, robots, title: "Kroo - Find Your Crew" };

  const title = `${sailor.name} is a sailor on Kroo Finder`;
  const description =
    [sailor.experience_level, sailor.location, (sailor.positions || []).slice(0, 3).join(", ")]
      .filter(Boolean)
      .join(" · ") || "Join Kroo Finder to connect with racing sailboats and crew.";
  const images = [sailor.avatar_url || `${APP_URL}/kroo-finder-logo.png`];

  return {
    metadataBase,
    robots,
    title,
    description,
    openGraph: { title, description, images, type: "website", siteName: "Kroo Finder" },
    twitter: { card: "summary", title, description, images },
  };
}

export default async function SharedSailorPage({ params }) {
  const { id } = await params;
  const sailor = await getPublicSailor(id);
  const next = `/crew/${id}`;

  if (!sailor) {
    return (
      <div className="flex flex-col min-h-screen bg-white px-5 py-5 items-center justify-center gap-5">
        <RedirectIfSignedIn to={next} />
        <Image src="/kroo-finder.svg" alt="Kroo Finder" width={100} height={72} />
        <div className="flex flex-col items-center gap-3 text-center max-w-[300px]">
          <div className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, backgroundColor: "#f0f2f5" }}>
            <IconLock size={26} color="#888" />
          </div>
          <p className="text-lg font-bold text-gray-900">This profile is private</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            The owner isn&apos;t sharing this profile publicly. Create a free Kroo Finder account to find boats and crew.
          </p>
        </div>
        <GateButton
          next="/boat/feed"
          href="/boat/signup"
          className="w-full max-w-[300px] px-6 py-3 rounded-2xl text-sm font-semibold text-white"
          style={{ backgroundColor: "#0161f0" }}
        >
          Sign up
        </GateButton>
      </div>
    );
  }

  const positions = sailor.positions || [];
  const classes = sailor.boat_classes || [];

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#f5f5f5" }}>
      <RedirectIfSignedIn to={next} />

      {/* Header */}
      <div className="bg-white flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #e8e8e8" }}>
        <Image src="/kroo-finder.svg" alt="Kroo Finder" width={72} height={52} />
        <GateButton
          next={next}
          href="/boat/login"
          className="text-sm font-semibold"
          style={{ color: "#0161f0" }}
        >
          Log in
        </GateButton>
      </div>

      <div className="flex flex-col gap-3 px-3 pt-3 pb-10 max-w-[800px] mx-auto w-full">
        {/* Sailor card */}
        <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <div className="flex gap-4 items-start">
            <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 90, height: 90, backgroundColor: "#d8d8d8" }}>
              {sailor.avatar_url
                ? <img src={sailor.avatar_url} alt={sailor.name} className="w-full h-full object-cover" />
                : <IconUser size={32} color="#aaa" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-gray-400 mb-0.5">{sailor.location}</p>
              <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                <p className="text-[17px] font-bold text-gray-900">{sailor.name}</p>
                {sailor.experience_level && (
                  <p className="text-[13px] text-gray-400">{sailor.experience_level}</p>
                )}
              </div>
              {positions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {positions.map((pos) => (
                    <span key={pos} className="text-[13px] px-3 py-1 rounded-md font-semibold" style={{ backgroundColor: "#111", color: "#fff" }}>{pos}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <GateButton
            next={next}
            href="/boat/signup"
            className="mt-4 w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold border"
            style={{ color: "#0161F0", borderColor: "#0161F0", backgroundColor: "#fff" }}
          >
            Sign up to message
          </GateButton>
        </div>

        {/* Boat classes sailed */}
        {classes.length > 0 && (
          <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <p className="text-[13px] text-gray-400 mb-3">Boat Classes Sailed</p>
            <div className="flex flex-wrap gap-2">
              {classes.map((cls) => (
                <span key={cls} className="text-[14px] px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "#f0f2f5", color: "#444" }}>{cls}</span>
              ))}
            </div>
          </div>
        )}

        {/* Sign-up call to action */}
        <div className="rounded-2xl px-5 py-6 flex flex-col items-center gap-3 text-center" style={{ backgroundColor: "#02123e" }}>
          <p className="text-base font-semibold text-white">Join Kroo Finder to connect with {sailor.name}</p>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            Create a free account to message sailors and find crew for your boat.
          </p>
          <GateButton
            next={next}
            href="/boat/signup"
            className="w-full max-w-[280px] px-6 py-3 rounded-2xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#4caf50" }}
          >
            Create free account
          </GateButton>
        </div>
      </div>
    </div>
  );
}
