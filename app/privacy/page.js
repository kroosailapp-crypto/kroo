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

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "#e8e8e8" }}>
        <button onClick={() => router.back()}>
          <IconArrowLeft size={22} color="#111" />
        </button>
        <p className="text-sm font-semibold text-gray-900">Privacy Policy</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1" style={{ color: "#0161F0" }}>KROO</h1>
          <p className="text-base font-semibold text-gray-800 mb-1">Privacy Policy</p>
          <p className="text-xs text-gray-400 italic">Effective Date: June 1, 2026</p>
        </div>

        <P>Kroo ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, who we share it with, and your rights regarding your information when you use the Kroo platform ("Platform") — a marketplace connecting sailboat owners and captains with sailors seeking crew positions.</P>
        <P>By using the Platform, you agree to the practices described in this Privacy Policy. If you do not agree, please do not use the Platform.</P>

        <Section number="1" title="Information We Collect">
          <Sub title="1.1 Information You Provide">
            <P>When you register and use Kroo, you may provide:</P>
            <Ul items={[
              "Account details: name, email address, date of birth, profile photo",
              "Role-specific information: sailing experience, certifications, licenses, and skills (Sailors); vessel name, type, size, home port, and documentation (Boat Owners)",
              "Voyage listings: departure/arrival locations, dates, duration, crew requirements, and any compensation or cost-sharing details",
              "Communications: messages sent to other users through the Platform's messaging system",
              "Identity verification documents, if you choose to submit them for verified profile status",
              "Payment information, if applicable, processed through our third-party payment provider",
            ]} />
          </Sub>
          <Sub title="1.2 Information We Collect Automatically">
            <P>When you use the Platform, we automatically collect:</P>
            <Ul items={[
              "Device and usage data: IP address, device type, operating system, browser type, and app version",
              "Log data: pages visited, features used, time and date of access, and referring URLs",
              "Location data: approximate location based on IP address; precise GPS location only if you grant permission",
              "Cookies and similar tracking technologies: to maintain your session and improve Platform performance (see Section 8)",
            ]} />
          </Sub>
          <Sub title="1.3 Information from Third Parties">
            <P>We may receive information about you from:</P>
            <Ul items={[
              "Social login providers (e.g. Google, Apple) if you choose to sign in using those services",
              "Payment processors, for transaction status and fraud prevention",
              "Other users who may reference you in reviews or voyage reports",
            ]} />
          </Sub>
        </Section>

        <Section number="2" title="How We Use Your Information">
          <P>We use the information we collect to:</P>
          <Ul items={[
            "Create and manage your account",
            "Display your profile and listings to other users",
            "Facilitate connections between Boat Owners and Sailors",
            "Enable in-Platform messaging between users",
            "Process payments and manage financial transactions where applicable",
            "Send transactional notifications (booking confirmations, messages, safety alerts)",
            "Send marketing communications, with your consent where required by law",
            "Improve, personalize, and develop the Platform and its features",
            "Detect, investigate, and prevent fraud, abuse, and violations of our Terms of Use",
            "Comply with legal obligations",
          ]} />
          <P>We do not use your data to make automated decisions that produce significant legal effects on you without human review.</P>
        </Section>

        <Section number="3" title="Legal Bases for Processing (GDPR)">
          <P>If you are located in the European Economic Area (EEA) or United Kingdom, we process your personal data on the following legal bases:</P>
          <Ul items={[
            "Contract: to provide you with the Platform services you have requested",
            "Legitimate interests: to improve the Platform, prevent fraud, and maintain security",
            "Consent: for marketing communications and non-essential cookies",
            "Legal obligation: where we are required to process data by applicable law",
          ]} />
          <P>You may withdraw consent at any time without affecting the lawfulness of processing based on consent before its withdrawal.</P>
        </Section>

        <Section number="4" title="How We Share Your Information">
          <Sub title="4.1 With Other Users">
            <P>Profile information you provide — including your name, photo, experience level, certifications, and vessel details — is visible to other registered users of the Platform. Only share information you are comfortable making available to the Kroo community.</P>
          </Sub>
          <Sub title="4.2 With Service Providers">
            <P>We share data with trusted third-party service providers who help us operate the Platform, including:</P>
            <Ul items={[
              "Cloud hosting and infrastructure providers",
              "Payment processors (who handle financial data under their own privacy policies)",
              "Email and push notification services",
              "Analytics providers (used in aggregated or anonymized form where possible)",
              "Customer support tools",
            ]} />
            <P>These providers are contractually required to protect your data and may not use it for their own purposes.</P>
          </Sub>
          <Sub title="4.3 Legal and Safety Disclosures">
            <P>We may disclose your information where required to:</P>
            <Ul items={[
              "Comply with a court order, subpoena, or applicable law",
              "Protect the rights, safety, or property of Kroo, our users, or the public",
              "Investigate potential violations of our Terms of Use",
            ]} />
          </Sub>
          <Sub title="4.4 Business Transfers">
            <P>If Kroo is involved in a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction. We will notify you via email or Platform notice before your data is transferred and becomes subject to a different privacy policy.</P>
          </Sub>
          <Sub title="4.5 No Sale of Personal Data">
            <P>Kroo does not sell your personal data to third parties for their own marketing purposes.</P>
          </Sub>
        </Section>

        <Section number="5" title="Location Data">
          <P>Voyage listings on Kroo include departure and destination ports, which are publicly visible. If you grant the Platform permission to access your device's precise location, this may be used to show nearby listings or improve search results. You can withdraw location permission at any time through your device settings.</P>
        </Section>

        <Section number="6" title="Data Retention">
          <P>We retain your personal data for as long as your account is active, or as necessary to provide our services. Specifically:</P>
          <Ul items={[
            "Account data is retained until you delete your account, plus up to 90 days for backup and recovery purposes",
            "Messages and voyage history may be retained for up to 3 years to resolve disputes and comply with legal obligations",
            "Financial records are retained for a minimum of 7 years as required by tax and accounting regulations",
            "Anonymized or aggregated analytics data may be retained indefinitely",
          ]} />
          <P>Upon account deletion, we will delete or anonymize your personal data, except where retention is required by law.</P>
        </Section>

        <Section number="7" title="Your Privacy Rights">
          <P>Depending on your location, you may have the following rights regarding your personal data:</P>
          <Ul items={[
            "Access: request a copy of the personal data we hold about you",
            "Correction: request that we correct inaccurate or incomplete data",
            "Deletion: request that we delete your personal data ("right to be forgotten")",
            "Portability: request your data in a structured, machine-readable format",
            "Restriction: request that we limit how we use your data in certain circumstances",
            "Objection: object to processing based on legitimate interests",
            "Opt-out of marketing: unsubscribe from promotional emails at any time via the link in the email or through your account settings",
          ]} />
          <P>To exercise any of these rights, contact us at privacy@kroo.app. We will respond within 30 days (or as required by applicable law). We may need to verify your identity before processing your request.</P>
          <P>If you are in the EEA or UK and believe we have not handled your data lawfully, you have the right to lodge a complaint with your local data protection authority.</P>
        </Section>

        <Section number="8" title="Cookies and Tracking Technologies">
          <P>Kroo uses cookies and similar technologies to:</P>
          <Ul items={[
            "Keep you logged in during your session",
            "Remember your preferences",
            "Analyze Platform usage and performance",
            "Serve relevant in-Platform content",
          ]} />
          <P>You can control cookies through your browser settings. Disabling certain cookies may affect Platform functionality. Where required by law, we will request your consent before setting non-essential cookies.</P>
        </Section>

        <Section number="9" title="Data Security">
          <P>We implement industry-standard security measures to protect your personal data, including encrypted data transmission (TLS), secure data storage, and access controls. However, no system is completely secure and we cannot guarantee the absolute security of your information.</P>
          <P>In the event of a data breach that is likely to affect your rights and freedoms, we will notify you and relevant authorities as required by applicable law.</P>
        </Section>

        <Section number="10" title="Children's Privacy">
          <P>The Kroo Platform is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from minors. If we become aware that a minor has created an account, we will promptly delete their data and close the account. If you believe a minor has provided us with their data, please contact us at privacy@kroo.app.</P>
        </Section>

        <Section number="11" title="International Data Transfers">
          <P>Kroo may transfer your personal data to countries outside your own, including countries that may not provide the same level of data protection as your home country. When we do so, we use appropriate safeguards such as Standard Contractual Clauses approved by the European Commission, or other lawful transfer mechanisms.</P>
        </Section>

        <Section number="12" title="Third-Party Links and Services">
          <P>The Platform may contain links to third-party websites or integrate with third-party services (such as weather apps or nautical chart services). This Privacy Policy does not apply to those third parties. We encourage you to review the privacy policies of any third-party services you use.</P>
        </Section>

        <Section number="13" title="Changes to This Privacy Policy">
          <P>We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will notify you of material changes by posting the updated policy on the Platform and, where appropriate, by email. The date at the top of this policy indicates when it was last revised.</P>
          <P>Your continued use of the Platform after the effective date of any changes constitutes your acceptance of the revised Privacy Policy.</P>
        </Section>

        <Section number="14" title="Contact and Data Controller">
          <P>Kroo is the data controller responsible for your personal information. If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:</P>
          <P>Kroo — Privacy Team</P>
          <P>privacy@kroo.app</P>
        </Section>

        <p className="text-xs text-gray-400 italic text-center mt-4 mb-8">— End of Privacy Policy —</p>
      </div>
    </div>
  );
}
