import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import InstallBanner from "@/app/components/InstallBanner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Kroo - Find Your Crew",
  description: "Connect racing sailboats with crew, and sailors with boats.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kroo",
  },
  icons: {
    apple: "/icons/icon-180.png",
  },
};

export const viewport = {
  themeColor: "#0161f0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="min-h-full bg-white">
        <AuthProvider>
          <InstallBanner />
          <div id="app-root">
            {children}
          </div>
        </AuthProvider>

        {/* Capture beforeinstallprompt as early as possible, before React hydrates */}
        <Script id="pwa-prompt-capture" strategy="beforeInteractive">{`
          window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            window.__deferredInstallPrompt = e;
            window.dispatchEvent(new Event('pwaInstallReady'));
          });
        `}</Script>

        {/* Register service worker after page is interactive */}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
              .then(function(reg) { console.log('SW registered', reg.scope); })
              .catch(function(err) { console.error('SW error', err); });
          }
        `}</Script>
      </body>
    </html>
  );
}
