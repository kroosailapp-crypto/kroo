"use client";

import { AuthProvider } from "@/lib/auth-context";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function ProLayout({ children }) {
  return (
    <div className={inter.className} style={{ minHeight: "100vh", backgroundColor: "#f6f6f6" }}>
      {children}
    </div>
  );
}
