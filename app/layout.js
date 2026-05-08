import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Kroo - Find Your Crew",
  description: "Connect racing sailboats with crew, and sailors with boats.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="min-h-full bg-white">
        <div id="app-root">
          {children}
        </div>
      </body>
    </html>
  );
}
