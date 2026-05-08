import Image from "next/image";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-[70px] py-[40px]"
      style={{ backgroundColor: "#02123e" }}
    >
      {/* Logo & Headline */}
      <div className="flex flex-col items-center gap-12 w-full mb-8">
        <p className="text-white text-2xl font-normal text-center">
          Welcome to
        </p>

        <Image
          src="/kroo-logo-white.svg"
          alt="Kroo"
          width={260}
          height={93}
          priority
          className="w-full max-w-[260px]"
        />

        <p className="text-white text-2xl font-normal text-center">
          Are you looking for
        </p>
      </div>

      {/* Boat owner looking for crew */}
      <Link
        href="/boat/signup"
        className="w-full flex items-center justify-center px-4 py-2 rounded-full mb-6 font-medium text-sm tracking-wide"
        style={{ backgroundColor: "#0161f0", color: "#f6f6f6" }}
      >
        CREW MEMBER
      </Link>

      <p className="text-white text-2xl font-normal text-center mb-6">Or</p>

      {/* Sailor looking for a boat */}
      <Link
        href="/crew/signup"
        className="w-full flex items-center justify-center px-4 py-2 rounded-full font-medium text-sm tracking-wide"
        style={{ backgroundColor: "#0161f0", color: "#f6f6f6" }}
      >
        A BOAT TO SAIL
      </Link>
    </div>
  );
}
