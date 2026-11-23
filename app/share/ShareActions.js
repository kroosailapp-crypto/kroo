"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { rememberNext } from "@/lib/next-redirect";

// Signed-in users have no use for the public teaser: send them to the real profile.
export function RedirectIfSignedIn({ to }) {
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    if (user) router.replace(to);
  }, [user, to, router]);
  return null;
}

// Any interaction on the public page leads to sign-up, remembering the destination.
export function GateButton({ next, href = "/crew/signup", className, style, children }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => {
        rememberNext(next);
        router.push(href);
      }}
    >
      {children}
    </button>
  );
}
