import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy · Free-Klondike-Solitaire.com" },
      { name: "description", content: "Privacy Policy for Free-Klondike-Solitaire.com by Publish Port." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:site_name", content: "Free-Klondike-Solitaire.com" },
      { property: "og:title", content: "Privacy Policy · Free-Klondike-Solitaire.com" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.free-klondike-solitaire.com/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "canonical", href: "https://www.free-klondike-solitaire.com/privacy" },
    ],
  }),
});

function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[760px] px-4 py-10 sm:py-16">
      <Link
        to="/"
        className="text-xs uppercase tracking-[0.22em] text-muted-foreground transition hover:text-foreground"
      >
        ← Back to game
      </Link>
      <h1
        className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Privacy Policy
      </h1>
      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Last Updated: July 29, 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">

        <Section n="1" title="Introduction">
          <p>This Privacy Policy (the "Privacy Policy") describes the privacy policy for your access and/or use of our website located at https://www.free-klondike-solitaire.com and any services offered or provided by Publish Port ("Company," "we," "our," or "us") through the website located at https://www.free-klondike-solitaire.com or otherwise provided by us (the "Site"). We own and operate the Site.</p>
          <p className="mt-3">We are committed to protecting the privacy and security of your personal information. This Privacy Policy describes how we collect, use, share, and protect the personal information of visitors to our Site.</p>
        </Section>

        <Section n="2" title="Acceptance of Privacy Policy">
          <p>If you are accessing and/or using our Site and/or services for an entity, such as the company you work for, you represent that you have authority to bind that entity to this Privacy Policy, and you agree that "you," and "your," and "yourself" as used in this Privacy Policy includes both you personally and the entity you represent. If you are accessing our Site and/or services on behalf of only yourself as an individual, then you agree that "you," and "your," and "yourself" as used in this Privacy Policy includes only you personally as an individual.</p>
          <p className="mt-3">This Privacy Policy constitutes a legally binding agreement made between you and us. By accessing and/or using our Site, you agree: (i) to the collection and use of information in accordance with this Privacy Policy; (ii) that you have read and familiarized yourself with this Privacy Policy; (iii) you understand this Privacy Policy, and (iv) you are bound by this Privacy Policy. If you do not accept and agree to all of this Privacy Policy, then you MUST NOT access and/or use this Site and/or our services.</p>
        </Section>

        <Section n="3" title="Minimum Age">
          <p>You represent to us that you are lawfully able to enter into contracts in the jurisdiction where you are a citizen (e.g., you are not a minor according to applicable local laws). The Site is not intended to be used by persons who are minors under applicable law. If you are a minor according to applicable laws, then you must not use the Site and/or any of the services offered by us.</p>
          <p className="mt-3">We do not knowingly collect, solicit data from, or market to persons who are a minor according to applicable local laws. If we learn that personal information from users who is a minor according to applicable local law has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from someone who is a minor according to applicable local laws, please contact us immediately by emailing us at contact@free-klondike-solitaire.com with the subject line "Privacy Policy."</p>
        </Section>

        <Section n="4" title="Information We Collect">
          <p>We may collect personal information from you for commercial and business purposes. Personal information refers to information that identifies, relates to, describes, is reasonably capable of being associated with, or could reasonably be linked, directly or indirectly with you or your household or the company you work for and/or represent. We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
          <ul className="mt-3 space-y-3 list-none">
            <Li label="Personally Identifiable Information">Information you voluntarily provide to us. This may include any information you provide to us on the Site, your name, mailing and/or physical address, email address, phone number(s), and any other information you choose to provide.</Li>
            <Li label="Information Stored On Your Device">We may write data to your browser's local storage in order to remember your Site preferences and in order to potentially provide you with other Site functionality which may include, but is not necessarily limited to saving your chosen card back and card face styles. In the future, we may store data which will allow you to pick up with your solitaire game where you left off. None of this data is transmitted to us. This data is stored only on your device. As such, you can clear your browser storage to remove this data. If you clear your browser storage, then you may impair the functionality of the Site.</Li>
            <Li label="Consumer Activity Records">If you make a transaction with us, then we may receive or obtain your consumer activity records. This may include credit reports, purchasing history, or information about other transactions you made with us.</Li>
            <Li label="Derivative Data">Information our servers automatically collect when you access the Site, such as your IP address, geological data, your browser type, your operating system, your access times, the pages you have viewed directly before and after accessing the Site, online usage, any other information which may be necessary for the obtaining of any services from us or any of our related companies. Some of this data may be collected through standard server logs and analytics tools (e.g., Google Analytics, Google Adsense).</Li>
            <Li label="Cookies">We may use cookies to help customize the Site and improve your experience. Most browsers are set to accept cookies by default. You can choose to set your browser to remove or reject cookies, but be aware that such action could affect the availability and functionality of the Site. For more details, see our Cookies Policy located in Section 7 of this Privacy Policy.</Li>
          </ul>
          <p className="mt-3">Additionally, we may collect nonpublic personal information about you from the following sources: online requests for information about our products and services; applications or agreements you submit; third-party payment processors; comments on social media or blogs; employment inquiries; and communications between you and us. We may also receive data about you from third-party sources, social media platforms, ad servers, and data providers to better understand your interests and serve relevant content.</p>
        </Section>

        <Section n="5" title="How We Use Your Information">
          <p>Having accurate information about you permits us to provide you with a smooth and efficient experience. Specifically, we may use information collected about you to:</p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside">
            {[
              "Provide, administer and improve the Site and/or our services.",
              "Respond to your inquiries and fulfill your requests for information about us.",
              "Send you updates, newsletters, and other marketing communications that you have requested.",
              "Monitor and analyze usage and trends to improve the functionality and content of the Site.",
              "Fulfill transactions and/or billing and account management, if applicable.",
              "For safety, security, compliance, fraud prevention and due diligence purposes.",
              "Protect us or others, as well as to detect and investigate activities that may be illegal or prohibited.",
              "Verify your identity if you make requests pursuant to this Privacy Policy.",
              "Contact you in response to your feedback or other matters related to our relationship with you.",
              "Test, develop, analyze, and improve our products, our Site and/or our services.",
              "Customize your experience with us and/or to conduct research and analysis.",
              "In pursuit of our legitimate business interests.",
              "As otherwise disclosed or permitted by law, or as we may notify you from time to time.",
              "To comply with legal and regulatory requirements.",
            ].map((item, i) => <li key={i}>{item}</li>)}
          </ul>
          <p className="mt-3">We may use your email to tell you about your usage of the Site and/or our services, new features, solicit your feedback, or to inform you about our products, upcoming events or other promotions. If you do not want to receive such communications, please contact us at contact@free-klondike-solitaire.com with the subject line "Privacy Policy." You may also follow unsubscribe instructions included in emails or access email preferences in your account settings where available.</p>
        </Section>

        <Section n="6" title="How We Share Your Information">
          <p>We do not sell your personal information. We may share information we have collected about you in certain situations:</p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside">
            <li>If we believe the release of information is necessary to respond to legal process, investigate potential violations of our policies, or protect the rights, property, and safety of others.</li>
            <li>With third-party vendors, consultants, and service providers who perform services on our behalf (e.g., data analysis, Google Adsense, email delivery, hosting services).</li>
            <li>In connection with a merger, sale of company assets, financing, or acquisition of our business.</li>
            <li>Information you have authorized us to share with a third party.</li>
            <li>To fulfill requests from you.</li>
          </ul>
        </Section>

        <Section n="7" title="Cookies Policy">
          <p>This Cookies Policy explains the different types of cookies and similar technologies that may be applied on the browsers and devices of consumers who visit our Site. If you have questions, please contact us via email at contact@free-klondike-solitaire.com.</p>
          <div className="mt-4 space-y-4">
            <SubSection title="7.1 Consent">
              By continuing to use our Site and/or our services, you are agreeing to the use of cookies and other similar technologies for the purposes we describe in this Cookies Policy.
            </SubSection>
            <SubSection title="7.2 What Are Cookies?">
              Cookies are small text files which are downloaded to your browser or device when you visit a website or an app. Most web pages and apps contain elements from multiple sources so when you use our Site, your browser or device may receive cookies from several sources. This includes third parties that provide services on our behalf, such as website analytics or ad targeting. We do not have access or control over third-party cookies. Our emails and/or messages may contain a "web beacon pixel" to tell us whether our emails are opened and verify any clicks through to links within the email.
            </SubSection>
            <SubSection title="7.3 Why Do We Use Cookies?">
              Our Site uses both first-party cookies (set directly by us) and third-party cookies. Some cookies are required for technical reasons ("Strictly Necessary"). Some allow us to measure and improve performance ("Performance"). Some enable enhanced functionality and personalization ("Functional"). Finally, some enable us and our partners to serve targeted advertisements ("Targeting").
            </SubSection>
            <SubSection title="7.4 Cookie Preferences And Disabling Cookies">
              You may set your cookie preferences or delete cookies via your browser settings at http://www.allaboutcookies.org/manage-cookies/index.html. Please note that disabling cookies may affect Site functionality. You may download a browser extension to preserve opt-out preferences by visiting www.aboutads.info/PMC.
            </SubSection>
            <SubSection title="7.5 Opting Out Of Targeted Advertising By Third Parties">
              You can opt-out of third-party targeting cookies on the Digital Advertising Alliance's consumer choice page (http://optout.aboutads.info) or the Network Advertising Initiative's consumer choice page (http://optout.networkadvertising.org). Opting out of targeted advertising will not opt you out of being served generic ads.
            </SubSection>
            <SubSection title="7.6 Types Of Cookies We May Use">
              <ul className="mt-2 space-y-1.5 list-disc list-inside">
                <li><strong className="text-foreground/80">Strictly Necessary Cookies:</strong> Enable you to navigate the Site and use its features. These cannot be switched off.</li>
                <li><strong className="text-foreground/80">Performance Cookies:</strong> Improve your experience by enabling personalization and certain features.</li>
                <li><strong className="text-foreground/80">Functional Cookies – Analytics:</strong> Help us learn how well our Site is performing.</li>
                <li><strong className="text-foreground/80">Targeting Cookies:</strong> Collect information about browsing habits to make advertising more relevant to you.</li>
                <li><strong className="text-foreground/80">Unclassified:</strong> Cookies we are in the process of classifying.</li>
              </ul>
            </SubSection>
          </div>
        </Section>

        <Section n="8" title="Links to Other Websites">
          <p>This Privacy Policy applies only to the Site and not to any third-party sites, apps or hosted services you may find through our Site. If you submit information to those sites, your data will be governed by their privacy policies. We encourage you to carefully read the privacy policy of any site you visit.</p>
          <p className="mt-3">We use third-party advertising companies to serve ads when you visit the Site. These companies may use aggregated information about your visits to this and other websites to provide advertisements about goods and services of interest to you.</p>
        </Section>

        <Section n="9" title="Do Not Track">
          <p>Currently, various browsers offer a "do not track" or "DNT" option that sends a signal to websites about the user's DNT preference setting. We do not currently commit to responding to browser's DNT preference across the Site because no common industry standard for DNT has been adopted. We take privacy and choices regarding privacy seriously and will continue to monitor the development around DNT browser technology.</p>
        </Section>

        <Section n="10" title="Data Security">
          <p>We use appropriate and reasonable administrative, technical, organizational and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that no security measures are perfect or impenetrable. We cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security. Transmission of personal information to and from our Site is at your own risk. You should only access the Site within a secure environment.</p>
        </Section>

        <Section n="11" title="Data Retention">
          <p>We will retain personal data that you provide to us through the Site for the period necessary to fulfill the purposes outlined in this Privacy Policy unless a longer retention period is required or permitted by law. When we have no ongoing legitimate business need to retain and/or process your personal data, we will either delete or anonymize such information, or, if this is not possible, securely store your personal information and isolate it from any further processing until deletion is possible.</p>
        </Section>

        <Section n="12" title="Marketing Opt-Out Rights">
          <p>You have the right to opt-out of receiving marketing communications from us at any time by following the unsubscribe link in our emails or by contacting us directly via email at contact@free-klondike-solitaire.com with the subject line "Privacy Policy." Depending on your jurisdiction, you may also have other rights regarding your personal information. Even if you opt-out of marketing communications, we may still send you transactional messages related to purchases you make regarding our Site and/or services.</p>
        </Section>

        <Section n="13" title="Data Protection Rights">
          <p>We value your rights with respect to your personal information. Depending on the jurisdiction where you reside, your rights may include:</p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside">
            <li><strong className="text-foreground/80">Information:</strong> Request confirmation of whether we store, use, or share your personal information.</li>
            <li><strong className="text-foreground/80">Access:</strong> Request copies of your personal information.</li>
            <li><strong className="text-foreground/80">Rectification:</strong> Change or modify personal information you believe is out-of-date or incorrect.</li>
            <li><strong className="text-foreground/80">Erasure:</strong> Request erasure of your personal information, subject to certain exceptions.</li>
            <li><strong className="text-foreground/80">Restrict Processing:</strong> Restrict our uses of your personal information under certain circumstances.</li>
            <li><strong className="text-foreground/80">Data Portability:</strong> Request copies of your personal information in an electronic format.</li>
            <li><strong className="text-foreground/80">Object to Processing or Withdraw Consent:</strong> Object to our use of your personal information or withdraw consent where you have given it.</li>
            <li><strong className="text-foreground/80">Avoid Automated Decision-Making:</strong> The right not to be subject to a decision based solely on automated processing, subject to certain exceptions.</li>
          </ul>
          <p className="mt-3">You may contact us directly via email at contact@free-klondike-solitaire.com with the subject line "Privacy Rights" to request a copy or deletion of your personal data. We will respond within a reasonable timeframe.</p>

          <div className="mt-6 space-y-5">
            <SubSection title="13.1 Rights of California Residents">
              If you reside in the State of California, you have additional rights under the California Consumer Privacy Act. You have the right to know about personal information collected, disclosed or sold; to request deletion of personal information; and to be free from discrimination for exercising your rights. To exercise these rights, contact us at contact@free-klondike-solitaire.com with the subject line "California Privacy Rights." We will respond to verifiable consumer requests within forty-five (45) days.
            </SubSection>
            <SubSection title="13.2 Rights of Colorado Residents">
              If you reside in the State of Colorado, you have additional rights under the Colorado Privacy Act ("CPA"), including the right to be informed, access, correct, delete, and port your personal data, and to opt out of targeted advertising, sale, or profiling. We do not sell or share your personal information as defined under the CPA. To appeal a declined request, contact us at contact@free-klondike-solitaire.com with the subject line "Colorado Privacy Rights."
            </SubSection>
            <SubSection title="13.3 Rights of Connecticut Residents">
              If you reside in the State of Connecticut, you have additional rights under the Connecticut Data Privacy Act ("CTDPA"), including the right to be informed, access, correct, delete, and port your personal data, and to opt out of targeted advertising, sale, or profiling. We do not sell or share your personal information as defined under the CTDPA. To appeal a declined request, contact us at contact@free-klondike-solitaire.com with the subject line "Connecticut Privacy Rights."
            </SubSection>
            <SubSection title="13.4 Rights of Nevada Residents">
              If you reside in the State of Nevada, you have the right to request that we do not sell your personal information. Please submit your request to contact@free-klondike-solitaire.com with the subject line "Nevada Privacy Rights."
            </SubSection>
            <SubSection title="13.5 Rights of Utah Residents">
              If you reside in the State of Utah, you have additional rights under the Utah Consumer Privacy Act ("UCPA"), including the right to be informed, access, delete, and port your personal data, and to opt out of targeted advertising or the sale of personal data. We do not sell or share your personal information as defined under the UCPA. Contact us at contact@free-klondike-solitaire.com with the subject line "Utah Privacy Rights."
            </SubSection>
            <SubSection title="13.6 Rights of Virginia Residents">
              If you reside in the State of Virginia, you have additional rights under the Virginia Consumer Data Protection Act ("VCDPA"), including the right to be informed, access, correct, delete, and port your personal data, and to opt out of targeted advertising, sale, or profiling. We do not sell or share your personal information as defined under the VCDPA. Contact us at contact@free-klondike-solitaire.com with the subject line "Virginia Privacy Rights." If your appeal is denied, you may contact the Attorney General to submit a complaint.
            </SubSection>
            <SubSection title="13.7 Rights of Australia Residents">
              If you reside in Australia, you have rights to access and correct your personal information, and to opt out of direct marketing. Contact us at contact@free-klondike-solitaire.com with the subject line "Australia Privacy Rights." If unsatisfied with our handling of a complaint, you may refer it to the Office of the Australian Information Commissioner (enquiries@oaic.gov.au, Telephone: 1300 363 992, www.oaic.gov.au).
            </SubSection>
            <SubSection title="13.8 Rights of Canada Residents">
              If you reside in Canada, you have rights to access and correct your personal information and to withdraw consent. Contact us at contact@free-klondike-solitaire.com with the subject line "Canada Privacy Rights." If unsatisfied, you may lodge a complaint with the Office of the Privacy Commissioner of Canada: https://www.priv.gc.ca/en/report-a-concern/file-a-formal-privacy-complaint/.
            </SubSection>
            <SubSection title="13.9 Rights of New Zealand Residents">
              If you reside in New Zealand and have an established business relationship with us, you may have rights to access and correct your personal information. Contact us at contact@free-klondike-solitaire.com with the subject line "New Zealand Privacy Rights."
            </SubSection>
            <SubSection title="13.10 Rights of European Economic Area and United Kingdom Residents">
              Our operations are located primarily in the United States. If you provide information to us, it will be transferred to the United States. By providing personal information, you are consenting to its storage and use as described in this Policy. Under the GDPR you have rights including: the right to be informed, the right of access, the right to rectification, the right to erasure, the right to restrict processing, the right of data portability, and the right to object. Contact us at contact@free-klondike-solitaire.com with the subject line "UK or EU Privacy Rights."
            </SubSection>
            <SubSection title="13.11 Rights of South Africa Residents">
              If you reside in South Africa, you have the right to request access to or correction of your personal information. Contact us at contact@free-klondike-solitaire.com with the subject line "South Africa Privacy Rights." If unsatisfied, you may contact The Information Regulator (South Africa) at enquiries@inforegulator.org.za.
            </SubSection>
            <SubSection title="13.12 Rights for Other Jurisdictions">
              If you are located in another jurisdiction not specifically discussed in this Privacy Policy, you may have rights under applicable data privacy laws. Please send your written request to contact@free-klondike-solitaire.com with the subject line "Other Privacy Rights."
            </SubSection>
          </div>
        </Section>

        <Section n="14" title="Terms of Use">
          <p>Our Terms of Use (currently published at https://www.free-klondike-solitaire.com/terms) applies to your access and/or use of the Site and/or our services, and its terms are made a part of and incorporated into this Privacy Policy by this reference. By accessing and/or using the Site and/or our services, you acknowledge that you have read our Terms and agree to our Terms.</p>
        </Section>

        <Section n="15" title="Privacy Policy Changes">
          <p>We reserve the right, at our sole discretion, to change, modify, add or remove all or portions of this Privacy Policy at any time. It is your responsibility to check this Privacy Policy periodically for changes. If we make any material changes, we will update the "Last Updated" date at the top of this Privacy Policy. Your continued use of our Site and/or our services following the posting of any changes will mean that you accept and agree to the changes.</p>
        </Section>

        <Section n="16" title="Miscellaneous">
          <p>This Privacy Policy and any policies and/or operating rules posted by us on our Site constitutes the entire agreement between you and us concerning this subject matter and supersedes any prior version. Our failure to exercise or enforce any right or provision of this Privacy Policy shall not operate as a waiver of such right or provision. This Privacy Policy operates to the fullest extent permissible by law. If any provision is found to be invalid, the remaining provisions shall continue in full force and effect. There is no joint venture, partnership, employment or agency relationship created between you and us as a result of this Privacy Policy or your use of our Site.</p>
        </Section>

        <Section n="17" title="Contact Us">
          <p>If you have questions or comments about this Privacy Policy, please contact us by email at <a href="mailto:contact@free-klondike-solitaire.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@free-klondike-solitaire.com</a> with the subject line "Privacy Policy" and please make sure you provide us with enough information in the email so we can clearly understand the issue.</p>
        </Section>

      </div>

      <SiteFooter showBackLink />
    </main>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-foreground">
        {n}. {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 text-sm font-semibold text-foreground/80">{title}</h3>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function Li({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li>
      <strong className="text-foreground/80">{label}:</strong>{" "}
      {children}
    </li>
  );
}
