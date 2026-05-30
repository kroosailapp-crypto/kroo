"use client";
import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";

function Section({ number, title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold text-gray-900 mb-2">{number}. {title}</h2>
      {children}
    </div>
  );
}

function Sub({ title, children }) {
  return (
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-1.5">{title}</h3>
      {children}
    </div>
  );
}

function P({ children }) {
  return <p className="text-xs text-gray-600 leading-relaxed mb-2">{children}</p>;
}

function Ul({ items }) {
  return (
    <ul className="mb-2 flex flex-col gap-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-xs text-gray-600 leading-relaxed">
          <span className="flex-shrink-0 mt-1">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0"
        style={{ borderColor: "#e8e8e8" }}
      >
        <button onClick={() => router.back()}>
          <IconArrowLeft size={22} color="#111" />
        </button>
        <p className="text-sm font-semibold text-gray-900">Terms of Use</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1" style={{ color: "#0161F0" }}>KROO</h1>
          <p className="text-base font-semibold text-gray-800 mb-1">Terms of Use</p>
          <p className="text-xs text-gray-400 italic">Effective Date: June 1, 2026</p>
        </div>

        <Section number="1" title="Introduction and Acceptance">
          <P>Welcome to Kroo, a platform that connects sailboat owners and captains seeking crew members with sailors looking for vessels in need of crew. By accessing or using the Kroo application, website, or any related services (collectively, the "Platform"), you agree to be bound by these Terms of Use ("Terms").</P>
          <P>If you do not agree to these Terms, you must not use the Platform. Kroo reserves the right to update these Terms at any time. Continued use of the Platform after any changes constitutes acceptance of the revised Terms.</P>
        </Section>

        <Section number="2" title="Eligibility">
          <P>To use the Kroo Platform, you must:</P>
          <Ul items={[
            "Be at least 18 years of age",
            "Have the legal capacity to enter into a binding agreement",
            "Not be prohibited from using the Platform under applicable law",
            "Provide accurate and truthful information during registration",
          ]} />
        </Section>

        <Section number="3" title="Account Registration">
          <P>To access most features of the Platform, you must create an account. You agree to:</P>
          <Ul items={[
            "Provide accurate, current, and complete information",
            "Maintain and update your information to keep it accurate",
            "Keep your login credentials confidential",
            "Be solely responsible for all activity that occurs under your account",
            "Notify Kroo immediately of any unauthorized access or security breach",
          ]} />
          <P>Kroo reserves the right to suspend or terminate accounts that contain false information or violate these Terms.</P>
        </Section>

        <Section number="4" title="User Roles">
          <Sub title="4.1 Boat Owners / Captains">
            <P>Users listing a vessel or seeking crew ("Boat Owners") agree to:</P>
            <Ul items={[
              "Provide accurate and up-to-date information about the vessel, including safety equipment, experience requirements, voyage details, and departure/arrival locations",
              "Ensure the vessel is seaworthy and complies with all applicable maritime regulations",
              "Hold all required licenses, certifications, and insurance for their vessel and voyage",
              "Treat crew members with respect and maintain safe working conditions aboard",
              "Clearly communicate voyage expectations, duration, costs (if any), and living conditions",
            ]} />
          </Sub>
          <Sub title="4.2 Sailors / Crew Members">
            <P>Users seeking crew positions ("Sailors") agree to:</P>
            <Ul items={[
              "Provide accurate information about their sailing experience, skills, and certifications",
              "Honor commitments made to Boat Owners once a crew position is accepted",
              "Follow the instructions of the captain while aboard the vessel",
              "Disclose any medical conditions that may affect their ability to crew safely",
              "Conduct themselves safely and respectfully aboard any vessel",
            ]} />
          </Sub>
        </Section>

        <Section number="5" title="Kroo's Role as a Marketplace">
          <P>Kroo is a marketplace platform only. Kroo does not:</P>
          <Ul items={[
            "Own, operate, or control any vessel listed on the Platform",
            "Employ or supervise any crew member or captain",
            "Guarantee the accuracy of any user-provided information",
            "Participate in or assume responsibility for any voyage, agreement, or arrangement made between users",
          ]} />
          <P>Kroo is not a party to any agreement between Boat Owners and Sailors. Any disputes arising from a voyage or crew arrangement are solely between the parties involved.</P>
        </Section>

        <Section number="6" title="Safety and Compliance">
          <P>Maritime activities carry inherent risks. All users are solely responsible for their own safety and must comply with all applicable maritime laws, regulations, and best practices in their jurisdiction.</P>
          <P>Kroo strongly encourages all users to:</P>
          <Ul items={[
            "Verify the credentials and references of other users before committing to any voyage",
            "Carry appropriate insurance coverage",
            "Review the vessel's safety equipment and emergency procedures",
            "File a float plan with relevant authorities before departure",
          ]} />
          <P>Kroo does not conduct background checks, license verification, or safety inspections. Users engage with each other at their own risk.</P>
        </Section>

        <Section number="7" title="Prohibited Conduct">
          <P>Users must not use the Platform to:</P>
          <Ul items={[
            "Post false, misleading, or fraudulent listings or profiles",
            "Harass, threaten, or discriminate against other users",
            "Engage in any illegal activity, including human trafficking or smuggling",
            "Solicit payment outside of any official Kroo payment systems where applicable",
            "Scrape, copy, or redistribute Platform content without permission",
            "Interfere with the security or proper functioning of the Platform",
            "Create multiple accounts or impersonate other individuals",
          ]} />
          <P>Kroo reserves the right to remove listings, suspend, or permanently ban users who violate these provisions.</P>
        </Section>

        <Section number="8" title="Intellectual Property">
          <P>All content, design, trademarks, and software comprising the Kroo Platform are the intellectual property of Kroo or its licensors. Users are granted a limited, non-exclusive, non-transferable license to use the Platform for its intended purpose.</P>
          <P>By submitting content (such as profile information, voyage descriptions, or photos) to the Platform, you grant Kroo a worldwide, royalty-free license to use, display, and promote such content in connection with operating the Platform.</P>
        </Section>

        <Section number="9" title="Privacy">
          <P>Kroo collects and processes personal data in accordance with its Privacy Policy, which is incorporated by reference into these Terms. By using the Platform, you consent to Kroo's collection and use of your data as described in the Privacy Policy.</P>
        </Section>

        <Section number="10" title="Disclaimer of Warranties">
          <P>The Platform is provided on an "AS IS" and "AS AVAILABLE" basis. To the fullest extent permitted by law, Kroo disclaims all warranties, express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.</P>
          <P>Kroo does not warrant that the Platform will be uninterrupted, error-free, or free of harmful components. Kroo makes no representations about the accuracy, reliability, or completeness of any user-generated content.</P>
        </Section>

        <Section number="11" title="Limitation of Liability">
          <P>To the maximum extent permitted by applicable law, Kroo and its affiliates, officers, employees, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform or any voyage arranged through it.</P>
          <P>This includes but is not limited to personal injury, property damage, loss of life, or financial loss occurring aboard any vessel. Users assume all risks associated with maritime activities arranged through Kroo.</P>
        </Section>

        <Section number="12" title="Termination">
          <P>You may delete your account at any time through the Platform settings. Kroo may suspend or terminate your account at its discretion if you violate these Terms or for any other reason with or without notice.</P>
          <P>Upon termination, your right to use the Platform ceases immediately. Provisions of these Terms that by their nature should survive termination shall continue to apply.</P>
        </Section>

        <Section number="13" title="Governing Law and Disputes">
          <P>These Terms shall be governed by and construed in accordance with applicable law. Any disputes arising under these Terms shall first be attempted to be resolved through good-faith negotiation, followed by mediation if necessary.</P>
          <P>Nothing in these Terms limits your rights under applicable consumer protection laws in your jurisdiction.</P>
        </Section>

        <Section number="14" title="Contact Us">
          <P>If you have any questions about these Terms of Use, please contact us at:</P>
          <P>Kroo{"\n"}Website: www.kroo.app</P>
        </Section>

        <p className="text-xs text-gray-400 italic text-center pb-8">— End of Terms of Use —</p>
      </div>
    </div>
  );
}
