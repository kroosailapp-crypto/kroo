"use client";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function SidebarPadding() {
  const { user } = useAuth();

  useEffect(() => {
    const root = document.getElementById("app-root");
    if (!root) return;
    if (user) {
      root.classList.add("has-sidebar");
    } else {
      root.classList.remove("has-sidebar");
    }
  }, [user]);

  return null;
}
