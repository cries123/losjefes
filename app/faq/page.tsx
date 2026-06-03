import { SiteFooter, SiteNav } from "@/components/SiteChrome";

export const metadata = {
  title: "FAQ | Los Jefes Taco Catering",
  description: "Setup, travel, deposit, and cancellation answers for Los Jefes catering."
};

export default function FaqPage() {
  return (
    <main>
      <SiteNav />
      <section className="section faqSection pageSection" id="faq">
        <div className="sectionHeading reveal">
          <p className="eyebrow">FAQ</p>
          <h1>Quick answers before guests book.</h1>
        </div>
        <div className="faqGrid">
          <details className="faqItem reveal" open>
            <summary>What do you need for setup?</summary>
            <p>
              We recommend a flat serving area with access to parking nearby.
              Add venue notes during booking so the team can confirm the best
              setup plan.
            </p>
          </details>
          <details className="faqItem reveal">
            <summary>How far do you travel?</summary>
            <p>
              Los Jefes serves Paso Robles to Santa Barbara. We can travel
              farther for an added expense; add the event city and venue notes
              so the team can confirm availability and any travel fee.
            </p>
          </details>
          <details className="faqItem reveal">
            <summary>How does the deposit work?</summary>
            <p>
              A 20% deposit secures the weekend slot. Guests can pay now through
              Stripe or submit as Pay Later so the team can contact them.
            </p>
          </details>
          <details className="faqItem reveal">
            <summary>What is the cancellation policy?</summary>
            <p>
              Add the final cancellation policy here once it is set. For now,
              guests should contact Los Jefes as early as possible if plans
              change.
            </p>
          </details>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
