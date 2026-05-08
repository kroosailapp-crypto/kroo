"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const POSITIONS = [
  "Jib Trimmer", "Spin Trimmer", "Tactician", "Bowman",
  "Main Trimmer", "Helm", "Pitman", "Grinder",
  "Navigator", "Foredeck",
];

const EXPERIENCE_LEVELS = [
  "Beginner", "Mid-Level", "Advanced", "Expert",
];

function ProgressBar({ step, total }) {
  return (
    <div className="flex gap-1.5 w-full mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full"
          style={{ backgroundColor: i < step ? "#0161f0" : "#e5e5e5" }}
        />
      ))}
    </div>
  );
}

function Field({ placeholder, type = "text", value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none border"
      style={{ borderColor: "#e5e5e5", backgroundColor: "#fff" }}
    />
  );
}

function NextButton({ onClick, label = "NEXT", disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center px-6 py-2 rounded-full font-medium text-sm mt-6"
      style={{
        backgroundColor: disabled ? "#ccc" : "#0161f0",
        color: "#f6f6f6",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );
}

function Tag({ label, selected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(label)}
      className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
      style={{
        backgroundColor: selected ? "#0161f0" : "#fff",
        color: selected ? "#fff" : "#0161f0",
        borderColor: "#0161f0",
      }}
    >
      {label}
    </button>
  );
}

export default function CrewSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 4;

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [positions, setPositions] = useState([]);

  function togglePosition(pos) {
    setPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      router.push("/crew/feed");
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
    else router.push("/");
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-5 py-5">
      {/* Logo */}
      <div className="mb-6">
        <Image src="/kroo-logo-blue.svg" alt="Kroo" width={60} height={24} />
      </div>

      <ProgressBar step={step} total={TOTAL_STEPS} />

      {/* Step 1 — Basic Info */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Field placeholder="Name" value={name} onChange={setName} />
          <Field placeholder="Mobile Number or Email" value={email} onChange={setEmail} />
          <Field placeholder="Password" type="password" value={password} onChange={setPassword} />
          <NextButton onClick={handleNext} disabled={!name || !email || !password} />
        </div>
      )}

      {/* Step 2 — Location */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-800 font-semibold text-lg mb-1">Where are you based?</p>
          <Field
            placeholder="City, State (e.g. San Francisco, CA)"
            value={location}
            onChange={setLocation}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {["San Francisco, CA", "Oakland, CA", "Sausalito, CA"].map((loc) => (
              <button
                key={loc}
                onClick={() => setLocation(loc)}
                className="px-3 py-1.5 rounded-full text-sm border"
                style={{
                  backgroundColor: location === loc ? "#0161f0" : "#fff",
                  color: location === loc ? "#fff" : "#0161f0",
                  borderColor: "#0161f0",
                }}
              >
                {loc}
              </button>
            ))}
          </div>
          <NextButton onClick={handleNext} disabled={!location} />
        </div>
      )}

      {/* Step 3 — Experience */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-800 font-semibold text-lg mb-1">Experience level</p>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <Tag
                key={level}
                label={level}
                selected={experience === level}
                onToggle={() => setExperience(level)}
              />
            ))}
          </div>
          <NextButton onClick={handleNext} disabled={!experience} />
        </div>
      )}

      {/* Step 4 — Positions */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-800 font-semibold text-lg mb-1">What positions do you sail?</p>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((pos) => (
              <Tag
                key={pos}
                label={pos}
                selected={positions.includes(pos)}
                onToggle={togglePosition}
              />
            ))}
          </div>
          <NextButton
            onClick={handleNext}
            label="CREATE PROFILE"
            disabled={positions.length === 0}
          />
        </div>
      )}

      {/* Back link */}
      <button
        onClick={handleBack}
        className="mt-auto pt-8 text-left text-sm"
        style={{ color: "#aaa" }}
      >
        ← Back
      </button>
    </div>
  );
}
