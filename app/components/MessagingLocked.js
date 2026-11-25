import { IconLock } from "@tabler/icons-react";

// Shown in place of the message box when the messaging rules don't allow
// starting a conversation yet.
export default function MessagingLockedBar({ children, bottom = "56px" }) {
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 w-full max-w-[800px] px-4 py-3 border-t"
      style={{ bottom, backgroundColor: "#fff", borderColor: "#e8e8e8" }}
    >
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl" style={{ backgroundColor: "#f5f5f5" }}>
        <IconLock size={16} color="#888" className="flex-shrink-0" />
        <p className="text-[13px] text-gray-500 leading-snug">{children}</p>
      </div>
    </div>
  );
}
