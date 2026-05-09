"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconUser, IconCamera } from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

const POSITIONS = [
  "Helm", "Tactician", "Navigator", "Mainsail Trimmer",
  "Jib Trimmer", "Spin Trimmer", "Bowman", "Foredeck",
  "Pitman", "Grinder", "Mast", "Runner",
];

const LEVELS = ["Entry Level", "Mid-Level", "Advanced"];

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
}

export default function EditCrewProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const fileRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [positions, setPositions] = useState([]);
  const [level, setLevel] = useState("Mid-Level");
  const [about, setAbout] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.push("/crew/login"); return; }
    loadProfile();
  }, [user]);

  async function loadProfile() {
    const { data } = await supabase.from("crew_profiles").select("*").eq("id", user.id).single();
    if (data) {
      setName(data.name || "");
      setLocation(data.location || "");
      setPositions(data.positions || []);
      setLevel(data.experience_level || "Mid-Level");
      setAbout(data.about || "");
      setWebsite(data.website || "");
      setInstagram(data.instagram || "");
      if (data.avatar_url) setPhoto(data.avatar_url);
    }
    setLoading(false);
  }

  function togglePosition(pos) {
    setPositions((prev) => prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]);
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhoto(URL.createObjectURL(file));
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    let avatar_url = photo && !photoFile ? photo : null;

    // Upload new photo if selected
    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const path = `crew/${user.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(path, photoFile, { upsert: true });
      if (!uploadError) {
        const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
        avatar_url = data.publicUrl;
      }
    }

    const update = { name, location, positions, experience_level: level, about, website, instagram };
    if (avatar_url) update.avatar_url = avatar_url;

    await supabase.from("crew_profiles").update(update).eq("id", user.id);
    setSaving(false);
    router.push("/crew/profile");
  }

  if (loading || user === undefined) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-sm text-gray-400">Loading…</p></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "#e8e8e8" }}>
        <Link href="/crew/profile"><IconArrowLeft size={22} color="#111" /></Link>
        <p className="flex-1 text-sm font-semibold text-gray-900">Edit Profile</p>
        <button onClick={handleSave} disabled={saving} className="text-sm font-semibold" style={{ color: "#0161F0" }}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="overflow-y-auto flex-1 pb-8">
        {/* Photo upload */}
        <div className="flex flex-col items-center py-6 gap-2">
          <div className="relative">
            <div className="rounded-full flex items-center justify-center overflow-hidden flex-shrink-0" style={{ width: 96, height: 96, backgroundColor: "#d8d8d8" }}>
              {photo ? <img src={photo} alt="Profile" className="w-full h-full object-cover" /> : <IconUser size={32} color="#aaa" />}
            </div>
            <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 flex items-center justify-center rounded-full" style={{ width: 28, height: 28, backgroundColor: "#0161F0", border: "2px solid #fff" }}>
              <IconCamera size={14} color="white" />
            </button>
          </div>
          <button onClick={() => fileRef.current?.click()} className="text-xs font-medium" style={{ color: "#0161F0" }}>Change photo</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        <Divider />

        {/* Name */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-1.5">Name</p>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none" style={{ borderColor: "#e0e0e0" }} />
        </div>

        <Divider />

        {/* Location */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-1.5">Location</p>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
        </div>

        <Divider />

        {/* Positions */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-3">Positions</p>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((pos) => {
              const selected = positions.includes(pos);
              return (
                <button key={pos} onClick={() => togglePosition(pos)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ backgroundColor: selected ? "#111" : "#F4F4F4", color: selected ? "#fff" : "#111", borderColor: selected ? "#111" : "#F4F4F4" }}>
                  {pos}
                </button>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* Experience level */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-3">Experience Level</p>
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setLevel(l)} className="flex-1 py-2 rounded-xl text-xs font-semibold border" style={{ backgroundColor: level === l ? "#111" : "#F4F4F4", color: level === l ? "#fff" : "#111", borderColor: level === l ? "#111" : "#F4F4F4" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* About */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-1.5">About</p>
          <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4} placeholder="Tell boats about yourself…" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400 resize-none" style={{ borderColor: "#e0e0e0" }} />
        </div>

        <Divider />

        {/* Links */}
        <div className="px-4 py-4 flex flex-col gap-3">
          <p className="text-xs text-gray-400">Links</p>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Website</p>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="www.yoursite.com" inputMode="url" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Instagram</p>
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="instagram.com/yourhandle" inputMode="url" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
          </div>
        </div>

        <Divider />

        <div className="px-4 pt-5">
          <button onClick={handleSave} disabled={saving} className="w-full py-3.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: "#0161F0" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <CrewNavFooter active="Profile" />
    </div>
  );
}
