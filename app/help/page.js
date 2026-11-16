"use client";
import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";

export default function HelpPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="sticky top-0 z-20 bg-white flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "#e8e8e8" }}>
        <button onClick={() => router.back()}>
          <IconArrowLeft size={22} color="#111" />
        </button>
        <p className="text-sm font-semibold text-gray-900">Help & Support</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 max-w-2xl mx-auto w-full">

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Contact Us</h2>
          <p className="text-sm text-gray-600">
            Email us at{" "}
            <a href="mailto:kroosailapp@gmail.com" className="text-blue-600 underline">
              kroosailapp@gmail.com
            </a>{" "}
            and we&apos;ll get back to you within 24 hours.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Account & Profile</h2>
          <p className="text-sm text-gray-600">
            To update your profile photo, name, or bio, go to your Profile tab and tap Edit Profile.
            To delete your account and all associated data, visit the{" "}
            <a href="/account/delete" className="text-blue-600 underline">
              account deletion page
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Reporting Abuse</h2>
          <p className="text-sm text-gray-600">
            If you encounter inappropriate content or an abusive user, please email{" "}
            <a href="mailto:kroosailapp@gmail.com" className="text-blue-600 underline">
              kroosailapp@gmail.com
            </a>{" "}
            with the details. We review all reports within 24 hours and will remove violating
            content and users immediately upon confirmation.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Community Standards</h2>
          <p className="text-sm text-gray-600">
            Kroo has zero tolerance for objectionable content or abusive behavior. By using Kroo,
            you agree to treat other sailors and boat owners with respect. Violations may result
            in immediate account removal.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Privacy</h2>
          <p className="text-sm text-gray-600">
            Kroo collects only the information necessary to connect sailors and boat owners.
            We do not sell your data. For questions about your data, email{" "}
            <a href="mailto:kroosailapp@gmail.com" className="text-blue-600 underline">
              kroosailapp@gmail.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-medium text-gray-800">How do I find a regatta to crew?</p>
              <p className="text-sm text-gray-600">Go to the Feed tab and browse open regattas near you. Tap Apply to send a crew request.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">How do I post a crew opening?</p>
              <p className="text-sm text-gray-600">Switch to Boat mode, go to Regattas, and tap New Regatta. Add the positions you need and save.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">How do I block someone?</p>
              <p className="text-sm text-gray-600">To block a user, email us at kroosailapp@gmail.com with the user&apos;s name and we will block them from your feed immediately.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
