"use client";
import { IconShare } from "@tabler/icons-react";

const COPY = {
  boat: {
    visible: "boat photo, name, class and home port, skipper name and photo, and your upcoming regattas with open positions.",
    hidden: 'your "About" text and messaging. Visitors must sign up to apply or message you.',
  },
  crew: {
    visible: "your photo, name, location, experience level and positions.",
    hidden: 'your "About" text, links and messaging. Visitors must sign up to message you.',
  },
};

export function ShareConfirmModal({ kind, name, busy, onConfirm, onClose }) {
  const copy = COPY[kind];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl px-6 py-6 w-full max-w-[360px] flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-semibold text-gray-900">Share &ldquo;{name}&rdquo; publicly?</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          <span className="font-semibold text-gray-800">Anyone with the link can view your {kind === "boat" ? "boat " : ""}profile</span>, including people who aren&apos;t on Kroo, and anyone they forward the link to.
        </p>
        <div className="rounded-xl px-3.5 py-3 text-[13px] leading-relaxed" style={{ backgroundColor: "#f5f5f5", color: "#555" }}>
          <p><span className="font-semibold text-gray-800">Visible:</span> {copy.visible}</p>
          <p className="mt-1.5"><span className="font-semibold text-gray-800">Hidden:</span> {copy.hidden}</p>
        </div>
        <p className="text-[13px] text-gray-500 leading-relaxed">
          You can turn this off anytime from the <span className="font-semibold">⋯</span> menu on your profile. Previews already saved by apps like WhatsApp may stay visible.
        </p>
        <div className="flex flex-col gap-2 mt-1">
          <button
            onClick={onConfirm}
            disabled={busy}
            className="w-full py-3 rounded-2xl text-sm font-semibold text-white"
            style={{ backgroundColor: busy ? "#c0c0c0" : "#0161F0" }}
          >
            {busy ? "Please wait…" : "Make public & share"}
          </button>
          <button onClick={onClose} className="w-full py-2.5 text-sm font-medium text-gray-500">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShareNotice({ message }) {
  if (!message) return null;
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-50 px-4 py-2.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: "#111" }}>
      {message}
    </div>
  );
}

// Modal + toast for a useProfileSharing() instance.
export function ShareProfileUI({ sharing, kind, name }) {
  return (
    <>
      {sharing.showModal && (
        <ShareConfirmModal kind={kind} name={name} busy={sharing.busy} onConfirm={sharing.confirm} onClose={sharing.closeModal} />
      )}
      <ShareNotice message={sharing.notice} />
    </>
  );
}

export function ShareProfileButton({ onClick, className = "", style }) {
  return (
    <button onClick={onClick} className={`flex items-center justify-center gap-2 text-[15px] font-semibold border ${className}`} style={{ color: "#0161F0", borderColor: "#0161F0", ...style }}>
      <IconShare size={18} /> Share profile
    </button>
  );
}

export function PublicProfileToggle({ isPublic, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between gap-4 px-4 py-3 text-sm text-gray-800 hover:bg-gray-50">
      Public profile
      <span className="relative inline-block rounded-full flex-shrink-0" style={{ width: 36, height: 20, backgroundColor: isPublic ? "#0161F0" : "#d0d0d0", transition: "background-color .15s" }}>
        <span className="absolute top-0.5 rounded-full bg-white" style={{ width: 16, height: 16, left: isPublic ? 18 : 2, transition: "left .15s" }} />
      </span>
    </button>
  );
}
