"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconX } from "@tabler/icons-react";

// A photo that opens full-screen when tapped. Tap anywhere, press Esc, or use
// the close button to dismiss.
export default function ZoomableImage({ src, alt = "", className = "", style }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!src) return null;

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className} cursor-zoom-in`}
        style={style}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
      />
      {open && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 1000, backgroundColor: "rgba(0,0,0,0.88)" }}
          onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          role="dialog"
          aria-label={alt || "Photo"}
        >
          <button
            aria-label="Close"
            className="absolute top-4 right-4 flex items-center justify-center rounded-full"
            style={{ width: 40, height: 40, backgroundColor: "rgba(255,255,255,0.15)" }}
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          >
            <IconX size={22} color="white" />
          </button>
          <img
            src={src}
            alt={alt}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 12 }}
          />
        </div>,
        document.body
      )}
    </>
  );
}
