import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Use · Solitaire Station" },
      { name: "description", content: "Terms of Use for Solitaire Station — free online solitaire with no sign-up required." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:title", content: "Terms of Use · Solitaire Station" },
      { property: "og:description", content: "Terms of Use for Solitaire Station. Free to play, no sign-up required." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/terms` },
      { property: "og:image", content: `${SITE_URL}/og/klondike.png?v=6` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:image", content: `${SITE_URL}/og/klondike.png?v=6` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/terms` },
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
        Last Updated: August 2, 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">

        <Section n="1" title="Acceptance of Terms">
          <p>These Terms of Use ("Terms") describes the terms of service applicable for your access and/or use of our website located at https://www.solitairestation.com and any services offered or provided by Publish Port ("Company", or "we", "our" or "us") through the website located at https://www.solitairestation.com or otherwise provided by us, including but not limited to the providing a solitaire game for you to play, all other services that may be made available by us, and the content on the website (the "Site"). We own and operate the Site.</p>
          <p className="mt-3">If you are accessing and/or using our Site and/or services for an entity, such as the company you work for, you represent that you have authority to bind that entity to these Terms, and you agree that "you," and "your," and "yourself" as used in these Terms includes both you personally and the entity you represent. If you are accessing our Site and/or services on behalf of only yourself as an individual, then you agree that "you," and "your," and "yourself" as used in these Terms includes only you personally as an individual.</p>
          <p className="mt-3">These Terms constitute a legally binding agreement made between you and us. By accessing and using the Site, you represent and agree that: (i) you have read and familiarized yourself with these Terms; (ii) you understand these Terms, and (iii) you are bound by these Terms. If you do not accept and agree to all of these Terms, then you MUST NOT access and/or use this Site and/or our services.</p>
        </Section>

        <Section n="2" title="Minimum Age">
          <p>You represent to us that you are lawfully able to enter into contracts in the jurisdiction where you are a citizen (e.g., you are not a minor according to applicable local laws). The Site is not intended to be used by persons who are minors under applicable law. If you are a minor according to applicable laws, then you must not use the Site and/or any of the services offered by us.</p>
        </Section>

        <Section n="3" title="Our Site">
          <p>The Site is currently provided free of charge for personal, non-commercial entertainment and you may use the Site as often as you like from any supported browser. The Site does not currently sell in-Site items, currency or subscriptions.</p>
          <p className="mt-3">The information provided when using our Site is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access our Site from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.</p>
        </Section>

        <Section n="4" title="User Account">
          <p>The Site does not require an account to access and/or use the Site at this time. However, in the future you may be able to create an account on our Site. By creating an account, you agree that:</p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside">
            <li>your account and password are personal to you and may not be used by anyone else to access the Site;</li>
            <li>you will not do anything which would assist anyone who is not a registered user to gain access to any registration area of the Site;</li>
            <li>you will not create registration accounts for the purpose of abusing the functionality of the Site, or other users; nor will you seek to pass yourself off as another user; and</li>
            <li>you agree to notify us immediately if you become aware any unauthorized use of your password or account identifiers by others.</li>
          </ul>
          <p className="mt-3">If you have an account; however, you no longer wish to have that account, then you can delete it on the Site.</p>
        </Section>

        <Section n="5" title="Your Conduct">
          <p>By using the Site, you represent and warrant that: (i) all information you submit to us will be true, accurate, current, and complete; (ii) you will maintain the accuracy of such information and promptly update such information as necessary; (iii) you have the legal capacity and you agree to comply with these Terms; (iv) you are not a minor in the jurisdiction in which you reside; (v) you will not access the Site through automated or non-human means, whether through a bot, script or otherwise; (vi) you will not use the Site for any illegal or unauthorized purpose; and (vii) your use of the Site will not violate any applicable law or regulation.</p>
          <p className="mt-3">The content and information on the Site (collectively, the "Content Matter"), as well as the infrastructure used to provide such Content Matter, is proprietary to the Company. Without our prior written permission, you may not use, copy, reproduce, republish, recreate, upload, sublicense, resell, loan, post, transmit, distribute or modify our intellectual property, copyrights, trademarks or other proprietary information in any way. You agree to follow all applicable laws and regulations when using the Site.</p>
          <p className="mt-3">You are responsible for violations of these Terms by anyone using our Site and/or services with your permission or using your account on an unauthorized basis. Your use of the Site and/or services to assist another person in an activity that would violate these Terms if performed by you is a violation of these Terms. These Terms apply to anyone accessing or using the Site and/or services; however, each provision in these Terms shall be interpreted to include, and apply to, any action directly or indirectly taken, authorized, facilitated, promoted, encouraged or permitted by a user of the Site and/or services, even if such person did not themselves violate the provision.</p>
        </Section>

        <Section n="6" title="Your Content">
          <p>By posting, displaying, publishing or making available for download or submitting any content by using our Site (other than personal information that is subject to the Privacy Policy), you hereby grant us a perpetual, worldwide, nonexclusive, irrevocable, royalty-free, sublicensable license to perform, display, reproduce, prepare derivative works from, distribute, sell, sublicense, transfer and otherwise use without restriction all or any part of such content.</p>
        </Section>

        <Section n="7" title="Reviews, Comments and Other Interactive Areas">
          <p>By submitting any message, data, information, text, music, sound, photos, graphics, code or any other content to the Site and/or concerning the Site and/or services by electronic mail, postings on the Site and/or concerning the Site and/or services, or other social network platforms operated by us, including but not limited to any questions, comments, suggestions, ideas or the like contained in any submissions (collectively, "Submissions"), you are certifying that you are the rightful owner or licensee of the Submissions and you grant us a nonexclusive, royalty-free, perpetual, transferable, irrevocable and fully sublicensable right to: (i) use, reproduce, modify, adapt, translate, distribute, publish, create derivative works from and publicly display and perform such Submissions throughout the world in any media, now known or hereafter devised; and (ii) use the name that you submit in connection with such Submission. You acknowledge that we may choose to provide attribution of your comments or reviews at our sole discretion. You further grant we have the right to pursue at law or in equity any person or entity that violates your or our rights in the Submissions. You acknowledge and agree that all Submissions are non-confidential and non-proprietary.</p>
          <p className="mt-3">The Site, the services and our other social network platforms may contain discussion forums, bulletin boards, reviews or other means in which you or third parties may post content, messages, materials or other items on the Site and/or the services ("Interactive Areas"). If we provide such Interactive Areas, then you are solely responsible for your use of such Interactive Areas and use them at your own risk. By using any Interactive Areas, you expressly agree not to post, upload to, transmit, distribute, store, create or otherwise publish through the Site and/or the services and/or our other social network platforms any of the following: (i) Submissions that are unlawful, libelous, defamatory, obscene, pornographic, indecent, lewd, suggestive, harassing, threatening, invasive of privacy or publicity rights, abusive, inflammatory, fraudulent, promoting racism and bigotry, or otherwise objectionable; (ii) Submissions that would constitute, encourage or provide instructions for a criminal offense, violate the rights of any party, or that would otherwise create liability or violate any local, state, national or international law; (iii) Submissions that may infringe any patent, trademark, trade secret, copyright or other intellectual or proprietary right of any party; (iv) Submissions that impersonate any person or entity or otherwise misrepresents your affiliation with a person or entity; (v) unsolicited promotions, political campaigning, advertising, contests, raffles, or solicitations; (vi) private information of any third party; (vii) viruses, corrupted data or other harmful, disruptive or destructive files; (viii) Submissions that are unrelated to the topic of the Interactive Area(s); and/or (ix) Submissions or links to content that violates the previous subsections, is objectionable, restricts or inhibits any other person from using the Site, or exposes us or our customers to any harm or liability of any type.</p>
          <p className="mt-3">We take no responsibility and assume no liability for Submissions posted, stored or uploaded by you or any third party. Although we have no obligation to screen, edit or monitor any of the Submissions, we reserve the right, and have absolute discretion, to remove, screen or edit without notice any content posted or stored on the Site at any time and for any reason.</p>
          <p className="mt-3">We enforce a zero-tolerance SPAM policy. SPAM includes bulk unsolicited e-mail, promotional material sent via the Site, use of web pages set up to directly or indirectly reference customers to domains or IP addresses hosted by us, and forging or misrepresenting message headers. You agree not to use the Site and/or services for the purpose of recruiting for another website and/or app and/or service that offers competing functionality.</p>
          <p className="mt-3">If it is determined that you retain moral rights (including rights of attribution or integrity) in Submissions, then you hereby declare that: (i) you do not require that any personally identifying information be used in connection with the Submission; (ii) you have no objection to the publication, use, modification, deletion and exploitation of the Submission by us or our licensees, successors and assigns; (iii) you forever waive and agree not to claim or assert any entitlement to any and all moral rights of an author in any of the Submission; and (iv) you forever release us, and our licensees, successors and assigns, from any claims that you could otherwise assert against us by virtue of any such moral rights.</p>
        </Section>

        <Section n="8" title="Social Media">
          <p>By using the Site you may be able to link your account with online accounts you have with third party service providers (each being a "Third Party Account") by either: (i) providing your Third Party Account login information through the Site or (ii) allowing us to access your Third Party Account as permitted under the applicable terms and conditions that govern your use of your Third Party Account and without obligating us to pay any fees or making us subject to any usage limitations that may be imposed by the third party service provider of the Third Party Account. By granting us access to any Third Party Accounts, you understand and agree that: (a) we may access, make available and store any content that you have provided to and stored in your Third Party Account (the "Social Network Content") so that it is available on and through the Site via your account including, but not limited to any of your friends lists; and (b) we may submit to and receive from your Third Party Account additional information to the extent you are notified when you link your account with the Third Party Account.</p>
          <p className="mt-3">Personally identifiable information that you post to your Third Party Accounts may be available on and through the Site depending on the Third Party Accounts you choose and also subject to the privacy settings you have set in such Third Party Accounts. The Social Network Content may no longer be available on and through the Site if a Third Party Account or associated service becomes unavailable or our access to such Third Party Account is terminated by the third party service provider. Your relationship with the third party service providers associated with your Third Party Accounts is governed solely by your agreement(s) with such third party service providers. We do not review any Social Network Content for any purpose including, but not limited to for accuracy, legality or non-infringement and we are not responsible for any Social Network Content.</p>
          <p className="mt-3">You acknowledge and agree that we may access your email address book and other information including but not limited to your contacts list stored on your mobile device or tablet associated with a Third Party Account. You may deactivate the connection between the Site and your Third Party Account by contacting us by email at <a href="mailto:contact@solitairestation.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@solitairestation.com</a> or through your account settings, if applicable. We will attempt to delete any information stored on our servers that was obtained through such Third Party Account except for the username and profile picture that become associated with your account.</p>
        </Section>

        <Section n="9" title="Intellectual Property Rights">
          <p>Unless otherwise indicated, we own all rights, title and interest in the Site and the Site is our proprietary property. All source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.</p>
          <p className="mt-3">The Content and the Marks are provided on the Site "AS IS" and "AS AVAILABLE" for your information and personal use only. No part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission. You may not, either directly or through the use of any device, software, online resource or other means, remove, alter, bypass, avoid, interfere with or circumvent any copyright, trademark or other proprietary notice on our Site or in our Content or in our Marks or any digital rights management mechanism, device, or other content protection or access control measure associated with our Site or Content.</p>
        </Section>

        <Section n="10" title="Prohibited Activities">
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
              "Provide us with any information or submit any information to us if you are not expressly authorized by such party to do so.",
              "Collect information about other visitors to our Site without their consent or otherwise systematically extract data or data fields, including without limitation any financial data or email addresses.",
              "Sell and/or resell access to the Site.",
              "Manipulate the Site in any way, shape or form.",
              "Creating deep-links to the Site including but not limited to by bypassing the Site's pages, mirroring or similar navigational technology or directly link to any portion of the Site.",
              "Probe, scan, test the vulnerability of or breach the authentication measures of the Site or any related web pages, apps, networks or systems.",
              "Use any robot, spider, scraper, deep link or other automated or manual means to access the Site, or copy and/or redistribute any Content, information or software on the Site.",
              "Misuse of APIs.",
              "Attempt to modify, translate, adapt, edit, decompile, disassemble, or reverse engineer any software programs used by us in connection with the Site.",
              "Input or upload to the Site any information that contains viruses, Trojan horses, worms, time bombs or other computer programming routines that are intended to damage, interfere with, intercept or expropriate any system, the Site or information or that infringes the intellectual property rights of another.",
              "Use or access the Site in any way that violates the law or for any illegal activities.",
              "Use or access the Site in any way that, in our sole judgment, adversely affects the performance or function of the Site or interferes with the ability of authorized parties to access the Site.",
              "Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.",
              "Circumvent, disable, or otherwise interfere with security-related features of the Site, including but not limited to the features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Site and/or the Content contained therein.",
              "Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Site.",
              "Make improper use of our support services or submit false reports of abuse or misconduct.",
              "Delete the copyright or other proprietary rights notice from any Content.",
              "Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism, including without limitation, clear graphics interchange formats (\"gifs\"), 1×1 pixels, web bugs, cookies, or other similar devices (sometimes referred to as \"spyware\" or \"passive collection mechanisms\" or \"pcms\").",
              "Copy or adapt the Site's software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.",
              "Use the Site as part of any effort to compete with us or otherwise use the Site and/or the Content for any revenue-generating endeavor or commercial enterprise.",
            ].map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </Section>

        <Section n="11" title="Third-Party Services">
          <p>The Site may be integrated and/or have API reliance from Google, Google Adsense, Facebook, or other third parties. We do not guarantee any continued availability of the API reliance on third parties, including if those third parties change or revoke access to the APIs. In addition, it is your sole responsibility for providing accurate API credentials. We are not responsible or liable for any incorrect API credentials or other things that cause issues with the API.</p>
          <p className="mt-3">The Site may make available, or third parties (including, but not limited to Google Adsense) may provide, links to other websites, apps, applications, resources, advertisements, content or other products or services created, hosted or made available by third parties ("Third-Party Service"), and such third parties may use other third parties to provide portions of the Third-Party Service to you, including but not limited to technology, development or payment services. When you access or use a Third-Party Service, you are interacting with the applicable third party, not with us, and you do so solely at your own risk. We are not responsible for, and make no warranties, express or implied, as to, the Third-Party Services or the providers of such Third-Party Services including but not limited to the accuracy or completeness of the information provided by such Third-Party Services or the privacy practices of any third party. Inclusion of any Third-Party Service or a link thereto does not imply approval or endorsement of such Third-Party Service. We are not responsible or liable for the content or practices of any Third-Party Services or third party, even if such Third-Party Service links to, or is linked by, the Site.</p>
        </Section>

        <Section n="12" title="Interruptions">
          <p>We cannot guarantee the Site will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Site, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Site at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Site during any downtime or discontinuance of the Site. Nothing in these Terms will be construed to obligate us to maintain and support the Site or to supply any corrections, updates, or releases in connection therewith.</p>
        </Section>

        <Section n="13" title="Privacy Policy">
          <p>Our Privacy Policy (currently published at https://www.solitairestation.com/privacy) (the "Privacy Policy") applies to your access and/or use of the Site, and/or our services and its terms are made a part of and incorporated into these Terms by this reference. Additionally, by accessing and/or using the Site and/or our Services, you acknowledge and agree that Internet transmissions are never completely private or secure. You understand and agree that any message or information you send through the Site and/or our services may be read or intercepted by others, even if there is a special notice that a particular transmission (for example, your personal, payment or credit card information) is encrypted.</p>
          <p className="mt-3">The Privacy Policy may be changed from time to time and such changes are effective immediately upon their posting. By accessing and/or using the Site and/or our services, you acknowledge that you have read our Privacy Policy and agree to our Privacy Policy.</p>
        </Section>

        <Section n="14" title="Cookies Policy">
          <p>We and our partners (including, but not limited to Google Adsense) use cookies or similar technologies to optimize the functionality of the Site to help us understand how the Site are used and provide you with interest-based advertising based upon a user's browsing activities and interests. For more information about the cookies and similar technologies used on our Site, please refer to our Cookie Policy located in our Privacy Policy (currently published at https://www.solitairestation.com/privacy).</p>
        </Section>

        <Section n="15" title="Disclaimer of Warranties">
          <p>The Site is provided on an "AS IS" and "AS AVAILABLE" basis. The information on our Site may be inaccurate and/or incomplete. You agree that your use of the Site will be at your sole risk.</p>
          <p className="mt-3">To the fullest extent permitted by law, we disclaim all warranties, express or implied, in connection with the Site and your use thereof, including, without limitation, the implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We assume no liability or responsibility for any: (i) errors, mistakes or inaccuracies of data or information posted, displayed, published or made available for download or use pertaining to the Site; (ii) personal injury or property damage, of any nature whatsoever, resulting from use of the Site; (iii) any interruption or cessation of transmission to or from the Site, including but not limited to those occurring because of maintenance or during maintenance windows; (iv) lack of revenue impact; or (v) the defamatory, offensive or illegal conduct of any third party not under our control. The information provided on the Site is made available solely for general information purposes and is neither designed nor intended to provide legal or other professional advice. Any reliance you place on such information is strictly at your own risk.</p>
        </Section>

        <Section n="16" title="Limitation of Liability">
          <p>In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages arising from your use of the Site.</p>
        </Section>

        <Section n="17" title="Compliance with Laws">
          <p>You represent that, in agreeing to, and performing under, these Terms, you are not violating, and will not violate, any governmental laws, rules, regulations or orders that are applicable to your use of the Site ("Applicable Laws"). Without limiting the foregoing, you represent that, in connection with your performance under these Terms, you shall: (i) comply with Applicable Laws relating to anti-bribery and anti-corruption, including, but not limited to the US Foreign Corrupt Practices Act of 1977; (ii) comply with Applicable Laws administered by the U.S. Commerce Bureau of Industry and Security, U.S. Treasury Office of Foreign Assets Control or other governmental entity imposing export controls and trade sanctions (collectively, "Export Laws"); and (iii) not directly or indirectly export, re-export or otherwise deliver any of our software, content or services in violation of any Export Laws, or broker, finance or otherwise facilitate any transaction in violation of any Export Laws. You represent that you are not prohibited from receiving software, Content, or other services pursuant to these Terms under Applicable Laws, including, but not limited to the Export Laws.</p>
        </Section>

        <Section n="18" title="Void Where Prohibited">
          <p>Although our Site are accessible worldwide, not all features, products or services discussed, referenced, provided or offered through our Site are available to all persons or in all geographic locations, or appropriate or available for use outside the United States. We reserve the right to limit, in our sole discretion, the provision and quantity of any feature, product or service to any person or geographic area. Any offer for any feature, product or service made in our Site is void where prohibited. If you choose to access our Site from outside the United States, you do so on your own initiative and you are solely responsible for complying with applicable local laws. Please note that our Site may change over time without notice.</p>
        </Section>

        <Section n="19" title="User Responsibility">
          <p>You are responsible for violations of these Terms by anyone using our Site with your permission or using your account on an unauthorized basis. Your use of the Site to assist another person in an activity that would violate these Terms if performed by you is a violation of these Terms. These Terms apply to anyone accessing or using the Site; however, each provision in these Terms shall be interpreted to include, and apply to, any action directly or indirectly taken, authorized, facilitated, promoted, encouraged or permitted by a user of the Site, even if such person did not themselves violate the provision.</p>
        </Section>

        <Section n="20" title="Governing Law">
          <p>These Terms and your use of the Site are governed by and construed in accordance with the laws of the State of California applicable to agreements made and to be entirely performed within the State of California, without regard to its conflict of law principles.</p>
        </Section>

        <Section n="21" title="Dispute Resolution">
          <p>If the you and us have any dispute, controversy and/or claim related to these Terms ("Dispute"), then you and us both agree that such Dispute (except those Disputes expressly excluded below) will be finally and exclusively resolved by final and binding arbitration. YOU UNDERSTAND THAT WITHOUT THIS PROVISION, YOU WOULD HAVE THE RIGHT TO SUE IN COURT AND HAVE A JURY TRIAL. The arbitration shall be commenced and conducted under the Commercial Arbitration Rules of the American Arbitration Association ("AAA") and, where appropriate, the AAA's Supplementary Procedures for Consumer Related Disputes ("AAA Consumer Rules"), both of which are available at the American Arbitration Association (AAA) website. The arbitration fees and each party's share of arbitrator compensation shall be governed by the AAA Consumer Rules and, where appropriate, limited by the AAA Consumer Rules. The arbitration may be conducted in person, through the submission of documents, by phone, or online. The arbitrator will make a decision in writing, but need not provide a statement of reasons unless requested in writing by either you or us. The arbitrator must follow applicable law, and any award may be challenged if the arbitrator fails to do so. Except where otherwise required by the applicable AAA rules or applicable law, the arbitration will take place in Sacramento, California or the closest location in distance thereto. Except as otherwise provided herein, you or us may litigate in court to compel arbitration, stay proceedings pending arbitration, or to confirm, modify, vacate, or enter judgment on the final and binding award entered by the arbitrator.</p>
          <p className="mt-3">If for any reason, a Dispute proceeds in court rather than arbitration, the Dispute shall be commenced or prosecuted in the state or federal courts located in Sacramento, California, and both you and us hereby consent to, and waive all defenses of lack of personal jurisdiction, and forum non conveniens with respect to venue and jurisdiction in such state and federal courts. Application of the United Nations Convention on Contracts for the International Sale of Goods and the Uniform Computer Information Transaction Act (UCITA) are excluded from these Terms.</p>
          <p className="mt-3">In no event shall any Dispute brought by either you or us related in any way to the Site and/or the services be commenced more than one (1) year after the cause of action arose. If this provision is found to be illegal or unenforceable, then neither you or us will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable and such Dispute shall be decided by a court of competent jurisdiction within the state and federal courts located in Sacramento, California, and both you and us hereby consent to, and waive all defenses of lack of personal jurisdiction, and forum non conveniens with respect to venue and jurisdiction in such state and federal courts.</p>
          <p className="mt-3">You and us both agree that any arbitration shall be limited to the Dispute between the Parties individually. To the full extent permitted by law: (i) no arbitration shall be joined with any other proceeding; (ii) there is no right or authority for any Dispute to be arbitrated on a class-action basis or to utilize class action procedures; and (iii) there is no right or authority for any Dispute to be brought in a purported representative capacity on behalf of the general public or any other persons.</p>
          <p className="mt-3">You and us both agree that the following Disputes are not subject to the above provisions concerning informal negotiations binding arbitration: (i) any Disputes seeking to enforce or protect, or concerning the validity of, any of the intellectual property rights of you or us; (ii) any Dispute related to, or arising from, allegations of theft, piracy, invasion of privacy, or unauthorized use; and (iii) any claim for injunctive relief. If this provision is found to be illegal or unenforceable, then neither you nor us will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable and such Dispute shall be decided by a court of competent jurisdiction within the state and federal courts located in Sacramento, California, and both you and us agree to submit to the personal jurisdiction of that court.</p>
        </Section>

        <Section n="22" title="Termination">
          <p>You agree that we, in our sole discretion, may terminate or suspend your use or access to the Site, Content, Content Materials, information, and services at any time and for any or no reason, in our sole discretion, and without prior notification, even if access and use continues to be allowed to others. Upon such suspension or termination, you must immediately discontinue use of the Site and the services. Accessing the Site, Content, Content Materials, information, and services after such termination, suspension or discontinuation shall constitute an act of trespass. Further, you agree that we shall not be liable to you or any third party for any termination or suspension of your access to the Site, Content, Content Materials, information, and services.</p>
        </Section>

        <Section n="23" title="Electronic Communications">
          <p>When you visit the Site and/or use our services and/or send emails to us, you are communicating with us electronically; and you consent to receive communications from us electronically. We may communicate with you by email or by posting notices on the Site or by other authorized form of electronic message. You agree that all agreements, notices, disclosures and other communications that we provide to you electronically satisfy any legal requirement that such communications be in writing. You further agree that any notices provided by us electronically are deemed to be given and received on the date we transmit any such electronic communication.</p>
          <p className="mt-3">You have a right to withdraw your consent to receive electronic communications at any time, and you acknowledge that such withdrawal of consent will prohibit you from accessing and using core functionalities of the Site and/or the services. If you want to withdraw your consent to receive electronic communications, please contact us via email at <a href="mailto:contact@solitairestation.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@solitairestation.com</a> with the subject line "Terms" and please make sure you provide us with enough information in the email so we can clearly understand the issue.</p>
        </Section>

        <Section n="24" title="Employment Opportunities">
          <p>We may, from time to time, post employment opportunities on the Site and/or invite users to submit applications for employment to us. If you choose to submit your name, contact information, resume and/or other personal information to us in response to such employment listings, you are authorizing us to use this information for all lawful and legitimate hiring, employment and other business purposes. We also reserve the right, at its discretion, to forward such information to our subsidiaries and affiliates for their legitimate business purposes. Nothing in these Terms or contained in our services or on the Site will constitute a promise by us to review any such information, or to contact, interview or employ any individual who submits such information.</p>
        </Section>

        <Section n="25" title="Copyright Infringement Notice and Takedown Policy">
          <p>We respect the rights of copyright holders and abide by the federal Digital Millennium Copyright Act ("DMCA") and similar regulations in other jurisdictions by responding to written notifications of alleged infringement by copyright holders. As part of our response, we may remove or disable access to allegedly infringing material residing within our Site and our services (collectively, the "Materials"). This Copyright Infringement Notice and Takedown Policy ("DMCA Policy") supplements, and is incorporated into our Privacy Policy and all other contracts between you and us.</p>
          <div className="mt-4 space-y-4">
            <SubSection title="25.1 Reporting Instances of Copyright Infringement">
              <p>If you believe that any content residing or accessible on or through the Materials infringes your copyright, please send a notice of copyright infringement to us via email at <a href="mailto:contact@solitairestation.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@solitairestation.com</a> with the subject line "DMCA" containing the following information:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Identification of the work or material you allege has been infringed;</li>
                <li>Identification of the material that is claimed to be infringing, including its location within the Materials, with sufficient detail so that we are capable of finding it and verifying its existence;</li>
                <li>Your contact information, including your name, address, telephone number, and email address;</li>
                <li>If you are not the copyright owner, a description of your relationship to the copyright holder;</li>
                <li>A statement that you have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or law;</li>
                <li>A statement made under penalty of perjury that the information provided in the notice is accurate and that you are authorized to make the complaint on behalf of the copyright owner; and</li>
                <li>A physical or electronic signature of a person authorized to act on behalf of the owner of the copyright that has been allegedly infringed.</li>
              </ul>
              <p className="mt-2">Please note that the information provided in a notice of copyright infringement may be forwarded to the user who posted the allegedly infringing content. Additionally, under Section 512(f) of the DMCA and similar regulations in other jurisdictions, anyone who knowingly misrepresents that material or activity is infringing may be liable for damages and attorneys' fees.</p>
            </SubSection>
            <SubSection title="25.2 Our Response To A Copyright Infringement Notification">
              Following receipt of a proper written notification, we will promptly remove or disable access to the allegedly infringing content. We will also: (i) notify the user who posted the allegedly infringing material that we have removed the material or disabled access to it; and (ii) provide the user with a copy of the copyright infringement notification. We may suspend or terminate access to the Materials of users that repeatedly or egregiously infringe the copyrights of others.
            </SubSection>
            <SubSection title="25.3 Submitting A DMCA Counter-Notification">
              <p>If you believe your content was removed or disabled by mistake or misidentification, you may send us a counter-notification to <a href="mailto:contact@solitairestation.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@solitairestation.com</a> with the subject line "DMCA" that includes:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Identification of the material that has been removed or to which access has been disabled, and the location at which the material appeared before it was removed or access was disabled;</li>
                <li>Your contact information including your name, address, telephone number, and email address;</li>
                <li>A statement that you consent to the jurisdiction of the State court and U.S. Federal District Court located in Sacramento County in the State of California, and that you shall accept service of process from the person who provided the notification of infringement or an agent of such person;</li>
                <li>A statement that you swear, under penalty of perjury, that you have a good faith belief that the material was removed or disabled as a result of a mistake or misidentification of the material to be removed or disabled; and</li>
                <li>Your physical or electronic signature.</li>
              </ul>
              <p className="mt-2">Please note that under Section 512(f) of the DMCA and similar regulations in other jurisdictions, any person who knowingly misrepresents that material or activity was removed or disabled by mistake or misidentification may be subject to liability. Upon receipt of a valid counter-notification, we shall forward it to the person who submitted the infringement notification. The person who submitted the infringement notification or the copyright holder they represent shall then have ten (10) days to notify us that they have filed legal action relating to the allegedly infringing material. If we do not receive any such notification within ten (10) days, we may restore the material to the Materials.</p>
            </SubSection>
            <SubSection title="25.4 Repeat Infringer Policy">
              In accordance with the DMCA and other applicable law, we have adopted a policy of terminating access to the Materials for any users who, in our sole discretion, are deemed to be repeat infringers. We may also at our sole discretion limit and/or terminate access to the Materials of any users who infringe any intellectual property rights of others, whether or not they are repeat infringers.
            </SubSection>
            <SubSection title="25.5 Copyright Agent Contact Information">
              Both infringement notifications and counter notifications should be submitted to our Copyright Agent via email at <a href="mailto:contact@solitairestation.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@solitairestation.com</a> with the subject line "DMCA" and please make sure you provide us with enough information in the email so we can clearly understand the issue, including, but not limited to the applicable information as requested in this Section 25.
            </SubSection>
          </div>
        </Section>

        <Section n="26" title="Violation of Terms">
          <p>We may disclose any information we have about you including, but not limited to your identity if we determine that such disclosure is necessary in connection with any investigation or complaint regarding your use of the Site and/or services, or to identify, contact or bring legal action against someone who may be causing injury to or interference with either intentionally or unintentionally our rights or property, or the rights or property of visitors to or users of the Site and/or services. We reserve the right at all times to disclose any information that we deem necessary, in our sole discretion, to comply with any applicable law, regulation, legal process or governmental request. We also may disclose your information when we determine that applicable law requires or permits such disclosure, including but not limited to exchanging information with other companies and organizations for fraud protection purposes.</p>
          <p className="mt-3">You acknowledge and agree that we may preserve any transmittal or communication by you with us, and may also disclose such data if required to do so by law or if we determine that such preservation or disclosure is reasonably necessary to: (i) comply with legal process; (ii) enforce these Terms; (iii) respond to claims that any such data violates the rights of others; or (iv) protect the rights, property or personal safety of us, our employees, users of our Site and/or services or visitors to the Site and the public.</p>
          <p className="mt-3">You agree that we may, in our sole discretion and without prior notice, suspend or terminate your access to the Site and/or the services and/or block your future access to the Site and/or the services, for reasons including but not limited to: (i) requests by law enforcement or other government agencies; (ii) a request by you; (iii) discontinuance or material modification of the Site and/or the services; (iv) unexpected technical issues or problems; (v) non-payment of services when owed; (vi) any abuse, as decided in our sole discretion; (vii) our determination that you have violated any law; or (viii) our determination that you have violated these Terms or other agreements or guidelines which may be associated with your use of the Site and/or services.</p>
          <p className="mt-3">If your access to the Site and/or services and/or your future access to the Site and/or the services are terminated, you must immediately pay all outstanding amounts to us and immediately stop using our Site and services.</p>
          <p className="mt-3">If we take any legal action against you as a result of your violation of these Terms, we will be entitled to recover from you, and you agree to pay, any and all reasonable attorneys' fees and costs of such action, in addition to any other relief granted to us. You agree that we will not be liable to you or to any third party for termination of your access to the Site and/or services as a result of any violation of these Terms. You also agree that any violation by you of these Terms will constitute an unlawful and unfair business practice, and will cause irreparable harm to us, for which monetary damages would be inadequate, and you consent to us seeking any injunctive or equitable relief that we deem necessary or appropriate in such circumstances. These remedies are in addition to any other remedies we may have at law or in equity.</p>
        </Section>

        <Section n="27" title="Indemnity">
          <p>You agree to defend, indemnify and hold harmless us, our affiliates, subsidiaries, employees, contractors, partners, investors, agents, officers, directors, successors and assigns from and against any and all complaints, claims, charges, causes of action, suits, actions, demands, recoveries, damages, obligations, losses, liabilities, costs, fines, penalties, debt, expenses or other costs or expenses of any kind or nature, including without limitation attorneys' fees and accounting fees, whether known or unknown, whether at law or in equity, whether suspected or unsuspected, whether disclosed and undisclosed, arising out of, in connection with or related to any claim, suit, action or proceeding by a third party arising out of or relating to: (i) your use, misuse and/or unlawful use of the Site and/or services; (ii) your breach of these Terms and/or our Privacy Policy; (iii) your violation of any law or the rights of a third party; (iv) any AI responses; or (v) any content that you post, upload or cause to interface with the Site and/or services, or otherwise transfer, process, use or store in connection with the Site and/or services.</p>
          <p className="mt-3">You and each of your successors, assigns, subsidiaries and affiliates hereby unconditionally release and forever discharge us and each of our affiliates, subsidiaries, employees, contractors, partners, investors, agents, officers, directors, successors and assigns harmless from any and all complaints, claims, charges, causes of action, suits, actions, demands, recoveries, damages, obligations, losses, liabilities, costs, fines, penalties, debt, expenses or other costs or expenses of any kind or nature, including without limitation attorneys' fees and accounting fees, whether known or unknown, whether at law or in equity, whether suspected or unsuspected, whether disclosed and undisclosed, arising out of, in connection with or related to your use of the Site and/or the services.</p>
          <p className="mt-3">If you are using our Site and/or services on behalf of a business, that business accepts these Terms and that business will hold harmless and indemnify us, our affiliates, subsidiaries, employees, contractors, partners, investors, agents, officers, directors, successors and assigns from and against any and all complaints, claims, charges, causes of action, suits, actions, demands, recoveries, damages, obligations, losses, liabilities, costs, fines, penalties, debt, expenses or other costs or expenses of any kind or nature, including without limitation attorneys' fees and accounting fees, arising out of or relating to the use of the Site and/or our services or violation of these terms.</p>
        </Section>

        <Section n="28" title="Advertising">
          <p>You will see advertising material submitted by third parties on the Site. Each individual advertiser is solely responsible for the content of its advertising material. We accept no responsibility for the content of advertising material, including, without limitation, any error, omission, or inaccuracy therein.</p>
          <p className="mt-3">If you would like to advertise on our Site or if you are interested in advertising on our Site, please contact us via email at <a href="mailto:contact@solitairestation.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@solitairestation.com</a> with the subject line "Ads" and please make sure you provide us with enough information in the email so we can clearly understand your interest. It is important to feature advertising content that is not offensive or annoying to viewers. We accept advertising under strict guidelines and appreciate that our advertisers value their role as responsible advertisers.</p>
        </Section>

        <Section n="29" title="Link Usage and Requests">
          <p>The following organizations may link to our Site without our prior written approval: government agencies; search engines; news organizations; online directory distributors may link to our Site in the same manner as they hyperlink to the websites of other listed businesses; and system wide accredited businesses except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our Site.</p>
          <p className="mt-3">These organizations may link to our home page, to publications or to other Site information so long as the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement or approval of the linking party and its products and/or services; and (c) fits within the context of the linking party's site.</p>
          <p className="mt-3">We may consider and approve other link requests from commonly-known consumer and/or business information sources; dot.com community sites; associations or other groups representing charities; online directory distributors; internet portals; accounting, law and consulting firms; and educational institutions and trade associations.</p>
          <p className="mt-3">If you are interested in linking to our Site, you must inform us by contacting us via email at <a href="mailto:contact@solitairestation.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@solitairestation.com</a> with the subject line "Link Requests" and please make sure you provide us with enough information in the email so we can clearly understand your interest, your name, your organization name, contact information as well as the URL of your site, a list of any URLs from which you intend to link to our Site, and a list of the URLs on our site to which you would like to link. It may take us 2–3 weeks to respond.</p>
          <p className="mt-3">We will approve link requests at our own discretion. Approved organizations may link to our Site so long as the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement or approval of the linking party and its products or services; and (c) fits within the context of the linking party's site. No use of the Company's logo or other artwork will be allowed for linking absent a written trademark license agreement signed by the parties.</p>
        </Section>

        <Section n="30" title="Changes to Terms">
          <p>We reserve the right, at our sole discretion, to change, modify, add or remove all or portions of these Terms at any time. It is your responsibility to check these Terms periodically for changes. If we make any material changes to these Terms, we will update these Terms and change the "Last Updated" date at the top of these Terms. Unless otherwise indicated, any new material added to the Site and/or services will also be subject to these Terms. You must periodically review the Site and/or services for the latest information about our Terms. Your continued use of our Site and/or our services following the posting of any changes will mean that you accept and agree to the changes.</p>
        </Section>

        <Section n="31" title="Miscellaneous">
          <p>These Terms, the Privacy Policy, and any policies and/or operating rules posted by us on our Site and/or the services or in respect to our Site and/or the services or otherwise, and/or any contracts we enter into with you constitutes the complete and exclusive statement of the agreement between you and us concerning this subject matter of these Terms and supersede all proposals, oral or written, and all other communications between you and us relating to the subject matter of these Terms. Unless otherwise stated in these Terms, in the event any information posted in our services and/or on the Site from time to time conflicts with any provision of these Terms, the applicable provision of these Terms shall control. Any terms and conditions of any other instrument issued by you in connection with these Terms which are in addition to, inconsistent with or different from these Terms shall be of no force or effect.</p>
          <p className="mt-3">These Terms do not, and shall not be construed to, create any partnership, joint venture, employer-employee, agency or franchisor-franchisee relationship between you and us. You may not assign, transfer or sublicense all or any of your rights or obligations under these Terms without our express prior written consent. We may assign, transfer or sublicense all or any of our rights or obligations under these Terms without restriction. Our failure to exercise or enforce any condition, term or provision of these Terms will not operate as a waiver of such condition, term or provision. Any waiver by us of any condition, term or provision of these Terms shall not be construed as a waiver of any other condition, term or provision. If any provision of these Terms is held invalid or unenforceable, the remainder of these Terms shall continue in full force and effect. You agree that a printed version of these Terms and of any notice given in electronic form shall be admissible in judicial or administrative proceedings based upon or relating to these Terms to the same extent and subject to the same conditions as other business documents and records originally generated and maintained in printed form. We will not be responsible for failures to fulfill any obligations due to causes beyond its control. If any non-English translations of these Terms are provided, it is for convenience only. In the event of any ambiguity or conflict between translations, the English version is authoritative and controls.</p>
        </Section>

        <Section n="32" title="Contact Us">
          <p>In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site or if you have a question about these Terms, please contact us via email at <a href="mailto:contact@solitairestation.com" className="text-foreground underline underline-offset-2 hover:no-underline">contact@solitairestation.com</a> with the subject line "Terms" and please make sure you provide us with enough information in the email so we can clearly understand the issue.</p>
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
