import type { Metadata } from "next";
import { FadeIn } from "@/components/atoms/FadeIn";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { PORTAL_PATHS } from "@/lib/sites";

export const metadata: Metadata = {
  title: "Platform Features",
  description: "Form notifications, unlimited inbox, API keys, and spam protection.",
};

const features = [
  {
    title: "Unlimited in-site notifications",
    body: "Every submission is stored in your portal inbox — no monthly cap on messages you can read.",
  },
  {
    title: "Email alerts to your business",
    body: "Get notified at your owner email when someone submits a form on your site.",
  },
  {
    title: "API key for website forms",
    body: "One Form API key for your sites. Create, rotate, or revoke it from the portal.",
  },
  {
    title: "Built-in spam protection",
    body: "Honeypot fields and origin checks keep junk out of your inbox.",
  },
  {
    title: "Submitter confirmations",
    body: "Team sends a confirmation email to the person who filled out the form.",
  },
  {
    title: "Stripe billing portal",
    body: "Upgrade, change cards, or cancel from the customer portal when you are ready.",
  },
] as const;

export default function PortalFeaturesPage() {
  return (
    <div>
      <FadeIn>
        <p className="mb-6 font-label text-xs uppercase tracking-[0.4em] text-outline">
          Features
        </p>
        <h1 className="max-w-3xl font-headline text-4xl font-bold tracking-tighter text-white md:text-6xl">
          Everything you need for form notifications.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-on-surface-variant">
          Wire your contact forms once. We handle storage, email delivery, and the owner inbox.
        </p>
      </FadeIn>

      <ul className="mt-16 grid gap-8 md:grid-cols-2">
        {features.map((feature) => (
          <li
            key={feature.title}
            className="border border-outline-variant/10 bg-surface-container-low p-8"
          >
            <div className="flex gap-4">
              <MaterialIcon name="check" className="mt-1 text-white" />
              <div>
                <h2 className="font-headline text-xl font-bold text-white">{feature.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  {feature.body}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-14">
        <a
          href={PORTAL_PATHS.login}
          className="inline-block bg-primary px-8 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-80"
        >
          Login to get started
        </a>
      </div>
    </div>
  );
}
