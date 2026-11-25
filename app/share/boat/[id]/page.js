import Image from "next/image";
import { IconAnchor, IconUser, IconLock } from "@tabler/icons-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { RedirectIfSignedIn, GateButton } from "../../ShareActions";
import ZoomableImage from "@/app/components/ZoomableImage";

// Never cache: turning "public profile" off must take effect immediately.
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.kroofinder.com";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseDate(str) {
  if (!str) return null;
  const [m, d, y] = str.split("/");
  if (!m || !d || !y) return null;
  const date = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
  return isNaN(date) ? null : date;
}

function formatDate(str) {
  const d = parseDate(str);
  return d ? d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : str;
}

// Only whitelisted fields ever leave the server. Contact details, the "about"
// text and everything else stay behind the sign-up wall.
async function getPublicBoat(id) {
  if (!UUID.test(id)) return null;
  const { data: boat } = await supabaseAdmin
    .from("boat_profiles")
    .select("id, boat_name, boat_class, home_port, photo_url, skipper_name, skipper_photo_url, is_public")
    .eq("id", id)
    .maybeSingle();
  if (!boat || !boat.is_public) return null;

  // Hide banned owners
  const { data: owner } = await supabaseAdmin.auth.admin.getUserById(id);
  if (owner?.user?.banned_until && new Date(owner.user.banned_until) > new Date()) return null;
  const { data: suspension } = await supabaseAdmin.from("user_suspensions").select("user_id").eq("user_id", id).maybeSingle();
  if (suspension) return null;

  const { data: regs, error: regsError } = await supabaseAdmin
    .from("regattas")
    .select("id, name, date, location, regatta_positions(role, level, status)")
    .eq("boat_id", id)
    .order("created_at");
  if (regsError) console.error("Share page: could not load regattas", regsError);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const regattas = (regs || [])
    .map((r) => ({
      id: r.id,
      name: r.name,
      date: r.date,
      location: r.location,
      open: (r.regatta_positions || [])
        .filter((p) => p.status === "open")
        .map((p) => ({ role: p.role, level: p.level }))
        .sort((a, b) => a.role.localeCompare(b.role)),
    }))
    .filter((r) => r.open.length > 0)
    .filter((r) => {
      const d = parseDate(r.date);
      return !d || d >= now;
    })
    .sort((a, b) => (parseDate(a.date) || Infinity) - (parseDate(b.date) || Infinity))
    .slice(0, 6);

  return { boat, regattas };
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getPublicBoat(id);
  const metadataBase = new URL(APP_URL);
  const robots = { index: false, follow: false };

  if (!data) {
    return { metadataBase, robots, title: "Kroo - Find Your Crew" };
  }

  const { boat, regattas } = data;
  const openCount = regattas.reduce((n, r) => n + r.open.length, 0);
  const title = `${boat.boat_name} is looking for crew on Kroo Finder`;
  const description = [
    boat.home_port,
    openCount > 0 ? `${openCount} open position${openCount === 1 ? "" : "s"}` : null,
  ].filter(Boolean).join(" · ") || "Join Kroo Finder to connect with racing sailboats and crew.";
  const images = [boat.photo_url || `${APP_URL}/kroo-finder-logo.png`];

  return {
    metadataBase,
    robots,
    title,
    description,
    openGraph: { title, description, images, type: "website", siteName: "Kroo Finder" },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function SharedBoatPage({ params }) {
  const { id } = await params;
  const data = await getPublicBoat(id);
  const next = `/boat/${id}`;

  if (!data) {
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
            The owner isn't sharing this profile publicly. Create a free Kroo Finder account to find boats and crew.
          </p>
        </div>
        <GateButton
          next="/crew/feed"
          className="w-full max-w-[300px] px-6 py-3 rounded-2xl text-sm font-semibold text-white"
          style={{ backgroundColor: "#0161f0" }}
        >
          Sign up
        </GateButton>
      </div>
    );
  }

  const { boat, regattas } = data;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#f5f5f5" }}>
      <RedirectIfSignedIn to={next} />

      {/* Header */}
      <div className="bg-white flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #e8e8e8" }}>
        <Image src="/kroo-finder.svg" alt="Kroo Finder" width={72} height={52} />
        <GateButton
          next={next}
          href="/crew/login"
          className="text-sm font-semibold"
          style={{ color: "#0161f0" }}
        >
          Log in
        </GateButton>
      </div>

      <div className="flex flex-col gap-3 px-3 pt-3 pb-10 max-w-[800px] mx-auto w-full">
        {/* Boat card */}
        <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <div className="flex gap-4 items-start">
            <div className="rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ width: 90, height: 90, backgroundColor: "#e8e8e8" }}>
              {boat.photo_url
                ? <ZoomableImage src={boat.photo_url} alt={boat.boat_name} className="w-full h-full object-cover" />
                : <IconAnchor size={28} color="#ccc" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-gray-400 mb-0.5">{boat.home_port}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[17px] font-bold text-gray-900">{boat.boat_name}</p>
                {boat.boat_class && (
                  <span className="text-[13px] px-2.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: "#ebebeb", color: "#555" }}>{boat.boat_class}</span>
                )}
              </div>
            </div>
          </div>

          {boat.skipper_name && (
            <div className="flex items-center gap-2.5 mt-4">
              <div className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ width: 40, height: 40, backgroundColor: "#d8d8d8" }}>
                {boat.skipper_photo_url
                  ? <ZoomableImage src={boat.skipper_photo_url} alt={boat.skipper_name} className="w-full h-full object-cover" />
                  : <IconUser size={20} color="#aaa" />}
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900">{boat.skipper_name}</p>
                <p className="text-[13px] text-gray-400">Skipper</p>
              </div>
            </div>
          )}

          <GateButton
            next={next}
            className="mt-4 w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold border"
            style={{ color: "#0161F0", borderColor: "#0161F0", backgroundColor: "#fff" }}
          >
            Sign up to message
          </GateButton>
        </div>

        {/* Open positions */}
        {regattas.map((regatta) => (
          <div key={regatta.id} className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            {regatta.date && <p className="text-[13px] text-gray-400 mb-1">{formatDate(regatta.date)}</p>}
            <p className="text-[20px] font-bold text-gray-900 leading-tight mb-1">{regatta.name}</p>
            {regatta.location && (
              <p className="text-[14px] text-gray-400 mb-3">{regatta.location}</p>
            )}
            <div className="h-px mb-3" style={{ backgroundColor: "#e8e8e8" }} />
            {regatta.open.map((pos, i) => (
              <div key={i}>
                {i > 0 && <div className="h-px my-2" style={{ backgroundColor: "#f0f0f0" }} />}
                <div className="flex items-center gap-2 py-1">
                  <span className="text-[14px] px-3 py-1 rounded-md font-medium flex-shrink-0" style={{ backgroundColor: "#f0f2f5", color: "#333" }}>{pos.role}</span>
                  <span className="text-[14px] text-gray-400 flex-1">{pos.level || "All levels"}</span>
                  <GateButton
                    next={next}
                    className="text-[14px] font-semibold px-4 py-1.5 rounded-full text-white flex-shrink-0"
                    style={{ backgroundColor: "#0161F0" }}
                  >
                    Apply
                  </GateButton>
                </div>
              </div>
            ))}
          </div>
        ))}

        {regattas.length === 0 && (
          <div className="bg-white rounded-2xl px-4 py-8 flex items-center justify-center" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <p className="text-sm text-gray-400">No open positions right now.</p>
          </div>
        )}

        {/* Sign-up call to action */}
        <div className="rounded-2xl px-5 py-6 flex flex-col items-center gap-3 text-center" style={{ backgroundColor: "#02123e" }}>
          <p className="text-base font-semibold text-white">Join Kroo Finder to apply and message</p>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            Create a free account to connect with {boat.boat_name} and other racing boats and crew.
          </p>
          <GateButton
            next={next}
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
