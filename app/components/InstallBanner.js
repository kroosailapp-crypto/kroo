"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { IconX, IconShare } from "@tabler/icons-react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    // Don't show if already installed (running as standalone PWA)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Don't show if dismissed this session
    if (sessionStorage.getItem("kroo_install_dismissed")) return;

    // Android / Chrome — capture beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroid(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari detection
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIOS && isSafari) {
      setShowIOS(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    sessionStorage.setItem("kroo_install_dismissed", "1");
    setShowAndroid(false);
    setShowIOS(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowAndroid(false);
    }
    setDeferredPrompt(null);
  }

  if (!showAndroid && !showIOS) return null;

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[100] px-4 pb-4 pt-2"
      style={{ background: "linear-gradient(to top, white 80%, transparent)" }}
    >
      <div
        className="rounded-2xl px-4 py-4 flex items-center gap-3 shadow-lg border"
        style={{ backgroundColor: "#fff", borderColor: "#e8e8e8" }}
      >
        <Image src="/icons/icon-72.png" alt="Kroo" width={44} height={44} className="rounded-xl flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Add Kroo to Home Screen</p>
          {showIOS ? (
            <p className="text-xs text-gray-500 mt-0.5">
              Tap <IconShare size={12} className="inline mx-0.5" style={{ display: "inline", verticalAlign: "middle" }} /> then <span className="font-medium">"Add to Home Screen"</span>
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-0.5">Install for a better experience</p>
          )}
        </div>

        {showAndroid && (
          <button
            onClick={handleInstall}
            className="text-xs font-semibold px-3 py-1.5 rounded-full text-white flex-shrink-0"
            style={{ backgroundColor: "#0161f0" }}
          >
            Install
          </button>
        )}

        <button onClick={dismiss} className="flex-shrink-0 ml-1">
          <IconX size={16} color="#aaa" />
        </button>
      </div>
    </div>
  );
}
