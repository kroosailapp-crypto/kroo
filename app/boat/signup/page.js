import Image from "next/image";
import Link from "next/link";

export default function BoatSignupPage() {
  return (
    <div
      className="flex flex-col min-h-screen px-5 py-5"
      style={{ backgroundColor: "#02123e" }}
    >
      {/* Logo */}
      <div className="mb-10">
        <Image src="/kroo-logo.png" alt="Kroo" width={80} height={32} />
      </div>

      <h2 className="text-white text-2xl font-semibold mb-2">List Your Boat</h2>
      <p className="text-white/60 text-sm mb-8">Tell us about your boat</p>

      {/* Form */}
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Boat Name"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ backgroundColor: "#0d2060", color: "#fff", border: "1px solid #1a3a80" }}
        />
        <input
          type="text"
          placeholder="Boat Class (e.g. Melges 24)"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ backgroundColor: "#0d2060", color: "#fff", border: "1px solid #1a3a80" }}
        />
        <input
          type="text"
          placeholder="Home Port (e.g. San Francisco, CA)"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ backgroundColor: "#0d2060", color: "#fff", border: "1px solid #1a3a80" }}
        />
      </div>

      {/* Next Button */}
      <Link
        href="/boat/feed"
        className="mt-8 flex items-center justify-center px-4 py-2 rounded-full font-medium text-sm"
        style={{ backgroundColor: "#0161f0", color: "#f6f6f6", width: "fit-content" }}
      >
        Next
      </Link>

      <div className="mt-auto pt-8">
        <Link href="/" className="text-white/40 text-sm">
          ← Back
        </Link>
      </div>
    </div>
  );
}
