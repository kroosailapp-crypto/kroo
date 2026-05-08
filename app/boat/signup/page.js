"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const BOAT_CLASSES = [
  "Melges 24", "J/24", "Etchells", "Laser (ILCA)", "Snipe",
  "J/105", "Farr 40", "J/70", "Lightning", "Flying Scot",
];

const POSITIONS_NEEDED = [
  "Jib Trimmer", "Spin Trimmer", "Tactician", "Bowman",
  "Main Trimmer", "Navigator", "Pitman", "Grinder",
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

export default function BoatSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 4;

  // Form state
  const [boatName, setBoatName] = useState("");
  const [boatClass, setBoatClass] = useState("");
  const [homePort, setHomePort] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [positions, setPositions] = useState([]);
  const [experienceRequired, setExperienceRequired] = useState("");

  function togglePosition(pos) {
    setPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  }

  function handleNext() {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else router.push("/boat/feed");
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
    else router.push("/");
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-5 py-5">
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/kroo-logo-blue.svg"
          alt="Kroo"
          width={60}
          height={24}
        />
      </div>

      <ProgressBar step={step} total={TOTAL_STEPS} />

      {/* Step 1 — Boat Info */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-800 font-semibold text-lg mb-1">Tell us about your boat</p>
          <Field placeholder="Boat Name" value={boatName} onChange={setBoatName} />
          <Field placeholder="Boat Class (e.g. Melges 24)" value={boatClass} onChange={setBoatClass} />
          <div className="flex flex-wrap gap-2 mt-1">
            {BOAT_CLASSES.map((cls) => (
              <button
                key={cls}
                onClick={() => setBoatClass(cls)}
                className="px-3 py-1.5 rounded-full text-sm border"
                style={{
                  backgroundColor: boatClass === cls ? "#0161f0" : "#fff",
                  color: boatClass === cls ? "#fff" : "#0161f0",
                  borderColor: "#0161f0",
                }}
              >
                {cls}
              </button>
            ))}
          </div>
          <NextButton onClick={handleNext} disabled={!boatName || !boatClass} />
        </div>
      )}

      {/* Step 2 — Home Port */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-800 font-semibold text-lg mb-1">Where is your home port?</p>
          <Field
            placeholder="City, State (e.g. San Francisco, CA)"
            value={homePort}
            onChange={setHomePort}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {["San Francisco, CA", "Oakland, CA", "Sausalito, CA"].map((port) => (
              <button
                key={port}
                onClick={() => setHomePort(port)}
                className="px-3 py-1.5 rounded-full text-sm border"
                style={{
                  backgroundColor: homePort === port ? "#0161f0" : "#fff",
                  color: homePort === port ? "#fff" : "#0161f0",
                  borderColor: "#0161f0",
                }}
              >
                {port}
              </button>
            ))}
          </div>
          <NextButton onClick={handleNext} disabled={!homePort} />
        </div>
      )}

      {/* Step 3 — Crew Positions Needed */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-800 font-semibold text-lg mb-1">
            What positions do you need?
          </p>
          <div className="flex flex-wrap gap-2">
            {POSITIONS_NEEDED.map((pos) => (
              <Tag
                key={pos}
                label={pos}
                selected={positions.includes(pos)}
                onToggle={togglePosition}
              />
            ))}
          </div>

          <p className="text-gray-800 font-semibold text-base mt-4 mb-1">
            Experience required
          </p>
          <div className="flex flex-wrap gap-2">
            {["All levels", "Beginner", "Mid-Level", "Advanced"].map((lvl) => (
              <Tag
                key={lvl}
                label={lvl}
                selected={experienceRequired === lvl}
                onToggle={() => setExperienceRequired(lvl)}
              />
            ))}
          </div>
          <NextButton onClick={handleNext} disabled={positions.length === 0} />
        </div>
      )}

      {/* Step 4 — Links */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-800 font-semibold text-lg mb-1">
            Add your links <span className="text-gray-400 font-normal text-sm">(optional)</span>
          </p>
          <Field
            placeholder="Official Website (e.g. www.boatname.com)"
            value={website}
            onChange={setWebsite}
          />
          <Field
            placeholder="Instagram (e.g. instagram.com/boatname)"
            value={instagram}
            onChange={setInstagram}
          />
          <NextButton onClick={handleNext} label="CREATE PROFILE" />
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
