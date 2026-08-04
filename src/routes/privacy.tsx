import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy · Solitaire Station" },
      { name: "description", content: "Privacy Policy for Solitaire Station — free online solitaire. No account or sign-up required. Your game data stays on your device." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:title", content: "Privacy Policy · Solitaire Station" },
      { property: "og:description", content: "Privacy Policy for Solitaire Station. No account required. Your game data stays on your device." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/privacy` },
      { property: "og:image", content: `${SITE_URL}/og/klondike.png?v=6` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:image", content: `${SITE_URL}/og/klondike.png?v=6` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/privacy` },
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
        Last Updated: August 2, 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">

        <Section n="1" title="Introduction">
          <p>This Privacy Policy (the "Privacy Policy") describes the privacy policy for your access and/or use of our website located at https://www.solitairestation.com and any services offered or provided by Publish Port ("Company," "we," "our," or "us") through the website located at https://www.solitairestation.com or otherwise provided by us (the "Site"). We own and operate the Site.</p>
          <p className="mt-3">We are committed to protecting the privacy and security of your personal information. This Privacy Policy describes how we collect, use, share, and protect the personal information of visitors to our Site.</p>
        </Section>

        <Section n="2" title="Acceptance of Privacy Policy">
          <p>If you are accessing and/or using our Site and/or services for an entity, such as the company you work for, you represent that you have authority to bind that entity to this Privacy Policy, and you agree that "you," and "your," and "yourself" as used in this Privacy Policy includes both you personally and the entity you represent. If you are accessing our Site and/or services on behalf of only yourself as an individual, then you agree that "you," and "your," and "yourself" as used in this Privacy Policy includes only you personally as an individual.</p>
          <p className="mt-3">This Privacy Policy constitutes a legally binding agreement made between you and us. By accessing and/or using our Site, you agree: (i) to the collection and use of information in accordance with this Privacy Policy; (ii) that you have read and familiarized yourself with this Privacy Policy; (iii) you understand this Privacy Policy, and (iv) you are bound by this Privacy Policy. If you do not accept and agree to all of this Privacy Policy, then you MUST NOT access and/or use this Site and/or our services.</p>
        </Section>

        <Section n="3" title="Minimum Age">
          <p>You represent to us that you are lawfully able to enter into contracts in the jurisdiction where you are a citizen (e.g., you are not a minor according to applicable local laws). The Site is not intended to be used by persons who are minors under applicable law. If you are a minor according to applicable laws, then you must not use the Site and/or any of the services offered by us.</p>
          <p className="mt-3">We do not knowingly collect, solicit data from, or market to persons who are a minor according to applicable local laws. If we learn that personal information from users who is a minor according to applicable local law has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from someone who is a minor according to applicable local laws, please contact us immediately by emailing us at contact@solitairestation.com with the subject line "Privacy Policy" and please make sure you provide us with enough information in the email so we can clearly understand the issue.</p>
        </Section>

        <Section n="4" title="Information We Collect">
          <p>We may collect personal information from you for commercial and business purposes. Personal information refers to information that identifies, relates to, describes, is reasonably capable of being associated with, or could reasonably be linked, directly or indirectly with you or your household or the company you work for and/or represent. We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
          <ul className="mt-3 space-y-3 list-none">
            <Li label="Personally Identifiable Information">Information you voluntarily provide to us. This may include any information you provide to us on the Site, your name, mailing and/or physical address, email address, phone number(s), and any other information you choose to provide.</Li>
            <Li label="Information Stored On Your Device">We may write data to your browser's local storage in order to remember your Site preferences and in order to potentially provide you with other Site functionality which may include, but is not necessarily limited to saving your chosen card back and card face styles. In the future, we may store data which will allow you to pick up with your solitaire game where you left off. None of this data is transmitted to us. This data is stored only on your device. As such, you can clear your browser storage to remove this data. If you clear your browser storage, then you may impair the functionality of the Site.</Li>
            <Li label="Consumer Activity Records">If you make a transaction with us, then we may receive or obtain your consumer activity records. This may include credit reports, purchasing history, or information about other transactions you made with us.</Li>
            <Li label="Derivative Data">Information our servers automatically collect when you access the Site, such as your IP address, geological data, your browser type, your operating system, your access times, the pages you have viewed directly before and after accessing the Site, online usage, any other information which may be necessary for the obtaining of any services from us or any of our related companies. Some of this data may be collected through standard server logs and analytics tools (e.g., Google Analytics, Google Adsense).</Li>
            <Li label="Cookies">We may use cookies to help customize the Site and improve your experience. Most browsers are set to accept cookies by default. You can choose to set your browser to remove or reject cookies, but be aware that such action could affect the availability and functionality of the Site. For more details, see our Cookies Policy located in Section 8 of this Privacy Policy.</Li>
          </ul>
          <p className="mt-3">Additionally, we may collect nonpublic personal information about you from the following sources: online requests for information about our products and services; applications or agreements you submit; third-party payment processors; comments on social media or blogs; employment inquiries; communications between you and us; and information received from third-party sources such as social media platforms, ad servers, and data providers. We may also obtain information such as your name, company name, job title, industry and other profile information from public sources and third-party data providers to better understand your interests and deliver personalized services and relevant advertising. If you prefer not to have your information used for this purpose, you can opt out at any time by contacting us at contact@solitairestation.com with the subject line "Privacy Policy."</p>
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
          <p className="mt-3">We may use your email to tell you about your usage of the Site and/or our services, new features, solicit your feedback, or to inform you about our products, upcoming events or other promotions. If you do not want to receive such communications, please contact us at contact@solitairestation.com with the subject line "Privacy Policy" and please make sure you provide us with enough information in the email so we can clearly understand the issue, including specifying your new choice. You may also follow unsubscribe instructions included in emails or access email preferences in your account settings where available.</p>
          <p className="mt-3">Where required by applicable law, we will only send you marketing information if you consent to us doing so. You have the right to withdraw your consent at any time, and to have your name deleted from our mailing or calling lists, by contacting us at contact@solitairestation.com with the subject line "Privacy Policy." Please note that if you opt out from marketing communications, we may still contact you regarding issues related to our Site and/or our services and to respond to your requests.</p>
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

        <Section n="7" title="How We Handle Your Social Media Logins">
          <p>Our Site may offer you the ability to register and log in using your third party social media account details. Where you choose to do this, we will receive certain profile information about you from your social media provider. The profile information we receive may vary depending on the social media provider and will often include your name, email address, friends list, and profile picture, as well as other information you choose to make public on such a social media platform. If you log in using Facebook or other social media platforms, we may also request access to other permissions related to your account, such as your friends, check-ins, and likes, and you may choose to grant or deny us access to each individual permission.</p>
          <p className="mt-3">We will use the information we receive only for the purposes that are described in this Privacy Policy or that are otherwise made clear to you on the Site. We do not control, and are not responsible for other uses of your personal information by your third party social media provider. We recommend that you review their privacy notice to understand how they collect, use, and share your personal information, and how you can set your privacy preferences on their sites and apps.</p>
        </Section>

        <Section n="8" title="Cookies Policy">
          <p>This Cookies Policy explains the different types of cookies and similar technologies that may be applied on the browsers and devices of consumers who visit our Site. This Cookies Policy does not apply to the privacy practices of third-party websites and/or apps which may be linked to the Site. If you have questions or concerns, please contact us via email at contact@solitairestation.com.</p>
          <div className="mt-4 space-y-4">
            <SubSection title="8.1 Consent">
              By continuing to use our Site and/or our services, you are agreeing to the use of cookies and other similar technologies for the purposes we describe in this Cookies Policy.
            </SubSection>
            <SubSection title="8.2 What Are Cookies?">
              Cookies are small text files which are downloaded to your browser or device when you visit a website or an app. Most web pages and apps contain elements from multiple sources so when you use our Site, your browser or device may receive cookies from several sources. This includes third parties that provide services on our behalf, such as website analytics or ad targeting. We do not have access or control over third-party cookies. We may also use local shared objects to store your user preferences and settings. Our emails and/or messages may contain a "web beacon pixel" to tell us whether our emails are opened and verify any clicks through to links within the email.
            </SubSection>
            <SubSection title="8.3 Why Do We Use Cookies?">
              Our Site uses both first-party cookies (set directly by us) and third-party cookies. Some cookies are required for technical reasons ("Strictly Necessary"). Some allow us to measure and improve performance ("Performance"). Some enable enhanced functionality and personalization ("Functional"). Finally, some enable us and our partners to serve targeted advertisements ("Targeting").
            </SubSection>
            <SubSection title="8.4 Cookie Preferences And Disabling Cookies">
              You may set your cookie preferences or delete cookies via your browser settings at http://www.allaboutcookies.org/manage-cookies/index.html. Please note that disabling cookies may affect Site functionality and may stop you from saving customized settings. You may download a browser extension to preserve opt-out preferences by visiting www.aboutads.info/PMC.
            </SubSection>
            <SubSection title="8.5 Opting Out Of Targeted Advertising By Third Parties">
              You can opt-out of third-party targeting cookies on the Digital Advertising Alliance's consumer choice page (http://optout.aboutads.info) or the Network Advertising Initiative's consumer choice page (http://optout.networkadvertising.org). Some third-party providers have their own opt-out mechanisms linked from their websites or privacy policies. Opting out of targeted advertising will not opt you out of being served generic ads, including those on the Site (for example, Google Adsense).
            </SubSection>
            <SubSection title="8.6 Types Of Cookies We May Use">
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

        <Section n="9" title="Links to Other Websites">
          <p>This Privacy Policy applies only to the Site and not to any third-party sites, apps or hosted services you may find through our Site. If you submit information to those sites, your data will be governed by their privacy policies. We encourage you to carefully read the privacy policy of any site you visit.</p>
          <p className="mt-3">We use third-party advertising companies to serve ads when you visit the Site. These companies may use aggregated information about your visits to this and other websites to provide advertisements about goods and services of interest to you.</p>
        </Section>

        <Section n="10" title="Do Not Track">
          <p>Currently, various browsers offer a "do not track" or "DNT" option that sends a signal to websites about the user's DNT preference setting. We do not currently commit to responding to browser's DNT preference across the Site because no common industry standard for DNT has been adopted by industry groups, technology companies or regulators, including no consistent standard of interpreting user intent. We take privacy and choices regarding privacy seriously and will continue to monitor the development around DNT browser technology and the implementation of a standard for DNT.</p>
        </Section>

        <Section n="11" title="Data Security">
          <p>We use appropriate and reasonable administrative, technical, organizational and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that no security measures are perfect or impenetrable. We cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Site and in our services is at your own risk. You should only access the Site and/or our services within a secure environment.</p>
        </Section>

        <Section n="12" title="Data Retention">
          <p>We will retain personal data that you provide to us through the Site and/or our services for the period necessary to fulfill the purposes outlined in this Privacy Policy, in our Terms, as set forth in a contract between you and us or unless a longer retention period is required or permitted by law. When we have no ongoing legitimate business need to retain and/or process your personal data, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.</p>
        </Section>

        <Section n="13" title="Marketing Opt-Out Rights">
          <p>You have the right to opt-out of receiving marketing communications from us at any time by following the unsubscribe link in our emails or by contacting us directly via email at contact@solitairestation.com with the subject line "Privacy Policy" and please make sure you provide us with enough information in the email so we can clearly understand the issue. Depending on your jurisdiction, you may also have other rights regarding your personal information. Even if you opt-out of receiving marketing communications, we will still send you transactional messages which include but are not limited to responses to your questions or emails and those related to purchases you make regarding our Site and/or services.</p>
        </Section>

        <Section n="14" title="Data Protection Rights">
          <p>We value your rights with respect to your personal information. Depending on the jurisdiction where you reside, your rights may include:</p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside">
            <li><strong className="text-foreground/80">Information:</strong> Request confirmation of whether we store, use, or share your personal information and be informed about with whom your personal information has been shared.</li>
            <li><strong className="text-foreground/80">Access:</strong> Request copies of your personal information.</li>
            <li><strong className="text-foreground/80">Rectification:</strong> Change or modify personal information you believe is out-of-date or incorrect.</li>
            <li><strong className="text-foreground/80">Erasure:</strong> Request erasure of your personal information, subject to certain exceptions as prescribed by applicable law.</li>
            <li><strong className="text-foreground/80">Restrict Processing:</strong> Restrict our uses of your personal information under certain circumstances as prescribed by applicable law.</li>
            <li><strong className="text-foreground/80">Data Portability:</strong> Request copies of your personal information in an electronic format and request that we send that information to you or another third party under certain circumstances as prescribed by applicable law.</li>
            <li><strong className="text-foreground/80">Object to Processing or Withdraw Consent:</strong> Object to our use of your personal information or withdraw consent where you have given it.</li>
            <li><strong className="text-foreground/80">Avoid Automated Decision-Making:</strong> The right not to be subject to a decision based solely on automated processing, including profiling, if this has a legal or other significant effect on you as an individual, subject to certain exceptions as prescribed by applicable law.</li>
          </ul>
          <p className="mt-3">We will comply with individuals' requests, including access, correction, and/or deletion of the personal information we store in accordance with the applicable law. We may deny certain requests, or fulfill a request only in part, based on our legal rights and obligations. We will take reasonable steps to verify your identity prior to responding to your requests. You can also designate an authorized agent to make a request on your behalf.</p>
          <p className="mt-3">You may contact us directly via email at contact@solitairestation.com with the subject line "Privacy Rights" and please make sure you provide us with enough information in the email so we can clearly understand the issue. We will respond to your request within a reasonable timeframe.</p>

          <div className="mt-6 space-y-5">
            <SubSection title="14.1 Rights of California Residents">
              <p>If you reside in the State of California, you have additional rights under the California Consumer Privacy Act as described herein. This information supplements our Privacy Policy for California residents only. The following rights do not apply to individuals who reside outside of California.</p>
              <p className="mt-3"><strong className="text-foreground/80">Notice at Collection of Personal Information:</strong> The personal information we collect about consumers and the business or commercial purposes for which it will be used are described in this Privacy Policy.</p>
              <p className="mt-3"><strong className="text-foreground/80">Right to Know About Personal Information Collected, Disclosed or Sold:</strong> As a California consumer, you have the right to request specific information from us regarding personal information collected about you or your household during the last twelve (12) months, including: categories of personal information collected; categories of sources; the business or commercial purpose for collecting; categories of third parties with whom it is shared; personal information disclosed for business purposes and the categories of third parties; and the specific pieces of personal information collected (except for very sensitive personally identifiable information).</p>
              <p className="mt-3">You may submit a "Right to Know Request" via email at contact@solitairestation.com with the subject line "California Right to Know."</p>
              <p className="mt-3"><strong className="text-foreground/80">Right to Request Deletion of Personal Information:</strong> You have a right to request that we delete any personal information about you which we have collected from you, subject to exclusions permitted by applicable law. Upon receipt and verification of a consumer request to delete personal information, we will delete (and direct third-party service providers to delete) your personal information from our records, unless an exclusion applies. To request deletion, email us at contact@solitairestation.com with the subject line "California Privacy Rights."</p>
              <p className="mt-3"><strong className="text-foreground/80">How to Make a Verifiable California Consumer Request:</strong> If you reside in California, you may exercise any of your rights by contacting us via email at contact@solitairestation.com with the subject line "California Privacy Rights." You may be required to provide verification of your identity, California residency, and information we have on file such as email address, phone number(s), full names, addresses and other personal information. If the identity or authority of the party making a request cannot be confirmed, we reserve the right to deny the request.</p>
              <p className="mt-3"><strong className="text-foreground/80">How We Will Respond to a Verifiable California Consumer Request:</strong> Subject to any delays and exclusions permitted by applicable law, we will respond to a verifiable consumer request within forty-five (45) days of receiving such request. The response will cover the twelve (12) month period preceding our receipt of the request. We will not charge you a fee to process or respond to your verifiable consumer request unless your request is excessive, repetitive or manifestly unfounded.</p>
              <p className="mt-3"><strong className="text-foreground/80">Protection from Discrimination:</strong> If you exercise your California consumer rights, we will not discriminate against you. Except as legally permitted, we will not deny you goods or services, charge you a different price, provide a different level of quality, or suggest that you may receive a different price or quality of goods or services.</p>
              <p className="mt-3"><strong className="text-foreground/80">Financial Incentives:</strong> We are permitted to offer certain financial incentives to encourage consumers to provide certain financial information. If offered, you will receive a written Notice of Financial Incentive describing the material terms and opt-in/opt-out process. You will only be enrolled if you opt-in and may revoke your opt-in at any time.</p>
              <p className="mt-3"><strong className="text-foreground/80">Rights Under "Shine the Light" Law:</strong> As a California resident, you may request a list of the types of customer information that we have provided to third parties for their direct marketing purposes and the names and addresses of all third parties with whom we have shared such information during the past calendar year. Written requests may be submitted to contact@solitairestation.com with the subject line "California Privacy Rights." We will provide such information at no cost within thirty (30) days.</p>
            </SubSection>

            <SubSection title="14.2 Rights of Colorado Residents">
              <p>If you reside in the State of Colorado, you have additional rights under the Colorado Privacy Act ("CPA"). This information supplements our Privacy Policy for Colorado residents only. Under the CPA, you have the following rights, which are not absolute and may be declined as permitted by law:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Right to be informed whether or not we are processing your personal data.</li>
                <li>Right to access your personal data.</li>
                <li>Right to correct inaccuracies in your personal data.</li>
                <li>Right to request deletion of your personal data.</li>
                <li>Right to obtain a copy of the personal data you previously shared with us.</li>
                <li>Right to opt out of the processing of your personal data if used for targeted advertising, the sale of personal data, or profiling.</li>
              </ul>
              <p className="mt-2">We do not sell or share your personal information as defined under the CPA. To appeal a declined request, contact us at contact@solitairestation.com with the subject line "Colorado Privacy Rights." Within forty-five (45) days of receipt of an appeal, we will inform you of any action taken or not taken and the reasons for the decisions.</p>
            </SubSection>

            <SubSection title="14.3 Rights of Connecticut Residents">
              <p>If you reside in the State of Connecticut, you have additional rights under the Connecticut Data Privacy Act ("CTDPA"). This information supplements our Privacy Policy for Connecticut residents only. Under the CTDPA, you have the following rights, which are not absolute:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Right to be informed whether or not we are processing your personal data.</li>
                <li>Right to access your personal data.</li>
                <li>Right to correct inaccuracies in your personal data.</li>
                <li>Right to request deletion of your personal data.</li>
                <li>Right to obtain a copy of the personal data you previously shared with us.</li>
                <li>Right to opt out of the processing of your personal data if used for targeted advertising, the sale of personal data, or profiling.</li>
              </ul>
              <p className="mt-2">We do not sell or share your personal information as defined under the CTDPA. To appeal a declined request, contact us at contact@solitairestation.com with the subject line "Connecticut Privacy Rights." Within forty-five (45) days of receipt of an appeal, we will inform you of any action taken and the reasons for the decisions.</p>
            </SubSection>

            <SubSection title="14.4 Rights of Nevada Residents">
              If you reside in the State of Nevada, you have the right to request that we do not sell your personal information. Please submit your request to contact@solitairestation.com with the subject line "Nevada Privacy Rights." We will process your request upon receipt. Within forty-five (45) days of receipt of an appeal, we will inform you in writing of any action taken or not taken and the reasons for the decisions. This information supplements our Privacy Policy for Nevada residents only.
            </SubSection>

            <SubSection title="14.5 Rights of Utah Residents">
              <p>If you reside in the State of Utah, you have additional rights under the Utah Consumer Privacy Act ("UCPA"). This information supplements our Privacy Policy for Utah residents only. Under the UCPA, you have the following rights, which are not absolute:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Right to be informed whether or not we are processing your personal data.</li>
                <li>Right to access your personal data.</li>
                <li>Right to request deletion of your personal data.</li>
                <li>Right to obtain a copy of the personal data you previously shared with us.</li>
                <li>Right to opt out of the processing of your personal data if used for targeted advertising or the sale of personal data.</li>
              </ul>
              <p className="mt-2">We do not sell or share your personal information as defined under the UCPA. Contact us at contact@solitairestation.com with the subject line "Utah Privacy Rights" to exercise your rights or appeal a declined request.</p>
            </SubSection>

            <SubSection title="14.6 Rights of Virginia Residents">
              <p>If you reside in the State of Virginia, you have additional rights under the Virginia Consumer Data Protection Act ("VCDPA"). This information supplements our Privacy Policy for Virginia residents only. Under the VCDPA, "Consumer" means a natural person who is a resident of the Commonwealth acting in an individual or household context (not commercial or employment context). "Personal data" means any information that is linked or reasonably linkable to an identified or identifiable natural person, and does not include de-identified data or publicly available information.</p>
              <p className="mt-2">Your rights with respect to your personal data include:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Right to be informed whether or not we are processing your personal data.</li>
                <li>Right to access your personal data.</li>
                <li>Right to correct inaccuracies in your personal data.</li>
                <li>Right to request deletion of your personal data.</li>
                <li>Right to obtain a copy of the personal data you previously shared with us.</li>
                <li>Right to opt out of the processing of your personal data if used for targeted advertising, the sale of personal data, or profiling.</li>
              </ul>
              <p className="mt-2">We do not sell or share your personal information as defined under the VCDPA. Contact us at contact@solitairestation.com with the subject line "Virginia Privacy Rights" to exercise your rights or appeal a declined request. Within forty-five (45) days, we will inform you of any action taken and the reasons for the decisions. If your appeal is denied, you may contact the Attorney General to submit a complaint.</p>
            </SubSection>

            <SubSection title="14.7 Rights of Australia Residents">
              <p>If you reside in Australia, you have the following additional rights:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li><strong className="text-foreground/80">Access:</strong> You may have the right to access the personal information held about you.</li>
                <li><strong className="text-foreground/80">Correction:</strong> You may have the right to correct your information when it is incorrect.</li>
                <li><strong className="text-foreground/80">Opt-out of Direct Marketing:</strong> Under the Australian Privacy Act, you have the right to opt out of the use of your personal information for direct marketing, including personalized advertising. You will still see non-personalized advertising.</li>
              </ul>
              <p className="mt-2">You may exercise the above rights by contacting us via email at contact@solitairestation.com with the subject line "Australia Privacy Rights." If you are not satisfied with our handling of a privacy complaint, you may refer it to the Office of the Australian Information Commissioner:</p>
              <p className="mt-2 pl-4 border-l border-white/10">
                GPO Box 5218 Sydney NSW 2001<br />
                Email: enquiries@oaic.gov.au<br />
                Telephone: 1300 363 992<br />
                Website: www.oaic.gov.au
              </p>
              <p className="mt-2">This information supplements our Privacy Policy for Australia residents only.</p>
            </SubSection>

            <SubSection title="14.8 Rights of Canada Residents">
              <p>If you reside in Canada, you have the following additional rights:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li><strong className="text-foreground/80">Access:</strong> You may have the right to request access to your personal information that we hold.</li>
                <li><strong className="text-foreground/80">Correction:</strong> You may be entitled to update or correct your information if it is inaccurate or incomplete.</li>
                <li><strong className="text-foreground/80">Withdraw Consent:</strong> You can withdraw your consent at any time to collection, use and disclosure of your personal information. Withdrawing your consent will not affect the lawfulness of any processing we conducted prior to your withdrawal.</li>
              </ul>
              <p className="mt-2">You may exercise the above rights by contacting us via email at contact@solitairestation.com with the subject line "Canada Privacy Rights." If you are not satisfied with our handling of a privacy complaint, you have the right to lodge that complaint with the Office of the Privacy Commissioner of Canada: https://www.priv.gc.ca/en/report-a-concern/file-a-formal-privacy-complaint/</p>
              <p className="mt-2">This information supplements our Privacy Policy for Canada residents only.</p>
            </SubSection>

            <SubSection title="14.9 Rights of New Zealand Residents">
              <p>If you reside in New Zealand and have an established business relationship with us, you may have the following additional rights:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li><strong className="text-foreground/80">Access:</strong> You may have the right to ask us for confirmation on whether we are processing your personal information, and request access to your personal information that we hold.</li>
                <li><strong className="text-foreground/80">Correction:</strong> You may be entitled to update or correct your information if it is inaccurate or incomplete.</li>
              </ul>
              <p className="mt-2">You may exercise the above rights by contacting us via email at contact@solitairestation.com with the subject line "New Zealand Privacy Rights." This information supplements our Privacy Policy for New Zealand residents who have an established business relationship with us only.</p>
            </SubSection>

            <SubSection title="14.10 Rights of European Economic Area and United Kingdom Residents">
              <p>If you reside in the European Economic Area or the United Kingdom, the following applies to you. Our operations are located primarily in the United States. If you provide information to us, the information will be transferred out of the EU or United Kingdom and sent to the United States. By providing personal information to us, you are consenting to its storage and use as described in this Policy.</p>
              <p className="mt-2">Under the General Data Protection Regulation ("GDPR") you have the following rights as a Data Subject:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li><strong className="text-foreground/80">Right to be informed:</strong> We must inform you of how we intend to use your personal data through the terms of this Policy.</li>
                <li><strong className="text-foreground/80">Right of access:</strong> You have the right to request access to the data we hold about you and we must respond within one month.</li>
                <li><strong className="text-foreground/80">Right to rectification:</strong> If you believe data we hold is incorrect, you have the right to have it corrected.</li>
                <li><strong className="text-foreground/80">Right to erasure:</strong> You can request that the information we hold about you be deleted, unless we have a compelling reason not to.</li>
                <li><strong className="text-foreground/80">Right to restrict processing:</strong> You can change your communication preferences or opt-out of certain communications.</li>
                <li><strong className="text-foreground/80">Right of data portability:</strong> You can obtain and use the data we hold for your own purposes without explanation.</li>
                <li><strong className="text-foreground/80">Right to object:</strong> You can file a formal objection with us regarding our use of your information with regard to third parties, or its processing where our legal basis is our legitimate interest.</li>
              </ul>
              <p className="mt-2">You may exercise the above rights by contacting us via email at contact@solitairestation.com with the subject line "UK or EU Privacy Rights." We also aim to encrypt and anonymize your personal information whenever possible and have protocols in place in the unlikely event of a data breach. The data controller responsible for your personal information for GDPR compliance can be contacted at contact@solitairestation.com with the subject line "UK or EU Privacy Rights."</p>
              <p className="mt-2">This information supplements our Privacy Policy for European Economic Area and United Kingdom residents only.</p>
            </SubSection>

            <SubSection title="14.11 Rights of South Africa Residents">
              <p>If you reside in South Africa, you have the right to request access to or correction of your personal information by contacting us at contact@solitairestation.com with the subject line "South Africa Privacy Rights."</p>
              <p className="mt-2">If you are unsatisfied with the manner in which we address any complaint with regard to our processing of personal information, you can contact the office of the regulator:</p>
              <p className="mt-2 pl-4 border-l border-white/10">
                The Information Regulator (South Africa)<br />
                General enquiries: enquiries@inforegulator.org.za<br />
                Complaints (complete POPIA/PAIA form 5): PAIAComplaints@inforegulator.org.za &amp; POPIAComplaints@inforegulator.org.za
              </p>
              <p className="mt-2">This information supplements our Privacy Policy for South Africa residents only.</p>
            </SubSection>

            <SubSection title="14.12 Rights for Other Jurisdictions">
              If you are located in another jurisdiction not specifically discussed in this Privacy Policy, you may have rights under applicable data privacy laws to request information about or access to your personal information, to require that inaccurate information be corrected, or in some circumstances, to object to our processing of your personal information. Please send your written request to contact@solitairestation.com with the subject line "Other Privacy Rights" and please make sure you provide us with enough information in the email so we can clearly understand the issue.
            </SubSection>
          </div>
        </Section>

        <Section n="15" title="Terms of Use">
          <p>Our Terms of Use (currently published at https://www.solitairestation.com/terms) applies to your access and/or use of the Site and/or our services, and its terms are made a part of and incorporated into this Privacy Policy by this reference. The Terms may be changed from time to time and such changes are effective immediately upon their posting. By accessing and/or using the Site and/or our services, you acknowledge that you have read our Terms and agree to our Terms. Capitalized terms used but not defined in this Privacy Policy will have the meanings assigned to them in our Terms.</p>
        </Section>

        <Section n="16" title="Privacy Policy Changes">
          <p>We reserve the right, at our sole discretion, to change, modify, add or remove all or portions of this Privacy Policy at any time. It is your responsibility to check this Privacy Policy periodically for changes. If we make any material changes to this Privacy Policy, we will update this Privacy Policy and change the "Last Updated" date at the top of this Privacy Policy. Unless otherwise indicated, any new material added to the Site and/or services will also be subject to this Privacy Policy. You must periodically review the Site and/or services for the latest information about our Privacy Policy. Your continued use of our Site and/or our services following the posting of any changes will mean that you accept and agree to the changes.</p>
        </Section>

        <Section n="17" title="Miscellaneous">
          <p>This Privacy Policy and any policies and/or operating rules posted by us on our Site and/or the services, including but not limited to the Terms, constitutes the entire agreement between you and us concerning this subject matter and supersedes any prior version of this Privacy Policy. Our failure to exercise or enforce any right or provision of this Privacy Policy shall not operate as a waiver of such right or provision. This Privacy Policy operates to the fullest extent permissible by law, rules and regulations. If any provision of this Privacy Policy is found by the arbitrator or (if proper) a court of competent jurisdiction to be invalid, the remaining provisions shall not be affected thereby and shall continue in full force and effect, and such provision may be modified or severed to the extent necessary to make it enforceable and consistent with the remainder of this Privacy Policy. There is no joint venture, partnership, employment or agency relationship created between you and us as a result of this Privacy Policy, the Terms and/or your use of our Site and/or the services. You agree that this Privacy Policy shall be construed as if drafted jointly by the parties hereto and in the event an ambiguity or question of intent or interpretation arises, no presumption or burden of proof shall arise favoring or disfavoring any party by virtue of the authorship of any provisions of this Privacy Policy.</p>
        </Section>

        <Section n="18" title="Contact Us">
          <p>If you have questions or comments about this Privacy Policy, please contact us by email at <a href="mailto:contact@solitairestation.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@solitairestation.com</a> with the subject line "Privacy Policy" and please make sure you provide us with enough information in the email so we can clearly understand the issue.</p>
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
