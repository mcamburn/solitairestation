import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Use · Free-Klondike-Solitaire.com" },
      { name: "description", content: "Terms of Use for Free-Klondike-Solitaire.com by Publish Port." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:site_name", content: "Free-Klondike-Solitaire.com" },
      { property: "og:title", content: "Terms of Use · Free-Klondike-Solitaire.com" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.free-klondike-solitaire.com/terms" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "canonical", href: "https://www.free-klondike-solitaire.com/terms" },
    ],
  }),
});

function TermsPage() {
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
        Terms of Use
      </h1>
      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Last Updated: July 29, 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">

        <Section n="1" title="Acceptance of Terms">
          <p>These Terms of Use ("Terms") describes the terms of service applicable for your access and/or use of our website located at https://www.free-klondike-solitaire.com and any services offered or provided by Publish Port ("Company", or "we", "our" or "us") through the website located at https://www.free-klondike-solitaire.com or otherwise provided by us, including but not limited to the providing a solitaire game for you to play, all other services that may be made available by us, and the content on the website (the "Site"). We own and operate the Site.</p>
          <p className="mt-3">If you are accessing and/or using our Site and/or services for an entity, such as the company you work for, you represent that you have authority to bind that entity to these Terms, and you agree that "you," and "your," and "yourself" as used in these Terms includes both you personally and the entity you represent. If you are accessing our Site and/or services on behalf of only yourself as an individual, then "you," "your," and "yourself" includes only you personally.</p>
          <p className="mt-3">These Terms constitute a legally binding agreement made between you and us. By accessing and using the Site, you represent and agree that: (i) you have read and familiarized yourself with these Terms; (ii) you understand these Terms; and (iii) you are bound by these Terms. If you do not accept and agree to all of these Terms, then you MUST NOT access and/or use this Site and/or our services.</p>
        </Section>

        <Section n="2" title="Minimum Age">
          <p>You represent to us that you are lawfully able to enter into contracts in the jurisdiction where you are a citizen (e.g., you are not a minor according to applicable local laws). The Site is not intended to be used by persons who are minors under applicable law. If you are a minor according to applicable laws, then you must not use the Site and/or any of the services offered by us.</p>
        </Section>

        <Section n="3" title="Our Site">
          <p>The Site is currently provided free of charge for personal, non-commercial entertainment and you may use the Site as often as you like from any supported browser. The Site does not currently sell in-Site items, currency or subscriptions.</p>
          <p className="mt-3">The information provided when using our Site is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Those persons who choose to access our Site from other locations do so on their own initiative and are solely responsible for compliance with local laws.</p>
        </Section>

        <Section n="4" title="User Account">
          <p>The Site does not require an account to access and/or use the Site at this time. However, in the future you may be able to create an account on our Site. By creating an account, you agree that:</p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside">
            <li>your account and password are personal to you and may not be used by anyone else to access the Site;</li>
            <li>you will not do anything which would assist anyone who is not a registered user to gain access to any registration area of the Site;</li>
            <li>you will not create registration accounts for the purpose of abusing the functionality of the Site or other users; nor will you seek to pass yourself off as another user; and</li>
            <li>you agree to notify us immediately if you become aware of any unauthorized use of your password or account identifiers by others.</li>
          </ul>
          <p className="mt-3">If you have an account but no longer wish to have it, you can delete it on the Site.</p>
        </Section>

        <Section n="5" title="Your Conduct">
          <p>By using the Site, you represent and warrant that: (i) all information you submit will be true, accurate, current, and complete; (ii) you will maintain the accuracy of such information; (iii) you have the legal capacity and agree to comply with these Terms; (iv) you are not a minor in the jurisdiction in which you reside; (v) you will not access the Site through automated or non-human means, whether through a bot, script or otherwise; (vi) you will not use the Site for any illegal or unauthorized purpose; and (vii) your use of the Site will not violate any applicable law or regulation.</p>
          <p className="mt-3">The content and information on the Site (collectively, the "Content Matter"), as well as the infrastructure used to provide such Content Matter, is proprietary to the Company. Without our prior written permission, you may not use, copy, reproduce, republish, upload, sublicense, resell, loan, post, transmit, distribute or modify our intellectual property, copyrights, trademarks or other proprietary information in any way.</p>
          <p className="mt-3">You are responsible for violations of these Terms by anyone using our Site with your permission or using your account on an unauthorized basis.</p>
        </Section>

        <Section n="6" title="Your Content">
          <p>By posting, displaying, publishing or making available for download or submitting any content by using our Site (other than personal information subject to the Privacy Policy), you hereby grant us a perpetual, worldwide, nonexclusive, irrevocable, royalty-free, sublicensable license to perform, display, reproduce, prepare derivative works from, distribute, sell, sublicense, transfer and otherwise use without restriction all or any part of such content.</p>
        </Section>

        <Section n="7" title="Reviews, Comments and Other Interactive Areas">
          <p>By submitting any message, data, information, text, music, sound, photos, graphics, code or any other content to the Site (collectively, "Submissions"), you certify that you are the rightful owner or licensee of the Submissions and you grant us a nonexclusive, royalty-free, perpetual, transferable, irrevocable and fully sublicensable right to use, reproduce, modify, adapt, translate, distribute, publish, create derivative works from and publicly display and perform such Submissions throughout the world in any media.</p>
          <p className="mt-3">We take no responsibility and assume no liability for Submissions posted, stored or uploaded by you or any third party. Although we have no obligation to screen, edit or monitor any of the Submissions, we reserve the right, and have absolute discretion, to remove, screen or edit without notice any content posted or stored on the Site at any time and for any reason.</p>
          <p className="mt-3">We enforce a zero-tolerance SPAM policy. SPAM includes bulk unsolicited e-mail, promotional material sent via the Site or e-mail, use of web pages set up to indirectly reference customers to domains hosted by us, and forging or misrepresenting message headers. You agree not to use the Site for the purpose of recruiting for another website and/or app and/or service that offers competing functionality.</p>
        </Section>

        <Section n="8" title="Intellectual Property Rights">
          <p>Unless otherwise indicated, we own all rights, title and interest in the Site and the Site is our proprietary property. All source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.</p>
          <p className="mt-3">The Content and the Marks are provided on the Site "AS IS" and "AS AVAILABLE" for your information and personal use only. No part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.</p>
        </Section>

        <Section n="9" title="Prohibited Activities">
          <p>You may not access or use the Site for any purpose other than that for which we make the Site available. As a user of the Site, you agree not to:</p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside">
            {[
              "Systematically retrieve data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.",
              "Use the Site to advertise or offer to sell goods and services.",
              "Engage in unauthorized framing of or linking to the Site.",
              "Provide false or misleading information about yourself to us.",
              "Attempt to impersonate another user or person, or otherwise attempt to mislead others about your identity or the origin of any Content, message or other communication.",
              "Use any information obtained from the Site in order to harass, abuse, or harm another person.",
              "Use the Site in any manner that could damage, disable, overburden, or impair the Site or interfere with any other party's use and enjoyment of the Site.",
              "Collect information about other visitors to our Site without their consent or otherwise systematically extract data or data fields, including without limitation any financial data or email addresses.",
              "Sell and/or resell access to the Site.",
              "Manipulate the Site in any way, shape or form.",
              "Create deep-links to the Site including but not limited to by bypassing the Site's pages, mirroring or similar navigational technology.",
              "Probe, scan, test the vulnerability of or breach the authentication measures of the Site or any related web pages, apps, networks or systems.",
              "Use any robot, spider, scraper, deep link or other automated or manual means to access the Site, or copy and/or redistribute any Content, information or software on the Site.",
              "Misuse of APIs.",
              "Attempt to modify, translate, adapt, edit, decompile, disassemble, or reverse engineer any software programs used by us in connection with the Site.",
              "Input or upload to the Site any information that contains viruses, Trojan horses, worms, time bombs or other computer programming routines that are intended to damage, interfere with, intercept or expropriate any system.",
              "Use or access the Site in any way that violates the law or for any illegal activities.",
              "Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.",
              "Circumvent, disable, or otherwise interfere with security-related features of the Site.",
              "Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Site.",
              "Make improper use of our support services or submit false reports of abuse or misconduct.",
              "Delete the copyright or other proprietary rights notice from any Content.",
              "Copy or adapt the Site's software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.",
              "Use the Site as part of any effort to compete with us or otherwise use the Site and/or the Content for any revenue-generating endeavor or commercial enterprise.",
            ].map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </Section>

        <Section n="10" title="Third-Party Services">
          <p>The Site may be integrated and/or have API reliance from Google, Google Adsense, and other third parties. We do not guarantee any continued availability of the API reliance on third parties, including if those third parties change or revoke access to the APIs.</p>
          <p className="mt-3">The Site may make available, or third parties (including, but not limited to Google Adsense) may provide, links to other websites, apps, applications, resources, advertisements, content or other products or services ("Third-Party Service"). When you access or use a Third-Party Service, you are interacting with the applicable third party, not with us, and you do so solely at your own risk. We are not responsible for, and make no warranties as to, the Third-Party Services or the providers of such Third-Party Services.</p>
        </Section>

        <Section n="11" title="Interruptions">
          <p>We cannot guarantee the Site will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Site, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Site at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Site during any downtime or discontinuance of the Site.</p>
        </Section>

        <Section n="12" title="Privacy Policy">
          <p>Our Privacy Policy (currently published at https://www.free-klondike-solitaire.com/privacy) applies to your access and/or use of the Site and its terms are incorporated into these Terms by this reference. By accessing and/or using the Site and/or our services, you acknowledge and agree that Internet transmissions are never completely private or secure. The Privacy Policy may be changed from time to time and such changes are effective immediately upon their posting.</p>
        </Section>

        <Section n="13" title="Cookies Policy">
          <p>We and our partners (including, but not limited to Google Adsense) use cookies or similar technologies to optimize the functionality of the Site, to help us understand how the Site is used, and to provide you with interest-based advertising. For more information about the cookies and similar technologies used on our Site, please refer to our Cookie Policy located in our Privacy Policy (currently published at https://www.free-klondike-solitaire.com/privacy).</p>
        </Section>

        <Section n="14" title="Disclaimer of Warranties">
          <p>The Site is provided on an "AS IS" and "AS AVAILABLE" basis. The information on our Site may be inaccurate and/or incomplete. You agree that your use of the Site will be at your sole risk.</p>
          <p className="mt-3">To the fullest extent permitted by law, we disclaim all warranties, express or implied, in connection with the Site and your use thereof, including, without limitation, the implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We assume no liability or responsibility for any: (i) errors, mistakes or inaccuracies of data or information; (ii) personal injury or property damage resulting from use of the Site; (iii) any interruption or cessation of transmission to or from the Site; (iv) lack of revenue impact; or (v) the defamatory, offensive or illegal conduct of any third party not under our control.</p>
        </Section>

        <Section n="15" title="Limitation of Liability">
          <p>In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages arising from your use of the Site.</p>
        </Section>

        <Section n="16" title="Compliance with Laws">
          <p>You represent that, in agreeing to, and performing under, these Terms, you are not violating, and will not violate, any governmental laws, rules, regulations or orders that are applicable to your use of the Site ("Applicable Laws"). Without limiting the foregoing, you represent that, in connection with your performance under these Terms, you shall: (i) comply with Applicable Laws relating to anti-bribery and anti-corruption, including, but not limited to the US Foreign Corrupt Practices Act of 1977; (ii) comply with Applicable Laws administered by the U.S. Commerce Bureau of Industry and Security, U.S. Treasury Office of Foreign Assets Control or other governmental entity imposing export controls and trade sanctions ("Export Laws"); and (iii) not directly or indirectly export, re-export or otherwise deliver any of our software, content or services in violation of any Export Laws.</p>
        </Section>

        <Section n="17" title="Void Where Prohibited">
          <p>Although our Site is accessible worldwide, not all features, products or services discussed, referenced, provided or offered through our Site are available to all persons or in all geographic locations, or appropriate or available for use outside the United States. We reserve the right to limit, in our sole discretion, the provision and quantity of any feature, product or service to any person or geographic area. Any offer for any feature, product or service made in our Site is void where prohibited. If you choose to access our Site from outside the United States, you do so on your own initiative and you are solely responsible for complying with applicable local laws.</p>
        </Section>

        <Section n="18" title="User Responsibility">
          <p>You are responsible for violations of these Terms by anyone using our Site with your permission or using your account on an unauthorized basis. Your use of the Site to assist another person in an activity that would violate these Terms if performed by you is a violation of these Terms. These Terms apply to anyone accessing or using the Site; however, each provision in these Terms shall be interpreted to include, and apply to, any action directly or indirectly taken, authorized, facilitated, promoted, encouraged or permitted by a user of the Site.</p>
        </Section>

        <Section n="19" title="Governing Law">
          <p>These Terms and your use of the Site are governed by and construed in accordance with the laws of the State of California applicable to agreements made and to be entirely performed within the State of California, without regard to its conflict of law principles.</p>
        </Section>

        <Section n="20" title="Dispute Resolution">
          <p>If you and us have any dispute, controversy and/or claim related to these Terms ("Dispute"), then you and us both agree that such Dispute (except those Disputes expressly excluded below) will be finally and exclusively resolved by final and binding arbitration. YOU UNDERSTAND THAT WITHOUT THIS PROVISION, YOU WOULD HAVE THE RIGHT TO SUE IN COURT AND HAVE A JURY TRIAL. The arbitration shall be commenced and conducted under the Commercial Arbitration Rules of the American Arbitration Association ("AAA").</p>
          <p className="mt-3">If for any reason, a Dispute proceeds in court rather than arbitration, the Dispute shall be commenced or prosecuted in the state or federal courts located in Sacramento, California, and both you and us hereby consent to, and waive all defenses of lack of personal jurisdiction, and forum non conveniens with respect to venue and jurisdiction in such state and federal courts.</p>
          <p className="mt-3">In no event shall any Dispute brought by either you or us related in any way to the Site be commenced more than one (1) year after the cause of action arose.</p>
          <p className="mt-3">You and us both agree that any arbitration shall be limited to the Dispute between the parties individually. To the full extent permitted by law: (i) no arbitration shall be joined with any other proceeding; (ii) there is no right or authority for any Dispute to be arbitrated on a class-action basis; and (iii) there is no right or authority for any Dispute to be brought in a purported representative capacity on behalf of the general public or any other persons.</p>
          <p className="mt-3">The following Disputes are not subject to the above arbitration provisions: (i) any Disputes seeking to enforce or protect, or concerning the validity of, any intellectual property rights; (ii) any Dispute related to, or arising from, allegations of theft, piracy, invasion of privacy, or unauthorized use; and (iii) any claim for injunctive relief.</p>
        </Section>

        <Section n="21" title="Termination">
          <p>You agree that we, in our sole discretion, may terminate or suspend your use or access to the Site at any time and for any or no reason, without prior notification, even if access and use continues to be allowed to others. Upon such suspension or termination, you must immediately discontinue use of the Site and the services. Accessing the Site after such termination, suspension or discontinuation shall constitute an act of trespass. Further, you agree that we shall not be liable to you or any third party for any termination or suspension of your access to the Site.</p>
        </Section>

        <Section n="22" title="Electronic Communications">
          <p>When you visit the Site and/or use our services and/or send emails to us, you are communicating with us electronically, and you consent to receive communications from us electronically. We may communicate with you by email or by posting notices on the Site. You agree that all agreements, notices, disclosures and other communications that we provide to you electronically satisfy any legal requirement that such communications be in writing.</p>
          <p className="mt-3">You have a right to withdraw your consent to receive electronic communications at any time by contacting us via email at <a href="mailto:contact@free-klondike-solitaire.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@free-klondike-solitaire.com</a> with the subject line "Terms."</p>
        </Section>

        <Section n="23" title="Employment Opportunities">
          <p>We may, from time to time, post employment opportunities on the Site and/or invite users to submit applications for employment. If you choose to submit your name, contact information, resume and/or other personal information to us in response to such employment listings, you are authorizing us to use this information for all lawful and legitimate hiring and employment purposes. Nothing in these Terms shall constitute a promise by us to review any such information, or to contact, interview or employ any individual who submits such information.</p>
        </Section>

        <Section n="24" title="Copyright Infringement Notice and Takedown Policy">
          <p>We respect the rights of copyright holders and abide by the federal Digital Millennium Copyright Act ("DMCA") and similar regulations in other jurisdictions by responding to written notifications of alleged infringement by copyright holders.</p>
          <div className="mt-4 space-y-4">
            <SubSection title="24.1 Reporting Instances of Copyright Infringement">
              If you believe that any content residing or accessible on or through the Site infringes your copyright, please send a notice of copyright infringement to <a href="mailto:contact@free-klondike-solitaire.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@free-klondike-solitaire.com</a> with the subject line "DMCA." The notice must include: identification of the allegedly infringed work; identification and location of the allegedly infringing material; your contact information; if you are not the copyright owner, a description of your relationship to the copyright holder; a good faith belief statement; a statement under penalty of perjury that the information is accurate; and a physical or electronic signature.
            </SubSection>
            <SubSection title="24.2 Our Response To A Copyright Infringement Notification">
              Following receipt of a proper written notification, we will promptly remove or disable access to the allegedly infringing content and notify the user who posted the material.
            </SubSection>
            <SubSection title="24.3 Submitting A DMCA Counter-Notification">
              If you believe your content was removed or disabled by mistake or misidentification, you may send us a counter-notification to <a href="mailto:contact@free-klondike-solitaire.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@free-klondike-solitaire.com</a> with the subject line "DMCA" that includes: identification of the removed material and its prior location; your contact information; a consent to jurisdiction statement; a statement under penalty of perjury that the material was removed by mistake; and your physical or electronic signature.
            </SubSection>
            <SubSection title="24.4 Repeat Infringer Policy">
              We have adopted a policy of terminating access to the Site for any users who, in our sole discretion, are deemed to be repeat infringers.
            </SubSection>
            <SubSection title="24.5 Copyright Agent Contact Information">
              Both infringement notifications and counter notifications should be submitted to our Copyright Agent via email at <a href="mailto:contact@free-klondike-solitaire.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@free-klondike-solitaire.com</a> with the subject line "DMCA."
            </SubSection>
          </div>
        </Section>

        <Section n="25" title="Violation of Terms">
          <p>We may disclose any information we have about you including your identity if we determine that such disclosure is necessary in connection with any investigation or complaint regarding your use of the Site, or to identify, contact or bring legal action against someone who may be causing injury to or interference with our rights or property, or the rights or property of visitors to the Site.</p>
          <p className="mt-3">You agree that we may, in our sole discretion and without prior notice, suspend or terminate your access to the Site for reasons including but not limited to: (i) requests by law enforcement or other government agencies; (ii) a request by you; (iii) discontinuance or material modification of the Site; (iv) unexpected technical issues or problems; (v) non-payment of services when owed; (vi) any abuse, as decided in our sole discretion; (vii) our determination that you have violated any law; or (viii) our determination that you have violated these Terms.</p>
          <p className="mt-3">If we take any legal action against you as a result of your violation of these Terms, we will be entitled to recover from you, and you agree to pay, any and all reasonable attorneys' fees and costs of such action, in addition to any other relief granted to us.</p>
        </Section>

        <Section n="26" title="Indemnity">
          <p>You agree to defend, indemnify and hold harmless us, our affiliates, subsidiaries, employees, contractors, partners, investors, agents, officers, directors, successors and assigns from and against any and all complaints, claims, damages, obligations, losses, liabilities, costs and expenses, including without limitation attorneys' fees, whether known or unknown, whether at law or in equity, arising out of or relating to: (i) your use, misuse and/or unlawful use of the Site and/or services; (ii) your breach of these Terms and/or our Privacy Policy; (iii) your violation of any law or the rights of a third party; or (iv) any content that you post, upload or cause to interface with the Site and/or services.</p>
        </Section>

        <Section n="27" title="Advertising">
          <p>You will see advertising material submitted by third parties on the Site. Each individual advertiser is solely responsible for the content of its advertising material. We accept no responsibility for the content of advertising material, including, without limitation, any error, omission, or inaccuracy therein.</p>
          <p className="mt-3">If you are interested in advertising on our Site, please contact us via email at <a href="mailto:contact@free-klondike-solitaire.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@free-klondike-solitaire.com</a> with the subject line "Ads."</p>
        </Section>

        <Section n="28" title="Link Usage and Requests">
          <p>The following organizations may link to our Site without our prior written approval: government agencies; search engines; news organizations; online directory distributors; and system wide accredited businesses (except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups).</p>
          <p className="mt-3">These organizations may link to our home page so long as the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement or approval of the linking party and its products and/or services; and (c) fits within the context of the linking party's site.</p>
          <p className="mt-3">If you are interested in linking to our Site, you must inform us by contacting us via email at <a href="mailto:contact@free-klondike-solitaire.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@free-klondike-solitaire.com</a> with the subject line "Link Requests," providing your name, organization name, contact information, the URL of your site, a list of any URLs from which you intend to link to our Site, and a list of the URLs on our site to which you would like to link. It may take us 2–3 weeks to respond. No use of the Company's logo or other artwork will be allowed for linking absent a written trademark license agreement signed by the parties.</p>
        </Section>

        <Section n="29" title="Changes to Terms">
          <p>We reserve the right, at our sole discretion, to change, modify, add or remove all or portions of these Terms at any time. It is your responsibility to check these Terms periodically for changes. If we make any material changes to these Terms, we will update these Terms and change the "Last Updated" date at the top of these Terms. Your continued use of our Site and/or our services following the posting of any changes will mean that you accept and agree to the changes.</p>
        </Section>

        <Section n="30" title="Miscellaneous">
          <p>These Terms, the Privacy Policy, and any policies and/or operating rules posted by us on our Site constitute the complete and exclusive statement of the agreement between you and us concerning this subject matter and supersede all proposals, oral or written, and all other communications between you and us relating to the subject matter of these Terms.</p>
          <p className="mt-3">These Terms do not, and shall not be construed to, create any partnership, joint venture, employer-employee, agency or franchisor-franchisee relationship between you and us. You may not assign, transfer or sublicense all or any of your rights or obligations under these Terms without our express prior written consent. We may assign, transfer or sublicense all or any of our rights or obligations under these Terms without restriction. Our failure to exercise or enforce any condition, term or provision of these Terms will not operate as a waiver of such condition, term or provision. If any provision of these Terms is held invalid or unenforceable, the remainder of these Terms shall continue in full force and effect.</p>
          <p className="mt-3">If any non-English translations of these Terms are provided, it is for convenience only. In the event of any ambiguity or conflict between translations, the English version is authoritative and controls.</p>
        </Section>

        <Section n="31" title="Contact Us">
          <p>In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site or if you have a question about these Terms, please contact us via email at <a href="mailto:contact@free-klondike-solitaire.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@free-klondike-solitaire.com</a> with the subject line "Terms" and please make sure you provide us with enough information in the email so we can clearly understand the issue.</p>
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
