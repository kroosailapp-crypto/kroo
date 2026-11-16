"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

const STEPS = 4;

function ProgressBar({ step }) {
  return (
    <div className="flex gap-1.5 w-full mb-8">
      {Array.from({ length: STEPS }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full"
          style={{ backgroundColor: i < step ? "#0161f0" : "#e5e5e5" }}
        />
      ))}
    </div>
  );
}

function Field({ label, placeholder, type = "text", value, onChange, inputMode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none border bg-white"
        style={{ borderColor: "#e5e5e5" }}
      />
    </div>
  );
}

function NextButton({ onClick, label = "NEXT", disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center px-6 py-3 rounded-full font-semibold text-sm mt-6"
      style={{ backgroundColor: disabled ? "#ccc" : "#0161f0", color: "#fff", cursor: disabled ? "not-allowed" : "pointer" }}
    >
      {label}
    </button>
  );
}

export default function ProSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Team basics
  const [teamName, setTeamName] = useState("");
  const [teamWebsite, setTeamWebsite] = useState("");

  // Contact
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Photo upload
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleFinish() {
    setError("");
    setLoading(true);
    try {
      // 1. Create auth user
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password });
      if (authErr) throw authErr;
      const userId = authData.user.id;

      // 2. Upload photo if provided
      let photoUrl = null;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `pro-teams/${userId}/logo.${ext}`;
        const { error: upErr } = await supabase.storage.from("profiles").upload(path, photoFile, { upsert: true });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from("profiles").getPublicUrl(path);
          photoUrl = urlData.publicUrl;
        }
      }

      // 3. Create team
      const { data: team, error: teamErr } = await supabase
        .from("pro_teams")
        .insert({
          name: teamName,
          website: teamWebsite || null,
          photo_url: photoUrl,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone || null,
          owner_id: userId,
        })
        .select()
        .single();
      if (teamErr) throw teamErr;

      // 4. Add owner as team member
      await supabase.from("pro_team_members").insert({
        team_id: team.id,
        user_id: userId,
        role: "owner",
        name: contactName,
        email: contactEmail,
        phone: contactPhone || null,
      });

      // 5. Create default chat channels
      await supabase.from("pro_chat_channels").insert([
        { team_id: team.id, name: "General", type: "general" },
        { team_id: team.id, name: "Shore Team", type: "shore" },
      ]);

      router.push(`/pro/team/${team.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f6f6f6" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <Image src="/kroo-logo.svg" alt="Kroo" width={80} height={28} className="w-20" />
        <span
          className="text-xs font-semibold tracking-widest uppercase px-2 py-0.5 rounded-md"
          style={{ backgroundColor: "#39e75f", color: "#02123e" }}
        >
          Pro
        </span>
      </div>

      <div className="flex-1 flex flex-col px-5 pb-10 max-w-lg mx-auto w-full">
        <ProgressBar step={step} />

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold" style={{ color: "#02123e" }}>Create your account</h1>
            <Field label="Email" placeholder="you@team.com" type="email" value={email} onChange={setEmail} inputMode="email" />
            <Field label="Password" placeholder="Min 8 characters" type="password" value={password} onChange={setPassword} />
            <Field label="Confirm password" placeholder="Repeat password" type="password" value={confirmPassword} onChange={setConfirmPassword} />
            {error && <p className="text-xs" style={{ color: "#e00" }}>{error}</p>}
            <NextButton
              onClick={() => { setError(""); if (password !== confirmPassword) { setError("Passwords don't match"); return; } setStep(2); }}
              disabled={!email || password.length < 8 || !confirmPassword}
            />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold" style={{ color: "#02123e" }}>Your team</h1>
            <Field label="Team name" placeholder="e.g. Oracle Racing" value={teamName} onChange={setTeamName} />
            <Field label="Website (optional)" placeholder="https://yourteam.com" value={teamWebsite} onChange={setTeamWebsite} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Team photo</label>
              <label className="flex items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer overflow-hidden" style={{ borderColor: "#e5e5e5", backgroundColor: "#fff" }}>
                {photoPreview
                  ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                  : <span className="text-sm text-gray-400">Tap to upload logo</span>
                }
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
            <NextButton onClick={() => setStep(3)} disabled={!teamName} />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold" style={{ color: "#02123e" }}>Main contact</h1>
            <p className="text-sm text-gray-500">This is the primary team manager contact.</p>
            <Field label="Name" placeholder="Full name" value={contactName} onChange={setContactName} />
            <Field label="Email" placeholder="manager@team.com" type="email" value={contactEmail} onChange={setContactEmail} inputMode="email" />
            <Field label="Phone (optional)" placeholder="+1 555 000 0000" type="tel" value={contactPhone} onChange={setContactPhone} inputMode="tel" />
            <NextButton onClick={() => setStep(4)} disabled={!contactName || !contactEmail} />
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold" style={{ color: "#02123e" }}>Almost there!</h1>
            <p className="text-sm text-gray-500">Review your details and create your team.</p>

            <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 border" style={{ borderColor: "#e5e5e5" }}>
              {photoPreview && <img src={photoPreview} alt="team" className="w-16 h-16 rounded-xl object-cover" />}
              <div>
                <p className="text-xs text-gray-400">Team</p>
                <p className="font-semibold">{teamName}</p>
                {teamWebsite && <p className="text-xs text-gray-400">{teamWebsite}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400">Manager</p>
                <p className="font-semibold">{contactName}</p>
                <p className="text-xs text-gray-500">{contactEmail}</p>
              </div>
            </div>

            {error && <p className="text-xs" style={{ color: "#e00" }}>{error}</p>}

            <NextButton
              onClick={handleFinish}
              label={loading ? "Creating team…" : "CREATE TEAM"}
              disabled={loading}
            />
          </div>
        )}

        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="mt-4 text-sm text-center"
            style={{ color: "#0161f0" }}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
