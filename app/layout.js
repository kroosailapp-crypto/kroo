import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import InstallBanner from "@/app/components/InstallBanner";
import PWASetup from "@/app/components/PWASetup";

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
        {/* Capture beforeinstallprompt via static public file — executes before React */}
        <Script src="/pwa-init.js" strategy="beforeInteractive" />

        <AuthProvider>
          {/* Registers the service worker via useEffect — guaranteed to run */}
          <PWASetup />
          <InstallBanner />
          <div id="app-root">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
