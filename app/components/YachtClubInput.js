"use client";
import { useState, useRef, useEffect } from "react";

const SAILING_KEYWORDS = ["yacht", "sailing", "sail", "marine", "marina", "regatta", "boat", "nautical", "rowing", "maritime"];

function isSailingVenue(name = "") {
  const lower = name.toLowerCase();
  return SAILING_KEYWORDS.some((kw) => lower.includes(kw));
}

export default function YachtClubInput({ value, onChange, placeholder, className, style }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  function handleChange(e) {
    const val = e.target.value;
    onChange(val);

    clearTimeout(debounceRef.current);

    if (val.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val + " yacht club")}&format=json&addressdetails=1&namedetails=1&limit=8`,
          { headers: { "Accept-Language": "en-US,en" } }
        );
        const data = await res.json();

        const seen = new Set();
        const items = [];
        for (const item of data) {
          const name = item.namedetails?.name || item.display_name.split(",")[0].trim();
          if (!name || seen.has(name)) continue;
          if (!isSailingVenue(name)) continue;
          seen.add(name);
          items.push(name);
        }

        setSuggestions(items);
        setOpen(items.length > 0);
      } catch {
        // silently fail
      }
    }, 350);
  }

  function handleSelect(name) {
    onChange(name);
    setSuggestions([]);
    setOpen(false);
  }

  useEffect(() => {
    function onMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        value={value}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={className}
        style={style}
        autoComplete="off"
      />
      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-lg z-30 overflow-hidden border"
          style={{ borderColor: "#e0e0e0" }}
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 border-b last:border-0"
              style={{ borderColor: "#f0f0f0" }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
