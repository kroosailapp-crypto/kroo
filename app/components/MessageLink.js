"use client";
import Link from "next/link";
import { useMessageable } from "@/lib/use-messageable";

// Message button that follows the messaging rules: a normal link when the
// signed-in user may message `toId`, a greyed-out button otherwise.
export function MessageLink({ toId, href, className = "", style, onClick, children }) {
  const { canMessage } = useMessageable();
  if (canMessage(toId)) {
    return <Link href={href} className={className} style={style} onClick={onClick}>{children}</Link>;
  }
  return (
    <span
      aria-disabled="true"
      className={`${className} cursor-not-allowed select-none`}
      style={{ ...style, color: "#b5b5b5", borderColor: "#e3e3e3", backgroundColor: "#f7f7f7" }}
    >
      {children}
    </span>
  );
}

// Small explanation shown under a disabled Message button.
export function MessageHint({ toId, className = "", children }) {
  const { loaded, canMessage } = useMessageable();
  if (!loaded || canMessage(toId)) return null;
  return <p className={`text-[12px] text-gray-400 leading-snug ${className}`}>{children}</p>;
}
