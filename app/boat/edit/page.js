"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconCamera, IconAnchor } from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
}

function Field({ label, placeholder, value, onChange, inputMode }) {
  return (
    <div className="px-4 py-4">
      <p className="text-xs text-gray-400 mb-1.5">{label}</p>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode} className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
    </div>
  );
}

export default function EditBoatProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const fileRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [skipperName, setSkipperName] = useState("");
  const [boatName, setBoatName] = useState("");
  const [location, setLocation] = useState("");
  const [boatClass, setBoatClass] = useState("");
  const [about, setAbout] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.push("/boat/login"); return; }
    loadProfile();
  }, [user]);

  async function loadProfile() {
    const { data } = await supabase.from("boat_profiles").select("*").eq("id", user.id).single();
    if (data) {
      setSkipperName(data.skipper_name || "");
      setBoatName(data.boat_name || "");
      setLocation(data.home_port || "");
      setBoatClass(data.boat_class || "");
      setAbout(data.about || "");
      setWebsite(data.website || "");
      setInstagram(data.instagram || "");
      if (data.photo_url) setPhoto(data.photo_url);
    }
    setLoading(false);
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
    let photo_url = photo && !photoFile ? photo : null;

    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const path = `boat/${user.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(path, photoFile, { upsert: true });
      if (!uploadError) {
        const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
        photo_url = data.publicUrl;
      }
    }

    const update = { skipper_name: skipperName, boat_name: boatName, home_port: location, boat_class: boatClass, about, website, instagram };
    if (photo_url) update.photo_url = photo_url;

    await supabase.from("boat_profiles").update(update).eq("id", user.id);
    setSaving(false);
    router.push("/boat/profile");
  }

  if (loading || user === undefined) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-sm text-gray-400">Loading…</p></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "#e8e8e8" }}>
        <Link href="/boat/profile"><IconArrowLeft size={22} color="#111" /></Link>
        <p className="flex-1 text-sm font-semibold text-gray-900">Edit Boat Profile</p>
        <button onClick={handleSave} disabled={saving} className="text-sm font-semibold" style={{ color: "#0161F0" }}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="overflow-y-auto flex-1 pb-8">
        {/* Boat photo upload */}
        <div className="flex flex-col items-center py-6 gap-2">
          <div className="relative">
            <div className="rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 105, height: 105, backgroundColor: "#e0e0e0" }}>
              {photo ? <img src={photo} alt="Boat" className="w-full h-full object-cover" /> : <IconAnchor size={32} color="#bbb" />}
            </div>
            <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 flex items-center justify-center rounded-full" style={{ width: 28, height: 28, backgroundColor: "#0161F0", border: "2px solid #fff" }}>
              <IconCamera size={14} color="white" />
            </button>
          </div>
          <button onClick={() => fileRef.current?.click()} className="text-xs font-medium" style={{ color: "#0161F0" }}>Change photo</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        <Divider />
        <Field label="Skipper Name" placeholder="Your full name" value={skipperName} onChange={setSkipperName} />
        <Divider />
        <Field label="Boat Name" placeholder="e.g. Dilema" value={boatName} onChange={setBoatName} />
        <Divider />
        <Field label="Location" placeholder="City, State" value={location} onChange={setLocation} />
        <Divider />
        <Field label="Boat Class" placeholder="e.g. Melges 24" value={boatClass} onChange={setBoatClass} />
        <Divider />

        {/* About */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-1.5">About</p>
          <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4} placeholder="Tell sailors about your boat…" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400 resize-none" style={{ borderColor: "#e0e0e0" }} />
        </div>

        <Divider />

        {/* Links */}
        <div className="px-4 py-4 flex flex-col gap-3">
          <p className="text-xs text-gray-400">Links</p>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Website</p>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="www.yourboat.com" inputMode="url" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Instagram</p>
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="instagram.com/yourboat" inputMode="url" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
          </div>
        </div>

        <Divider />

        <div className="px-4 pt-5">
          <button onClick={handleSave} disabled={saving} className="w-full py-3.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: "#0161F0" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <BoatNavFooter active="Profile" />
    </div>
  );
}
